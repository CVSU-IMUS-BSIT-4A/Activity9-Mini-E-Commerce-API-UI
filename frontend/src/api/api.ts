import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  createdAt: string;
}

export interface Order {
  id: number;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export const productsApi = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
};

export const cartApi = {
  getAll: () => api.get<CartItem[]>('/cart'),
  addItem: (productId: number, quantity: number) =>
    api.post<CartItem>('/cart', { productId, quantity }),
  updateItem: (id: number, quantity: number) =>
    api.patch<CartItem>(`/cart/${id}`, { quantity }),
  removeItem: (id: number) => api.delete(`/cart/${id}`),
  clearCart: () => api.delete('/cart'),
};

export const ordersApi = {
  create: (items: Array<{ productId: number; quantity: number }>) =>
    api.post<Order>('/orders', { items }),
  getAll: () => api.get<Order[]>('/orders'),
  getById: (id: number) => api.get<Order>(`/orders/${id}`),
};

export default api;


