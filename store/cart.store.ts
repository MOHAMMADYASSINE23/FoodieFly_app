import { create } from "zustand";
import type { CartCustomization, CartItemType, CartStore } from "@/type";

const sameCustomizations = (
  left: CartCustomization[] = [],
  right: CartCustomization[] = [],
) =>
  left.length === right.length &&
  left.every((item) => right.some((candidate) => candidate.id === item.id));

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item: Omit<CartItemType, "quantity">) =>
    set((state) => {
      const existing = state.items.find(
        (line) =>
          line.id === item.id &&
          sameCustomizations(line.customizations, item.customizations),
      );

      if (existing) {
        return {
          items: state.items.map((line) =>
            line === existing ? { ...line, quantity: line.quantity + 1 } : line,
          ),
        };
      }

      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),
  removeItem: (id, customizations) =>
    set((state) => ({
      items: state.items.filter(
        (line) =>
          line.id !== id ||
          !sameCustomizations(line.customizations, customizations),
      ),
    })),
  increaseQty: (id, customizations) =>
    set((state) => ({
      items: state.items.map((line) =>
        line.id === id && sameCustomizations(line.customizations, customizations)
          ? { ...line, quantity: line.quantity + 1 }
          : line,
      ),
    })),
  decreaseQty: (id, customizations) =>
    set((state) => ({
      items: state.items.flatMap((line) => {
        if (line.id !== id || !sameCustomizations(line.customizations, customizations)) {
          return [line];
        }
        return line.quantity > 1 ? [{ ...line, quantity: line.quantity - 1 }] : [];
      }),
    })),
  clearCart: () => set({ items: [] }),
  getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
  getTotalPrice: () =>
    get().items.reduce((total, item) => {
      const extras = item.customizations?.reduce((sum, customization) => sum + customization.price, 0) ?? 0;
      return total + (item.price + extras) * item.quantity;
    }, 0),
}));
