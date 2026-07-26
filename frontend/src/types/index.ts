export type UserRole = 'ADMIN' | 'KITCHEN' | 'WAITER' | 'CASHIER';

export type OrderStatus = 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED' | 'PAID' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'CARD' | 'UNPAID';

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name_ar: string;
  name_en: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: number;
  category_id: number;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  category_name_ar?: string;
  category_name_en?: string;
}

export interface TableItem {
  id: number;
  number: number;
  capacity: number;
  is_active: boolean;
  qr_code_url?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name_ar: string;
  product_name_en: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: number;
  order_number: string;
  table_id: number;
  table_number?: number;
  status: OrderStatus;
  total_amount: number;
  payment_method: PaymentMethod;
  customer_notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface RestaurantSettings {
  restaurant_name_ar: string;
  restaurant_name_en: string;
  currency_symbol_ar: string;
  currency_symbol_en: string;
  logo_url?: string;
  welcome_message_ar?: string;
  welcome_message_en?: string;
}
