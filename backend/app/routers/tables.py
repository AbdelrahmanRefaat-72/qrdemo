from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import Table, UserRole
from app.schemas import TableCreate, TableResponse
from app.security import require_roles

router = APIRouter(prefix="/api/tables", tags=["Tables"])

@router.get("", response_model=List[TableResponse])
async def get_tables(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Table).order_by(Table.number.asc()))
    return result.scalars().all()

@router.get("/{table_id}", response_model=TableResponse)
async def get_table(table_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Table).where(Table.id == table_id))
    table = result.scalars().first()
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")
    return table

@router.get("/by-number/{number}", response_model=TableResponse)
async def get_table_by_number(number: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Table).where(Table.number == number))
    table = result.scalars().first()
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Table {number} not found")
    return table

@router.post("", response_model=TableResponse, status_code=status.HTTP_201_CREATED)
async def create_table(
    table_in: TableCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_roles([UserRole.ADMIN]))
):
    # Check duplicate table number
    existing = await db.execute(select(Table).where(Table.number == table_in.number))
    if existing.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Table number {table_in.number} already exists")

    table = Table(
        number=table_in.number,
        capacity=table_in.capacity,
        is_active=table_in.is_active,
        qr_code_url=f"/table/{table_in.number}"
    )
    db.add(table)
    await db.commit()
    await db.refresh(table)
    return table

@router.delete("/{table_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_table(
    table_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_roles([UserRole.ADMIN]))
):
    result = await db.execute(select(Table).where(Table.id == table_id))
    table = result.scalars().first()
    if not table:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Table not found")

    await db.delete(table)
    await db.commit()
    return None
