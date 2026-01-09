import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartApi, CartItem } from '../api/api';

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const refreshCart = async () => {
    try {
      const response = await cartApi.getAll();
      setCartItems(response.data);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCartItems([]);
    }
  };

  useEffect(() => {
    refreshCart().catch(() => {
      // Silently fail if backend is down - user can still use the app
    });
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};



