import React from 'react';
import { Product } from '../../types';
import { useLangStore } from '../../store/useLangStore';
import { Plus, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  cartQuantity: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  cartQuantity,
}) => {
  const { lang, t } = useLangStore();

  const name = lang === 'ar' ? product.name_ar : product.name_en;
  const description = lang === 'ar' ? product.description_ar : product.description_en;

  return (
    <div
      onClick={() => product.is_available && onSelectProduct(product)}
      className={`group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-gray-800/80 p-3 sm:p-4 shadow-sm hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 ${
        product.is_available ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
      }`}
    >
      {/* Product Image */}
      <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden mb-3 bg-gray-100 dark:bg-dark-800">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-xs">Codex Restaurant</span>
          </div>
        )}

        {/* Price Tag Badge */}
        <div className="absolute top-2.5 right-2.5 bg-dark-950/80 backdrop-blur-md text-amber-400 font-extrabold text-xs px-3 py-1 rounded-full border border-amber-500/30 shadow-md">
          {product.price} {t.currency}
        </div>

        {/* Cart Quantity Badge */}
        {cartQuantity > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-amber-500 text-dark-950 font-black text-xs w-7 h-7 rounded-full flex items-center justify-center shadow-lg animate-scale-in">
            {cartQuantity}
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!product.is_available && (
          <div className="absolute inset-0 bg-dark-950/70 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold px-3 py-1 rounded-full">
              {t.outOfStock}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
          {name}
        </h3>
        
        {description && (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 mb-3 leading-relaxed">
            {description}
          </p>
        )}

        {/* Action Bottom */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/60">
          <span className="font-extrabold text-sm sm:text-base text-amber-600 dark:text-amber-400">
            {product.price} {t.currency}
          </span>

          {product.is_available && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectProduct(product);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-dark-950 text-xs font-bold transition-all duration-200"
            >
              {cartQuantity > 0 ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{t.addToCart}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
