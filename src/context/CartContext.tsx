import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  isItemInCart: (productId: string) => boolean;
  totalItems: number;
  totalPrice: number;
}

// Create context with default values
const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  updateItemQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  isItemInCart: () => false,
  totalItems: 0,
  totalPrice: 0
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useLocalStorage<CartItem[]>('cart', []);
  const [totalItems, setTotalItems] = React.useState(0);
  const [totalPrice, setTotalPrice] = React.useState(0);

  // Calculate totals whenever cart changes
  useEffect(() => {
    const items = cart.reduce((total, item) => total + item.quantity, 0);
    const price = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    setTotalItems(items);
    setTotalPrice(price);
  }, [cart]);

  // Add item to cart
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Item exists, increment quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        return updatedCart;
      } else {
        // Item doesn't exist, add with quantity 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Update item quantity
  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      // If quantity is 0 or less, remove the item
      removeItem(productId);
      return;
    }

    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
        if (item.id === productId) {
          return { ...item, quantity };
        }
        return item;
      });
      return updatedCart;
    });
  };

  // Remove item from cart
  const removeItem = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Check if item is in cart
  const isItemInCart = (productId: string) => {
    return cart.some(item => item.id === productId);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        updateItemQuantity, 
        removeItem, 
        clearCart, 
        isItemInCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};