import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import { Order } from '../types';
import { api } from '../services/api';
import { OrderWebSocket } from '../services/websocket';
import { useLangStore } from '../store/useLangStore';
import { Sparkles, Utensils, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const WaiterDashboard: React.FC = () => {
  const { lang, t } = useLangStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReadyOrders = async () => {
    try {
      const res = await api.get('/orders');
      const readyOrders = res.data.filter((o: Order) => o.status === 'READY');
      setOrders(readyOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadyOrders();

    const ws = new OrderWebSocket('/ws', (message) => {
      if (message.type === 'NEW_ORDER' || message.type === 'ORDER_UPDATED') {
        fetchReadyOrders();
      }
    });

    return () => {
      ws.close();
    };
  }, []);

  const handleMarkServed = async (orderId: number) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: 'SERVED' });
      fetchReadyOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 text-gray-900 dark:text-gray-100 pb-16">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                {t.waiterTitle}
              </h2>
              <span className="text-xs font-semibold text-gray-500">
                طلبات الوجبات المحضرة والجاهزة للتقديم للطاولة
              </span>
            </div>
          </div>

          <button
            onClick={fetchReadyOrders}
            className="p-2.5 rounded-xl bg-white dark:bg-dark-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-emerald-500 transition-colors shadow-sm"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-gray-200 dark:bg-dark-800 animate-pulse"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-dark-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl max-w-md mx-auto my-12">
            <Utensils className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <h3 className="font-extrabold text-lg text-gray-700 dark:text-gray-300">
              {t.noReadyOrders}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-emerald-500/30 shadow-xl ring-2 ring-emerald-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-2xl font-black text-emerald-500">
                      {t.table} #{order.table_number || order.table_id}
                    </span>
                    <span className="text-xs font-bold text-gray-400">{order.order_number}</span>
                  </div>

                  <div className="py-4 space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {item.quantity}x {lang === 'ar' ? item.product_name_ar : item.product_name_en}
                        </span>
                        {item.notes && (
                          <span className="text-xs text-amber-500 italic">"{item.notes}"</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleMarkServed(order.id)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t.markServed}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
