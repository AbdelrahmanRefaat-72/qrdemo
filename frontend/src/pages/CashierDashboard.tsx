import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import { Order, PaymentMethod } from '../types';
import { api } from '../services/api';
import { OrderWebSocket } from '../services/websocket';
import { useLangStore } from '../store/useLangStore';
import { Receipt, CreditCard, Banknote, CheckCircle, RefreshCw } from 'lucide-react';

export const CashierDashboard: React.FC = () => {
  const { lang, t } = useLangStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPayments, setSelectedPayments] = useState<{ [orderId: number]: PaymentMethod }>({});

  const fetchUnpaidOrders = async () => {
    try {
      const res = await api.get('/orders');
      // Show orders that have been SERVED but not yet PAID
      const unpaid = res.data.filter(
        (o: Order) => o.status === 'SERVED' && o.payment_method === 'UNPAID'
      );
      setOrders(unpaid);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnpaidOrders();

    const ws = new OrderWebSocket('/ws', (message) => {
      if (message.type === 'NEW_ORDER' || message.type === 'ORDER_UPDATED') {
        fetchUnpaidOrders();
      }
    });

    return () => {
      ws.close();
    };
  }, []);

  const handleProcessPayment = async (orderId: number) => {
    const method = selectedPayments[orderId] || 'CASH';
    try {
      await api.put(`/orders/${orderId}/pay`, { payment_method: method });
      fetchUnpaidOrders();
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
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                {t.cashierTitle}
              </h2>
              <span className="text-xs font-semibold text-gray-500">
                شاشة تحصيل الفواتير وإغلاق جلسات الطاولات
              </span>
            </div>
          </div>

          <button
            onClick={fetchUnpaidOrders}
            className="p-2.5 rounded-xl bg-white dark:bg-dark-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-amber-500 transition-colors shadow-sm"
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
            <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <h3 className="font-extrabold text-lg text-gray-700 dark:text-gray-300">
              {t.noUnpaidOrders}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => {
              const currentPayment = selectedPayments[order.id] || 'CASH';

              return (
                <div
                  key={order.id}
                  className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-xs font-bold text-gray-400">{order.order_number}</span>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">
                          {t.table} #{order.table_number || order.table_id}
                        </h3>
                      </div>
                      <span className="text-lg font-black text-amber-500">
                        {order.total_amount} {t.currency}
                      </span>
                    </div>

                    {/* Items bill */}
                    <div className="py-4 space-y-2 divide-y divide-gray-50 dark:divide-gray-800">
                      {order.items.map((item) => (
                        <div key={item.id} className="pt-2 flex items-center justify-between text-xs font-bold">
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.quantity}x {lang === 'ar' ? item.product_name_ar : item.product_name_en}
                          </span>
                          <span className="text-gray-900 dark:text-white">{item.subtotal} {t.currency}</span>
                        </div>
                      ))}
                    </div>

                    {/* Payment Method Selector */}
                    <div className="my-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <label className="block text-xs font-bold text-gray-500 mb-2">
                        {t.paymentMethod}
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                        <button
                          onClick={() => setSelectedPayments({ ...selectedPayments, [order.id]: 'CASH' })}
                          className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                            currentPayment === 'CASH'
                              ? 'bg-amber-500 text-dark-950 border-amber-500 shadow-md font-black'
                              : 'bg-gray-50 dark:bg-dark-800 text-gray-500 border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <Banknote className="w-4 h-4" />
                          <span>{t.cash}</span>
                        </button>

                        <button
                          onClick={() => setSelectedPayments({ ...selectedPayments, [order.id]: 'CARD' })}
                          className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                            currentPayment === 'CARD'
                              ? 'bg-amber-500 text-dark-950 border-amber-500 shadow-md font-black'
                              : 'bg-gray-50 dark:bg-dark-800 text-gray-500 border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>{t.card}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleProcessPayment(order.id)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 text-dark-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all active:scale-95 mt-4"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>{t.markPaid}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
