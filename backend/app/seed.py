import asyncio
from sqlalchemy.future import select
from app.database import engine, Base, AsyncSessionLocal
from app.models import User, UserRole, Category, Product, Table, RestaurantSetting
from app.security import get_password_hash

async def seed_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Seed Users
        user_check = await db.execute(select(User))
        if not user_check.scalars().first():
            hashed_pwd = get_password_hash("password123")
            users = [
                User(username="admin", hashed_password=hashed_pwd, full_name="System Admin", role=UserRole.ADMIN),
                User(username="kitchen", hashed_password=hashed_pwd, full_name="Head Chef", role=UserRole.KITCHEN),
                User(username="waiter", hashed_password=hashed_pwd, full_name="Lead Waiter", role=UserRole.WAITER),
                User(username="cashier", hashed_password=hashed_pwd, full_name="Main Cashier", role=UserRole.CASHIER),
            ]
            db.add_all(users)
            print("[OK] Staff users seeded.")
        # 2. Seed Categories
        cat_check = await db.execute(select(Category))
        if not cat_check.scalars().first():
            categories = [
                Category(name_ar="المقبلات", name_en="Appetizers", icon="Soup", sort_order=1),
                Category(name_ar="الأطباق الرئيسية", name_en="Main Dishes", icon="Utensils", sort_order=2),
                Category(name_ar="الحلويات", name_en="Desserts", icon="Cake", sort_order=3),
                Category(name_ar="المشروبات", name_en="Beverages", icon="Coffee", sort_order=4),
            ]
            db.add_all(categories)
            await db.flush()

            # 3. Seed Products
            c_app = categories[0]
            c_main = categories[1]
            c_dessert = categories[2]
            c_drink = categories[3]

            products = [
                # Appetizers
                Product(
                    category_id=c_app.id,
                    name_ar="أصابع الموزاريلا المقرمشة",
                    name_en="Crispy Mozzarella Sticks",
                    description_ar="جبنة موزاريلا ذائبة مغطاة بطبقة مقرمشة تقدم مع صوص المارينارا الخصوصي",
                    description_en="Golden fried mozzarella cheese sticks served with house marinara dip",
                    price=120.0,
                    image_url="https://images.unsplash.com/photo-1531749668029-2db88e4276c7?auto=format&fit=crop&w=600&q=80",
                    is_available=True
                ),
                Product(
                    category_id=c_app.id,
                    name_ar="بطاطس الودجز الذهبية",
                    name_en="Crispy Potato Wedges",
                    description_ar="بطاطس مبهرة ببهارات الأعشاب البرية ومعجون الثوم الفاخر",
                    description_en="Seasoned potato wedges served with garlic aioli sauce",
                    price=85.0,
                    image_url="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
                    is_available=True
                ),
                # Main Dishes
                Product(
                    category_id=c_main.id,
                    name_ar="برجر واجيو كودكس السحرية",
                    name_en="Codex Gourmet Wagyu Burger",
                    description_ar="لحم واجيو فاخر 200غ، جبنة شيدر معتقة، بصل مكرمل وصوص الشيف الخاص",
                    description_en="Premium 200g Wagyu beef patty, aged cheddar, caramelized onions, and truffle mayo",
                    price=320.0,
                    image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
                    is_available=True
                ),
                Product(
                    category_id=c_main.id,
                    name_ar="بيتزا مارجريتا نابوليتانا",
                    name_en="Neapolitan Pizza Margherita",
                    description_ar="عجينة مخمرة 48 ساعة، طماطم سان مارزانو، موزاريلا فريش وريحان طازج",
                    description_en="48-hour fermented dough, San Marzano tomatoes, fresh mozzarella, and basil",
                    price=240.0,
                    image_url="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
                    is_available=True
                ),
                Product(
                    category_id=c_main.id,
                    name_ar="باستا فيتوتشيني ألفريدو بالدجاج",
                    name_en="Chicken Fettuccine Alfredo",
                    description_ar="باستا طازجة بصوص الكريمة والبارميجانو مع شرائح الدجاج المشوي والفطر",
                    description_en="Fresh fettuccine in creamy Parmigiano-Reggiano sauce with grilled chicken breast and mushrooms",
                    price=260.0,
                    image_url="https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80",
                    is_available=True
                ),
                # Desserts
                Product(
                    category_id=c_dessert.id,
                    name_ar="كيك الشوكولاتة الذائبة (لافا)",
                    name_en="Molten Chocolate Lava Cake",
                    description_ar="كيك شوكولاتة بلجيكية ساخنة بقلب ذائب تقدم مع آيس كريم الفانيليا",
                    description_en="Rich Belgian chocolate cake with a molten center, served with Madagascar vanilla ice cream",
                    price=150.0,
                    image_url="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
                    is_available=True
                ),
                # Beverages
                Product(
                    category_id=c_drink.id,
                    name_ar="عصير مانجو طازج",
                    name_en="Fresh Mango Juice",
                    description_ar="عصير مانجو طبيعي 100% بدون إضافات",
                    description_en="100% fresh natural mango juice",
                    price=70.0,
                    image_url="https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80",
                    is_available=True
                ),
                Product(
                    category_id=c_drink.id,
                    name_ar="موخيتو التوت الأزرق الانتعاش",
                    name_en="Fresh Blueberry Mojito",
                    description_ar="نعناع طازج، ليمون، توت أزرق وصودا فوارة",
                    description_en="Fresh mint, lime, blueberries, and sparkling soda",
                    price=90.0,
                    image_url="https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
                    is_available=True
                )
            ]
            db.add_all(products)
            print("[OK] Categories and products seeded.")

        # 4. Seed Tables
        tbl_check = await db.execute(select(Table))
        if not tbl_check.scalars().first():
            tables = [Table(number=i, capacity=4, qr_code_url=f"/table/{i}") for i in range(1, 11)]
            db.add_all(tables)
            print("[OK] Tables 1-10 seeded.")

        # 5. Seed Settings
        setting_check = await db.execute(select(RestaurantSetting))
        if not setting_check.scalars().first():
            settings = [
                RestaurantSetting(key="restaurant_name_ar", value="مطعم كودكس"),
                RestaurantSetting(key="restaurant_name_en", value="Codex Restaurant"),
                RestaurantSetting(key="currency_symbol_ar", value="ج.م"),
                RestaurantSetting(key="currency_symbol_en", value="EGP"),
                RestaurantSetting(key="welcome_message_ar", value="أهلاً بك في مطعم كودكس! امسح الكود واطلب مباشرة من طاولتك."),
                RestaurantSetting(key="welcome_message_en", value="Welcome to Codex Restaurant! Order directly from your table.")
            ]
            db.add_all(settings)
            print("[OK] Restaurant settings seeded.")

        await db.commit()

if __name__ == "__main__":
    asyncio.run(seed_database())
