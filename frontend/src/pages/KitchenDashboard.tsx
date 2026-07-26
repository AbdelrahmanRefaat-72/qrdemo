import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { OrderWebSocket } from '../services/websocket';
import { useLangStore } from '../store/useLangStore';
import { ChefHat, Clock, CheckCircle2, Play, AlertCircle, RefreshCw } from 'lucide-react';

export const KitchenDashboard: React.FC = () => {
  const { lang, t } = useLangStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKitchenOrders = async () => {
    try {
      const res = await api.get('/orders');
      // Filter orders relevant to kitchen: RECEIVED or PREPARING
      const kitchenOrders = res.data.filter(
        (o: Order) => o.status === 'RECEIVED' || o.status === 'PREPARING'
      );
      setOrders(kitchenOrders);
    } catch (err: any) {
      console.error(err);
      setError(t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();

    // WebSocket connection for real-time order updates
    const ws = new OrderWebSocket('/ws', (message) => {
      if (message.type === 'NEW_ORDER' || message.type === 'ORDER_UPDATED') {
        fetchKitchenOrders();
      }
    });

    return () => {
      ws.close();
    };
  }, []);

  const handleUpdateStatus = async (orderId: number, nextStatus: OrderStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: nextStatus });
      fetchKitchenOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 text-gray-900 dark:text-gray-100 pb-16">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Top Title Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                {t.kitchenTitle}
              </h2>
              <span className="text-xs font-semibold text-gray-500">
                شاشة عرض واستلام طلبات الطهاة
              </span>
            </div>
          </div>

          <button
            onClick={fetchKitchenOrders}
            className="p-2.5 rounded-xl bg-white dark:bg-dark-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-amber-500 transition-colors shadow-sm"
            title="تحديث"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Orders Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-gray-200 dark:bg-dark-800 animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-500/10 text-red-500 rounded-3xl border border-red-500/20">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-bold">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-dark-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl max-w-md mx-auto my-12">
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <h3 className="font-extrabold text-lg text-gray-700 dark:text-gray-300">
              لا توجد طلبات جارية للمطبخ حالياً
            </h3>
            <p className="text-xs text-gray-400 mt-1">ستظهر الطلبات الجديدة فور إرسالها من الزبائن</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => {
              const isPreparing = order.status === 'PREPARING';

              return (
                <div
                  key={order.id}
                  className={`p-6 rounded-3xl bg-white dark:bg-dark-900 border transition-all shadow-xl flex flex-col justify-between ${
                    isPreparing
                      ? 'border-amber-500/50 ring-2 ring-amber-500/20'
                      : 'border-gray-100 dark:border-gray-800'
                  }`}
                >
                  {/* Ticket Header */}
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-xs font-bold text-gray-400">{order.order_number}</span>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">
                          {t.table} #{order.table_number || order.table_id}
                        </h3>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                          isPreparing
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}
                      >
                        {t[order.status]}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="py-4 space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-dark-800 font-black text-xs text-amber-500 flex items-center justify-center">
                              {item.quantity}x
                            </span>
                            <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                              {lang === 'ar' ? item.product_name_ar : item.product_name_en}
                            </span>
                          </div>

                          {item.notes && (
                            <span className="text-xs text-amber-500 italic block mt-0.5">
                              "{item.notes}"
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {order.customer_notes && (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold mb-4">
                        ملاحظة العميل: {order.customer_notes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    {!isPreparing ? (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="w-full py-3 px-4 rounded-2xl bg-amber-500 text-dark-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{t.startPreparing}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        className="w-full py-3 px-4 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t.markReady}</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
