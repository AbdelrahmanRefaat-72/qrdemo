from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models import UserRole, OrderStatus, PaymentMethod

# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=2, max_length=100)
    role: UserRole

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class LoginRequest(BaseModel):
    username: str
    password: str

# Category Schemas
class CategoryBase(BaseModel):
    name_ar: str = Field(..., min_length=1, max_length=100)
    name_en: str = Field(..., min_length=1, max_length=100)
    icon: Optional[str] = "Utensils"
    sort_order: Optional[int] = 0
    is_active: Optional[bool] = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Product Schemas
class ProductBase(BaseModel):
    category_id: int
    name_ar: str = Field(..., min_length=1, max_length=150)
    name_en: str = Field(..., min_length=1, max_length=150)
    description_ar: Optional[str] = Field(None, max_length=500)
    description_en: Optional[str] = Field(None, max_length=500)
    price: float = Field(..., gt=0)
    image_url: Optional[str] = None
    is_available: Optional[bool] = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    category_name_ar: Optional[str] = None
    category_name_en: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# Table Schemas
class TableBase(BaseModel):
    number: int = Field(..., gt=0)
    capacity: Optional[int] = Field(4, gt=0)
    is_active: Optional[bool] = True

class TableCreate(TableBase):
    pass

class TableResponse(TableBase):
    id: int
    qr_code_url: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0, le=50) # Max 50 of one product per order item
    notes: Optional[str] = Field(None, max_length=200)

class OrderCreate(BaseModel):
    table_id: int
    customer_notes: Optional[str] = Field(None, max_length=500)
    items: List[OrderItemCreate] = Field(..., min_items=1)

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name_ar: str
    product_name_en: str
    unit_price: float
    quantity: int
    subtotal: float
    notes: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class OrderResponse(BaseModel):
    id: int
    order_number: str
    table_id: int
    table_number: Optional[int] = None
    status: OrderStatus
    total_amount: float
    payment_method: PaymentMethod
    customer_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    model_config = ConfigDict(from_attributes=True)

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class OrderPaymentUpdate(BaseModel):
    payment_method: PaymentMethod

# Setting Schema
class RestaurantSettingSchema(BaseModel):
    restaurant_name_ar: Optional[str] = "مطعم كودكس"
    restaurant_name_en: Optional[str] = "Codex Restaurant"
    currency_symbol_ar: Optional[str] = "ج.م"
    currency_symbol_en: Optional[str] = "EGP"
    logo_url: Optional[str] = None
    welcome_message_ar: Optional[str] = "مرحباً بكم في مطعم كودكس"
    welcome_message_en: Optional[str] = "Welcome to Codex Restaurant"
