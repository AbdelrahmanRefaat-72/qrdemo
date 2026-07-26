import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { CategoryBar } from '../components/customer/CategoryBar';
import { ProductCard } from '../components/customer/ProductCard';
import { ProductModal } from '../components/customer/ProductModal';
import { CartDrawer } from '../components/customer/CartDrawer';
import { Category, Product } from '../types';
import { api } from '../services/api';
import { useLangStore } from '../store/useLangStore';
import { useCartStore } from '../store/useCartStore';
import { Search, Utensils, AlertCircle } from 'lucide-react';

export const CustomerMenu: React.FC = () => {
  const { tableNum } = useParams<{ tableNum?: string }>();
  const { lang, t } = useLangStore();
  const { items, addItem, setTableNumber } = useCartStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tableNum) {
      const parsedNum = parseInt(tableNum, 10);
      if (!isNaN(parsedNum)) {
        setTableNumber(parsedNum);
      }
    }
  }, [tableNum, setTableNumber]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products'),
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (err: any) {
        console.error(err);
        setError(t.errorOccurred);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t.errorOccurred]);

  // Filter products by selected category and search query
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === null || p.category_id === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCategory;

    const name = ((lang === 'ar' ? p.name_ar : p.name_en) || '').toLowerCase();
    const desc = ((lang === 'ar' ? p.description_ar : p.description_en) || '').toLowerCase();

    return matchesCategory && (name.includes(q) || desc.includes(q));
  });

  const getCartQuantityForProduct = (productId: number) => {
    const found = items.find((i) => i.product.id === productId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-dark-950 text-gray-900 dark:text-gray-100">
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        tableNumber={tableNum ? parseInt(tableNum, 10) : 1}
      />

      {/* Hero Welcome Banner */}
      <div className="relative bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 text-dark-950 px-4 py-8 sm:py-12 overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {t.restaurantName}
          </h2>
          <p className="mt-2 text-xs sm:text-base font-bold opacity-90 max-w-xl mx-auto">
            {lang === 'ar'
              ? 'أهلاً بك! تصفح القائمة الفاخرة واطلب مستلزماتك مباشرةً من طاولتك بكل سهولة'
              : 'Welcome! Explore our gourmet menu & order directly from your table'}
          </p>

          {/* Search Input Bar */}
          <div className="mt-6 max-w-lg mx-auto relative">
            <Search className="absolute right-4 rtl:right-4 rtl:left-auto left-4 ltr:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-12 pr-12 py-3 rounded-2xl bg-white/95 dark:bg-dark-900/95 text-gray-900 dark:text-white placeholder-gray-400 text-sm font-semibold shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="max-w-7xl mx-auto mt-4">
        <CategoryBar
          categories={categories}
          selectedCategoryId={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Main Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-gray-200 dark:bg-dark-800 animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-500/10 rounded-3xl border border-red-500/20 text-red-500 max-w-md mx-auto my-12">
            <AlertCircle className="w-10 h-10 mx-auto mb-2" />
            <p className="font-bold">{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-gray-400 max-w-md mx-auto my-12">
            <Utensils className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-bold text-base">لا توجد نتائج مطابقة لبحثك</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={(p) => setSelectedProduct(p)}
                cartQuantity={getCartQuantityForProduct(product.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(prod, qty, notes) => addItem(prod, qty, notes)}
      />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};
