import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useLangStore } from '../../store/useLangStore';
import { api } from '../../services/api';
import { X, Trash2, Plus, Minus, Send, ShoppingBag, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { lang, t } = useLangStore();
  const navigate = useNavigate();
  const {
    items,
    tableNumber,
    customerNotes,
    updateQuantity,
    removeItem,
    setCustomerNotes,
    clearCart,
    getTotalPrice,
  } = useCartStore();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalPrice = getTotalPrice().toFixed(2);

  const handleSubmitOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch table ID from backend by table number first
      const tblRes = await api.get(`/tables/by-number/${tableNumber || 1}`);
      const tableId = tblRes.data.id;

      const payload = {
        table_id: tableId,
        customer_notes: customerNotes,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          notes: item.notes || null,
        })),
      };

      const res = await api.post('/orders', payload);
      const createdOrder = res.data;

      clearCart();
      onClose();
      // Redirect customer directly to live order tracking page
      navigate(`/order/${createdOrder.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-dark-950/70 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 rtl:pl-0 rtl:pr-10">
        <div className="w-screen max-w-md bg-white dark:bg-dark-900 border-l rtl:border-r border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 bg-gray-50 dark:bg-dark-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-gray-900 dark:text-white">
                  {t.cart}
                </h2>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {t.table} #{tableNumber || 1}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {error && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-800 flex items-center justify-center mb-3 text-gray-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-bold text-gray-500 dark:text-gray-400">
                  {t.emptyCart}
                </p>
              </div>
            ) : (
              items.map((item) => {
                const name = lang === 'ar' ? item.product.name_ar : item.product.name_en;
                const itemTotal = (item.product.price * item.quantity).toFixed(2);

                return (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-800/60 border border-gray-100 dark:border-gray-800 flex gap-3"
                  >
                    {/* Item thumbnail */}
                    {item.product.image_url && (
                      <img
                        src={item.product.image_url}
                        alt={name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                    )}

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 italic truncate">
                          "{item.notes}"
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="font-extrabold text-xs text-amber-600 dark:text-amber-400">
                          {itemTotal} {t.currency}
                        </span>

                        <div className="flex items-center gap-2 bg-white dark:bg-dark-900 px-2 py-0.5 rounded-xl border border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="text-gray-500 hover:text-amber-500"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="text-gray-500 hover:text-amber-500"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Submit */}
          {items.length > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-dark-950 border-t border-gray-200 dark:border-gray-800 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                  {t.notes} (لطلب ككل)
                </label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-sm font-black">
                <span className="text-gray-700 dark:text-gray-300">{t.total}</span>
                <span className="text-lg text-amber-500">{totalPrice} {t.currency}</span>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-dark-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.checkout}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
