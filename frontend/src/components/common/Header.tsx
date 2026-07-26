import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Languages, ShoppingBag, Shield, LogOut, UtensilsCrossed } from 'lucide-react';
import { useLangStore } from '../../store/useLangStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

interface HeaderProps {
  onOpenCart?: () => void;
  tableNumber?: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart, tableNumber }) => {
  const { lang, t, toggleLang } = useLangStore();
  const { theme, toggleTheme } = useThemeStore();
  const { getTotalCount } = useCartStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const totalCount = getTotalCount();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-dark-900/80 border-b border-gray-200/50 dark:border-gray-800/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5 text-dark-950 font-bold" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-amber-600 to-amber-500 dark:from-white dark:via-gray-100 dark:to-amber-400 bg-clip-text text-transparent">
              {t.restaurantName}
            </h1>
            {tableNumber && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {t.table} #{tableNumber}
              </span>
            )}
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Switch Language"
          >
            <Languages className="w-4 h-4 text-amber-500" />
            <span className="uppercase text-xs font-bold">{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Cart Button (For Customers) */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-dark-950 font-bold hover:from-amber-400 hover:to-amber-500 transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t.cart}</span>
              {totalCount > 0 && (
                <span className="bg-dark-950 text-amber-400 text-xs px-2 py-0.5 rounded-full font-extrabold animate-bounce">
                  {totalCount}
                </span>
              )}
            </button>
          )}

          {/* Staff Auth Navigation */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={
                  user.role === 'ADMIN' ? '/admin' :
                  user.role === 'KITCHEN' ? '/kitchen' :
                  user.role === 'WAITER' ? '/waiter' : '/cashier'
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{user.username}</span>
              </Link>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="p-2 rounded-lg bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors"
              title={t.loginTitle}
            >
              <Shield className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
