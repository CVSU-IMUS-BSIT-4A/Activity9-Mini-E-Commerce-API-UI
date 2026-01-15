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
  userId?: number;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  deliveryDate?: string;
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  address?: string;
  contactNumber?: string;
  city?: string;
  postalCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const productsApi = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
  create: (product: Omit<Product, 'id'>) => api.post<Product>('/products', product),
  update: (id: number, product: Partial<Product>) => api.patch<Product>(`/products/${id}`, product),
  delete: (id: number) => api.delete(`/products/${id}`),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post<{ message: string; imageUrl: string; filename: string }>('/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
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
  create: (items: Array<{ productId: number; quantity: number }>, userId?: number) =>
    api.post<Order>('/orders', { items, userId }),
  getAll: () => api.get<Order[]>('/orders'),
  getById: (id: number) => api.get<Order>(`/orders/${id}`),
  getByUserId: (userId: number) => api.get<Order[]>(`/orders/user/${userId}`),
  updateStatus: (id: number, status: string) => 
    api.patch<Order>(`/orders/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/orders/${id}`),
};

export const usersApi = {
  create: (user: { name: string; email: string; password: string }) =>
    api.post<User>('/users', user),
  login: (email: string, password: string) =>
    api.post<User>('/users/login', { email, password }),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  update: (id: number, user: Partial<User>) =>
    api.patch<User>(`/users/${id}`, user),
  getAll: () => api.get<User[]>('/users'),
};

export default api;




