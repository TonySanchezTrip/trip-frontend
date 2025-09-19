import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define the type for a product in the cart
interface CartItem {
  id: number;
  name: string;
  price: string; // Keeping as string for now, convert to number for calculations
  imageUrl: string;
  quantity: number;
  selectedSize?: string; // Optional selected size
  selectedColor?: string; // Optional selected color
  selectedNfcOption?: boolean; // Optional selected NFC option
}

// Define the shape of the CartContext value
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'> & { selectedSize?: string; selectedColor?: string; selectedNfcOption?: boolean; }) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

// Create the context with a default (null) value
const CartContext = createContext<CartContextType | undefined>(undefined);

// CartProvider component to wrap the application
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Load cart from localStorage on initial render
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const localCart = localStorage.getItem('cartItems');
      return localCart ? JSON.parse(localCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  });

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cartItems]);

  const addToCart = (product: Omit<CartItem, 'quantity'> & { selectedSize?: string; selectedColor?: string; selectedNfcOption?: boolean; }) => {
    setCartItems(prevItems => {
      // Check if an item with the same ID AND same variations already exists
      const existingItem = prevItems.find(item => 
        item.id === product.id &&
        item.selectedSize === product.selectedSize &&
        item.selectedColor === product.selectedColor &&
        item.selectedNfcOption === product.selectedNfcOption
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === existingItem.id &&
          item.selectedSize === existingItem.selectedSize &&
          item.selectedColor === existingItem.selectedColor &&
          item.selectedNfcOption === existingItem.selectedNfcOption
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    // This needs to be updated to remove by ID and variations if multiple items with same ID but different variations are in cart
    // For now, it removes all items with that product ID
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    // This also needs to be updated to update by ID and variations
    setCartItems(prevItems => {
      if (quantity <= 0) {
        return prevItems.filter(item => item.id !== productId);
      }
      return prevItems.map(item =>
        item.id === productId ? { ...item, quantity: quantity } : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const priceValue = parseFloat(item.price.replace('$', ''));
      return total + (priceValue * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
