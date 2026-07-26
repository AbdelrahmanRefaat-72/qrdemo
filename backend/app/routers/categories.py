from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import Category, UserRole
from app.schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from app.security import require_roles

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
async def get_categories(active_only: bool = True, db: AsyncSession = Depends(get_db)):
    query = select(Category).order_by(Category.sort_order.asc(), Category.id.asc())
    if active_only:
        query = query.where(Category.is_active == True)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_in: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_roles([UserRole.ADMIN]))
):
    category = Category(**category_in.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_roles([UserRole.ADMIN]))
):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    for field, val in category_in.model_dump(exclude_unset=True).items():
        setattr(category, field, val)
        
    await db.commit()
    await db.refresh(category)
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_roles([UserRole.ADMIN]))
):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    await db.delete(category)
    await db.commit()
    return None
