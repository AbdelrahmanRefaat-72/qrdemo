import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useLangStore } from '../store/useLangStore';
import { Shield, Lock, User, KeyRound, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t } = useLangStore();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', { username, password });
      const { access_token, user } = res.data;
      
      setAuth(access_token, user);

      // Redirect based on role
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'KITCHEN') navigate('/kitchen');
      else if (user.role === 'WAITER') navigate('/waiter');
      else if (user.role === 'CASHIER') navigate('/cashier');
      else navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(t.invalidCredentials);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (userRole: string) => {
    setUsername(userRole);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-dark-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              {t.loginTitle}
            </h2>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Codex Restaurant Staff Portal
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
                {t.username}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-dark-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{t.login}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Accounts for Easy Demo Testing */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <span className="block text-center text-xs font-bold text-gray-400">
              دخول سريع تجريبي (Demo Preset Logins)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => handleQuickLogin('admin')}
                className="p-2 rounded-xl bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors"
              >
                Admin
              </button>
              <button
                onClick={() => handleQuickLogin('kitchen')}
                className="p-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
              >
                Kitchen
              </button>
              <button
                onClick={() => handleQuickLogin('waiter')}
                className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
              >
                Waiter
              </button>
              <button
                onClick={() => handleQuickLogin('cashier')}
                className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
              >
                Cashier
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
