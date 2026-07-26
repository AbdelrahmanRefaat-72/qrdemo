import React, { useState } from 'react';
import { Product } from '../../types';
import { useLangStore } from '../../store/useLangStore';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, notes: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const { lang, t } = useLangStore();
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  if (!product) return null;

  const name = lang === 'ar' ? product.name_ar : product.name_en;
  const description = lang === 'ar' ? product.description_ar : product.description_en;
  const totalPrice = (product.price * quantity).toFixed(2);

  const handleAdd = () => {
    onAddToCart(product, quantity, notes);
    setQuantity(1);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-dark-950/80 backdrop-blur-md p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-dark-900 rounded-t-3xl sm:rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header Image with Close Button */}
        <div className="relative h-56 sm:h-64 w-full bg-gray-100 dark:bg-dark-800 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Codex Restaurant
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-dark-950/60 text-white backdrop-blur-md hover:bg-dark-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              {name}
            </h2>
            <span className="inline-block mt-2 font-black text-lg text-amber-500">
              {product.price} {t.currency}
            </span>
          </div>

          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {description}
            </p>
          )}

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
              {t.notes}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
              rows={2}
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {t.quantity}
            </span>

            <div className="flex items-center gap-3 bg-gray-100 dark:bg-dark-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-white dark:bg-dark-900 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-amber-500 font-bold transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="w-8 text-center font-black text-base text-gray-900 dark:text-white">
                {quantity}
              </span>

              <button
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="w-8 h-8 rounded-xl bg-white dark:bg-dark-900 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-amber-500 font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-gray-50 dark:bg-dark-950 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleAdd}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-dark-950 font-black text-base flex items-center justify-between shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>{t.addToCart}</span>
            </div>
            <span>{totalPrice} {t.currency}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
