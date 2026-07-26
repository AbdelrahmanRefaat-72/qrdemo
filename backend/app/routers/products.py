import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.config import settings
from app.database import get_db
from app.models import Product, Category, UserRole
from app.schemas import ProductCreate, ProductUpdate, ProductResponse
from app.security import require_roles

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse])
async def get_products(
    category_id: Optional[int] = None,
    available_only: bool = True,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Product).options(selectinload(Product.category)).order_by(Product.id.desc())
    
    if category_id:
        query = query.where(Product.category_id == category_id)
    if available_only:
        query = query.where(Product.is_available == True)
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            (Product.name_ar.ilike(search_pattern)) | 
            (Product.name_en.ilike(search_pattern)) |
            (Product.description_ar.ilike(search_pattern)) |
            (Product.description_en.ilike(search_pattern))
        )

    result = await db.execute(query)
    products = result.scalars().all()

    res = []
    for p in products:
        item = ProductResponse.model_validate(p)
        if p.category:
            item.category_name_ar = p.category.name_ar
            item.category_name_en = p.category.name_en
        res.append(item)
    return res

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    query = select(Product).options(selectinload(Product.category)).where(Product.id == product_id)
    result = await db.execute(query)
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    item = ProductResponse.model_validate(product)
    if product.category:
        item.category_name_ar = product.category.name_ar
        item.category_name_en = product.category.name_en
    return item

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_roles([UserRole.ADMIN]))
):
    # Verify category exists
    cat_res = await db.execute(select(Category).where(Category.id == product_in.category_id))
    if not cat_res.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category_id")

    product = Product(**product_in.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_roles([UserRole.ADMIN]))
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    for field, val in product_in.model_dump(exclude_unset=True).items():
        setattr(product, field, val)

    await db.commit()
    await db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_roles([UserRole.ADMIN]))
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    await db.delete(product)
    await db.commit()
    return None

@router.post("/upload-image", response_model=dict)
async def upload_product_image(
    file: UploadFile = File(...),
    admin: dict = Depends(require_roles([UserRole.ADMIN]))
):
    # Security Validation: Check MIME type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed: JPG, PNG, WEBP"
        )
    
    # Read file content safely with size check
    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 5MB limit"
        )

    # Generate secure random filename to prevent Path Traversal
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
        ext = '.jpg'
    safe_filename = f"prod_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    image_url = f"/uploads/{safe_filename}"
    return {"image_url": image_url}
