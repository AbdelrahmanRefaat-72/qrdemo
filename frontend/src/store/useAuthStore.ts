import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

const savedToken = localStorage.getItem('codex_token');
const savedUser = localStorage.getItem('codex_user') ? JSON.parse(localStorage.getItem('codex_user')!) : null;

export const useAuthStore = create<AuthState>((set) => ({
  token: savedToken,
  user: savedUser,
  setAuth: (token: string, user: User) => {
    localStorage.setItem('codex_token', token);
    localStorage.setItem('codex_user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('codex_token');
    localStorage.removeItem('codex_user');
    set({ token: null, user: null });
  }
}));
