import { create } from 'zustand';
import { Product, CartItem } from '../types';

interface CartState {
  tableNumber: number | null;
  items: CartItem[];
  customerNotes: string;
  setTableNumber: (num: number) => void;
  addItem: (product: Product, quantity?: number, notes?: string) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updateItemNotes: (productId: number, notes: string) => void;
  setCustomerNotes: (notes: string) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  tableNumber: 1, // Default table 1 if scanned or directly visited
  items: [],
  customerNotes: '',
  setTableNumber: (num: number) => set({ tableNumber: num }),
  addItem: (product: Product, quantity: number = 1, notes: string = '') => {
    set((state) => {
      const existingIndex = state.items.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...state.items];
        updated[existingIndex].quantity += quantity;
        if (notes) updated[existingIndex].notes = notes;
        return { items: updated };
      } else {
        return { items: [...state.items, { product, quantity, notes }] };
      }
    });
  },
  removeItem: (productId: number) => {
    set((state) => ({ items: state.items.filter((item) => item.product.id !== productId) }));
  },
  updateQuantity: (productId: number, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    }));
  },
  updateItemNotes: (productId: number, notes: string) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, notes } : item
      ),
    }));
  },
  setCustomerNotes: (notes: string) => set({ customerNotes: notes }),
  clearCart: () => set({ items: [], customerNotes: '' }),
  getTotalCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  getTotalPrice: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
}));
