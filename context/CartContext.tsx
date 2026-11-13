"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Product } from "@/lib/types";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variations?: Record<string, string>) => void;
  removeFromCart: (productId: string, variations?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, variations?: Record<string, string>) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("acasa_cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("acasa_cart", JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  const areVariationsEqual = (v1?: Record<string, string>, v2?: Record<string, string>) => {
    if (!v1 && !v2) return true;
    if (!v1 || !v2) return false;
    const keys1 = Object.keys(v1);
    const keys2 = Object.keys(v2);
    if (keys1.length !== keys2.length) return false;
    return keys1.every((k) => v1[k] === v2[k]);
  };

  const addToCart = (product: Product, quantity = 1, variations?: Record<string, string>) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && areVariationsEqual(item.selectedVariations, variations)
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, { product, quantity, selectedVariations: variations }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, variations?: Record<string, string>) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && areVariationsEqual(item.selectedVariations, variations))
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, variations?: Record<string, string>) => {
    if (quantity <= 0) {
      removeFromCart(productId, variations);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && areVariationsEqual(item.selectedVariations, variations)) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cart.reduce((acc, item) => {
    const price = item.product.salePrice ?? item.product.regularPrice;
    return acc + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
