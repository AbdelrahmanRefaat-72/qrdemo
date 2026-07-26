import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { OrderWebSocket } from '../services/websocket';
import { useLangStore } from '../store/useLangStore';
import { CheckCircle2, Clock, ChefHat, Sparkles, Utensils, ArrowLeft, Radio } from 'lucide-react';

export const OrderTrackerPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { lang, t } = useLangStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err: any) {
        console.error(err);
        setError(t.errorOccurred);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Connect WebSocket for live order tracker
    const ws = new OrderWebSocket(`/ws/orders/${orderId}`, (message) => {
      if (message.type === 'ORDER_STATUS_CHANGED' && message.data) {
        setOrder(message.data);
      }
    });

    return () => {
      ws.close();
    };
  }, [orderId, t.errorOccurred]);

  const steps: { status: OrderStatus; label: string; icon: any; desc: string }[] = [
    { status: 'RECEIVED', label: t.RECEIVED, icon: Clock, desc: t.stepReceived },
    { status: 'PREPARING', label: t.PREPARING, icon: ChefHat, desc: t.stepPreparing },
    { status: 'READY', label: t.READY, icon: Sparkles, desc: t.stepReady },
    { status: 'SERVED', label: t.SERVED, icon: Utensils, desc: t.stepServed },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'RECEIVED': return 0;
      case 'PREPARING': return 1;
      case 'READY': return 2;
      case 'SERVED':
      case 'PAID': return 3;
      default: return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 text-gray-900 dark:text-gray-100 pb-16">
      <Header />

      <main className="max-w-3xl mx-auto px-4 pt-8">
        
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-amber-500 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t.backToMenu}</span>
        </Link>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : error || !order ? (
          <div className="p-8 text-center bg-red-500/10 text-red-500 rounded-3xl border border-red-500/20">
            {error || 'Order not found'}
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-gray-800 shadow-xl text-center relative overflow-hidden">
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-extrabold animate-pulse">
                <Radio className="w-3.5 h-3.5" />
                <span>{t.liveUpdates}</span>
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                {t.orderPlaced}
              </span>
              
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                {order.order_number}
              </h2>

              <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-gray-100 dark:bg-dark-800 text-sm font-extrabold text-gray-700 dark:text-gray-200">
                <span>{t.table} #{order.table_number || order.table_id}</span>
                <span>•</span>
                <span className="text-amber-500">{order.total_amount} {t.currency}</span>
              </div>
            </div>

            {/* Stepper Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-gray-800 shadow-xl">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white mb-6">
                {t.trackingTitle}
              </h3>

              <div className="relative border-l-2 rtl:border-r-2 rtl:border-l-0 border-gray-200 dark:border-gray-800 ml-4 rtl:ml-0 rtl:mr-4 space-y-8">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  const Icon = step.icon;

                  return (
                    <div key={step.status} className="relative pl-8 rtl:pl-0 rtl:pr-8">
                      {/* Step Indicator Bullet */}
                      <div
                        className={`absolute -left-4 rtl:-left-auto rtl:-right-4 top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                          isCurrent
                            ? 'bg-amber-500 text-dark-950 ring-4 ring-amber-500/20 shadow-lg shadow-amber-500/40 scale-110'
                            : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 dark:bg-dark-800 text-gray-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isCurrent ? 'text-amber-500' : 'text-gray-400'}`} />
                          <h4 className={`font-extrabold text-base ${isCurrent ? 'text-amber-500' : isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {step.label}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary Items */}
            <div className="p-6 rounded-3xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-gray-800 shadow-xl">
              <h4 className="font-extrabold text-sm text-gray-900 dark:text-white mb-4">
                تفاصيل الطلب
              </h4>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {lang === 'ar' ? item.product_name_ar : item.product_name_en}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">x{item.quantity}</span>
                      {item.notes && <p className="text-xs text-amber-500 italic">{item.notes}</p>}
                    </div>
                    <span className="font-extrabold text-gray-900 dark:text-white">
                      {item.subtotal} {t.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};
