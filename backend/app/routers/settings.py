import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.config import settings
from app.database import get_db
from app.models import RestaurantSetting, UserRole
from app.schemas import RestaurantSettingSchema
from app.security import require_roles

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("", response_model=RestaurantSettingSchema)
async def get_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RestaurantSetting))
    db_settings = result.scalars().all()
    
    data = {}
    for s in db_settings:
        data[s.key] = s.value
        
    return RestaurantSettingSchema(**data)

@router.put("", response_model=RestaurantSettingSchema)
async def update_settings(
    settings_in: RestaurantSettingSchema,
    db: AsyncSession = Depends(get_db),
    admin: dict = Depends(require_roles([UserRole.ADMIN]))
):
    update_data = settings_in.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        if val is not None:
            res = await db.execute(select(RestaurantSetting).where(RestaurantSetting.key == key))
            item = res.scalars().first()
            if item:
                item.value = str(val)
            else:
                db.add(RestaurantSetting(key=key, value=str(val)))
                
    await db.commit()
    return await get_settings(db)

@router.post("/upload-logo", response_model=dict)
async def upload_logo(
    file: UploadFile = File(...),
    admin: dict = Depends(require_roles([UserRole.ADMIN]))
):
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type")

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
        ext = '.png'
    safe_filename = f"logo_{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    logo_url = f"/uploads/{safe_filename}"
    return {"logo_url": logo_url}
