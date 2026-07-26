import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Header } from '../components/common/Header';
import { Product, Category, TableItem, Order, RestaurantSettings } from '../types';
import { api } from '../services/api';
import { useLangStore } from '../store/useLangStore';
import {
  LayoutDashboard,
  Utensils,
  FolderTree,
  QrCode,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  ShoppingBag,
  Upload,
  Download,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { lang, t } = useLangStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'tables' | 'settings'>('overview');

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal / Form States
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name_ar: '', name_en: '', price: 100, category_id: 1, is_available: true, description_ar: '', description_en: '', image_url: ''
  });

  const [showCatModal, setShowCatModal] = useState<boolean>(false);
  const [catForm, setCatForm] = useState<Partial<Category>>({ name_ar: '', name_en: '', icon: 'Utensils', sort_order: 1 });

  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [newTableNum, setNewTableNum] = useState<number>(11);

  const [selectedQRTable, setSelectedQRTable] = useState<TableItem | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, tRes, oRes, sRes] = await Promise.all([
        api.get('/products?available_only=false'),
        api.get('/categories?active_only=false'),
        api.get('/tables'),
        api.get('/orders'),
        api.get('/settings'),
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data);
      setTables(tRes.data);
      setOrders(oRes.data);
      setSettings(sRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Compute Overview Stats
  const totalSales = orders.reduce((sum, o) => sum + (o.status === 'PAID' ? o.total_amount : 0), 0).toFixed(2);
  const activeOrdersCount = orders.filter((o) => o.status !== 'PAID' && o.status !== 'CANCELLED').length;

  // Product Actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (productForm.id) {
        await api.put(`/products/${productForm.id}`, productForm);
      } else {
        await api.post('/products', productForm);
      }
      setShowProductModal(false);
      fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error saving product');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('هل أنت تأكد من حذف هذا المنتج؟')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      const res = await api.post('/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProductForm({ ...productForm, image_url: res.data.image_url });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Upload failed');
    }
  };

  // Category Actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/categories', catForm);
      setShowCatModal(false);
      fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error saving category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('هل أنت تأكد من حذف هذا التصنيف؟')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Table Actions
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tables', { number: newTableNum, capacity: 4 });
      setShowTableModal(false);
      fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error creating table');
    }
  };

  const handleDeleteTable = async (id: number) => {
    if (!confirm('هل أنت تأكد من حذف الطاولة؟')) return;
    try {
      await api.delete(`/tables/${id}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 text-gray-900 dark:text-gray-100 pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Navigation Tabs Header */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-dark-950 shadow-lg shadow-amber-500/20'
                : 'bg-white dark:bg-dark-900 text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>نظرة عامة (Overview)</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'products'
                ? 'bg-amber-500 text-dark-950 shadow-lg shadow-amber-500/20'
                : 'bg-white dark:bg-dark-900 text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>المنتجات ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'categories'
                ? 'bg-amber-500 text-dark-950 shadow-lg shadow-amber-500/20'
                : 'bg-white dark:bg-dark-900 text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>التصنيفات ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'tables'
                ? 'bg-amber-500 text-dark-950 shadow-lg shadow-amber-500/20'
                : 'bg-white dark:bg-dark-900 text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>الطاولات و QR ({tables.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-dark-950 shadow-lg shadow-amber-500/20'
                : 'bg-white dark:bg-dark-900 text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>إعدادات المطعم</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-gray-800 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">{t.totalSales}</span>
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-2">
                  {totalSales} {t.currency}
                </h3>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-gray-800 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">{t.activeOrders}</span>
                  <ShoppingBag className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-2">
                  {activeOrdersCount}
                </h3>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-gray-800 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">{t.totalProducts}</span>
                  <Utensils className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-2">
                  {products.length}
                </h3>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-gray-800 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">{t.totalTables}</span>
                  <QrCode className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-2">
                  {tables.length}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products */}
        {activeTab === 'products' && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">إدارة قائمة الطعام والمنتجات</h3>
              <button
                onClick={() => {
                  setProductForm({ name_ar: '', name_en: '', price: 100, category_id: categories[0]?.id || 1, is_available: true, description_ar: '', description_en: '', image_url: '' });
                  setShowProductModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 text-dark-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="p-4 rounded-3xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-gray-800 shadow-xl flex gap-4">
                  {product.image_url && (
                    <img src={product.image_url} alt={product.name_ar} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-base text-gray-900 dark:text-white line-clamp-1">{product.name_ar}</h4>
                      <span className="text-xs font-bold text-amber-500">{product.price} {t.currency}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => {
                          setProductForm(product);
                          setShowProductModal(true);
                        }}
                        className="p-1.5 rounded-xl bg-gray-100 dark:bg-dark-800 text-gray-500 hover:text-amber-500"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Categories */}
        {activeTab === 'categories' && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">إدارة أقسام وتصنيفات المنيو</h3>
              <button
                onClick={() => setShowCatModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 text-dark-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة تصنيف</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 rounded-3xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-gray-800 shadow-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-base text-gray-900 dark:text-white">{cat.name_ar}</h4>
                    <span className="text-xs text-gray-400">{cat.name_en}</span>
                  </div>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 rounded-xl text-red-500 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Tables & QR */}
        {activeTab === 'tables' && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">طاولات المطعم ورموز QR</h3>
              <button
                onClick={() => setShowTableModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 text-dark-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة طاولة</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tables.map((table) => (
                <div key={table.id} className="p-5 rounded-3xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-gray-800 shadow-xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 font-black text-lg flex items-center justify-center mx-auto">
                    #{table.number}
                  </div>
                  <span className="block text-xs font-bold text-gray-500">{t.table} #{table.number}</span>
                  
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedQRTable(table)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-dark-950 font-extrabold text-xs flex items-center gap-1 shadow-md"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>عرض QR</span>
                    </button>
                    <button onClick={() => handleDeleteTable(table.id)} className="p-1.5 rounded-xl text-red-500 hover:bg-red-500/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* QR Display Modal */}
      {selectedQRTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-white dark:bg-dark-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
              رمز QR للطاولة #{selectedQRTable.number}
            </h3>
            
            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner">
              <QRCodeSVG
                value={`${window.location.origin}/table/${selectedQRTable.number}`}
                size={200}
                level="H"
              />
            </div>

            <p className="text-xs text-gray-500 font-mono">
              {`${window.location.origin}/table/${selectedQRTable.number}`}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedQRTable(null)}
                className="w-full py-2.5 rounded-2xl bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Create/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-md p-4">
          <form onSubmit={handleSaveProduct} className="w-full max-w-lg bg-white dark:bg-dark-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">بيانات المنتج</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">{t.productNameAr}</label>
                <input required type="text" value={productForm.name_ar} onChange={(e) => setProductForm({ ...productForm, name_ar: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-800 text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">{t.productNameEn}</label>
                <input required type="text" value={productForm.name_en} onChange={(e) => setProductForm({ ...productForm, name_en: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-800 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">{t.price}</label>
                <input required type="number" step="0.5" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-800 text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">{t.category}</label>
                <select value={productForm.category_id} onChange={(e) => setProductForm({ ...productForm, category_id: parseInt(e.target.value) })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-800 text-xs">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name_ar}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">{t.image}</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-xs text-gray-500" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowProductModal(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-800 text-xs font-bold">{t.cancel}</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-dark-950 font-black text-xs">{t.save}</button>
            </div>
          </form>
        </div>
      )}

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-md p-4">
          <form onSubmit={handleSaveCategory} className="w-full max-w-md bg-white dark:bg-dark-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">إضافة تصنيف جديد</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">الاسم بالعربية</label>
              <input required type="text" value={catForm.name_ar} onChange={(e) => setCatForm({ ...catForm, name_ar: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-800 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">الاسم بالإنجليزية</label>
              <input required type="text" value={catForm.name_en} onChange={(e) => setCatForm({ ...catForm, name_en: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-800 text-xs" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCatModal(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-800 text-xs font-bold">{t.cancel}</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-dark-950 font-black text-xs">{t.save}</button>
            </div>
          </form>
        </div>
      )}

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-md p-4">
          <form onSubmit={handleCreateTable} className="w-full max-w-xs bg-white dark:bg-dark-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">إضافة طاولة</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">رقم الطاولة</label>
              <input required type="number" min="1" value={newTableNum} onChange={(e) => setNewTableNum(parseInt(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-800 text-xs font-bold" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowTableModal(false)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-800 text-xs font-bold">{t.cancel}</button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-dark-950 font-black text-xs">{t.add}</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
