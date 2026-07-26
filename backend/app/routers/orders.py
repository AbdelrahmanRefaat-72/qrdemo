import random
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Order, OrderItem, Product, Table, OrderStatus, PaymentMethod, UserRole, User
from app.schemas import OrderCreate, OrderResponse, OrderStatusUpdate, OrderPaymentUpdate
from app.security import require_roles, get_current_user
from app.ws_manager import ws_manager

router = APIRouter(prefix="/api/orders", tags=["Orders"])

def generate_order_number() -> str:
    return f"ORD-{random.randint(100000, 999999)}"

async def serialize_order(order: Order) -> dict:
    return {
        "id": order.id,
        "order_number": order.order_number,
        "table_id": order.table_id,
        "table_number": order.table.number if order.table else None,
        "status": order.status.value,
        "total_amount": order.total_amount,
        "payment_method": order.payment_method.value if order.payment_method else PaymentMethod.UNPAID.value,
        "customer_notes": order.customer_notes,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name_ar": item.product_name_ar,
                "product_name_en": item.product_name_en,
                "unit_price": item.unit_price,
                "quantity": item.quantity,
                "subtotal": item.subtotal,
                "notes": item.notes
            } for item in (order.items or [])
        ]
    }

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order_in: OrderCreate, db: AsyncSession = Depends(get_db)):
    # 1. Verify Table exists
    tbl_res = await db.execute(select(Table).where(Table.id == order_in.table_id))
    table = tbl_res.scalars().first()
    if not table or not table.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or inactive table")

    if not order_in.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order items cannot be empty")

    # 2. Server-side Price Calculation Security: Fetch products from database
    product_ids = [item.product_id for item in order_in.items]
    p_res = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    db_products = {p.id: p for p in p_res.scalars().all()}

    total_amount = 0.0
    order_items_to_create = []

    for item_in in order_in.items:
        product = db_products.get(item_in.product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Product ID {item_in.product_id} not found")
        if not product.is_available:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Product {product.name_en} is currently out of stock")

        subtotal = round(product.price * item_in.quantity, 2)
        total_amount += subtotal

        order_items_to_create.append(OrderItem(
            product_id=product.id,
            product_name_ar=product.name_ar,
            product_name_en=product.name_en,
            unit_price=product.price,
            quantity=item_in.quantity,
            subtotal=subtotal,
            notes=item_in.notes
        ))

    order = Order(
        order_number=generate_order_number(),
        table_id=table.id,
        status=OrderStatus.RECEIVED,
        total_amount=round(total_amount, 2),
        payment_method=PaymentMethod.UNPAID,
        customer_notes=order_in.customer_notes
    )
    
    db.add(order)
    await db.flush() # get order.id

    for item in order_items_to_create:
        item.order_id = order.id
        db.add(item)

    await db.commit()

    # Re-query with relationships loaded
    res = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.table))
        .where(Order.id == order.id)
    )
    created_order = res.scalars().first()

    # Real-time WebSocket broadcast to staff
    serialized = await serialize_order(created_order)
    await ws_manager.broadcast({
        "type": "NEW_ORDER",
        "data": serialized
    })

    return serialized

@router.get("", response_model=List[OrderResponse])
async def get_orders(
    status: Optional[OrderStatus] = None,
    table_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Order).options(selectinload(Order.items), selectinload(Order.table)).order_by(Order.created_at.desc())

    if status:
        query = query.where(Order.status == status)
    if table_id:
        query = query.where(Order.table_id == table_id)

    result = await db.execute(query)
    orders = result.scalars().all()

    return [await serialize_order(o) for o in orders]

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.table))
        .where(Order.id == order_id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return await serialize_order(order)

@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    status_in: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.KITCHEN, UserRole.WAITER, UserRole.CASHIER]))
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.table))
        .where(Order.id == order_id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order.status = status_in.status
    order.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(order)

    serialized = await serialize_order(order)
    # Broadcast status change to connected customer tracker & staff
    await ws_manager.notify_order_update(serialized)

    return serialized

@router.put("/{order_id}/pay", response_model=OrderResponse)
async def process_order_payment(
    order_id: int,
    payment_in: OrderPaymentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.CASHIER]))
):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.table))
        .where(Order.id == order_id)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order.payment_method = payment_in.payment_method
    order.status = OrderStatus.PAID
    order.updated_at = datetime.utcnow()
    await db.commit()

    serialized = await serialize_order(order)
    await ws_manager.notify_order_update(serialized)

    return serialized
