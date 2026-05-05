import { create } from "zustand";
import type { ShoppingItemType } from "../types/ShoppingItem";

interface ShoppingCartState {
  cart: ShoppingItemType[];
  addToCart: (item: ShoppingItemType) => void;
  clearCart: () => void;
  deleteItem: (id: number) => void;
  increase: (id: number) => void;
  decrease: (id: number) => void;
}

export const useShoppingCartStore = create<ShoppingCartState>((set) => ({
  cart: [],
  addToCart: (item) =>
    set((state) => {
      const existingIndex = state.cart.findIndex((i) => i.id === item.id);
      if (existingIndex !== -1) {
        const updatedCart = [...state.cart];
        updatedCart[existingIndex].quantity += item.quantity;
        return { cart: updatedCart };
      } else {
        return { cart: [...state.cart, item] };
      }
    }),
  clearCart: () => set({ cart: [] }),
  deleteItem: (id: number) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    })),
  increase: (id: number) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id && item.quantity <= item.inventory
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ),
    })),
  decrease: (id: number) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    })),
}));
