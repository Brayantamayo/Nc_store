///cartStore.ts: Controla qué productos hay en el carrito y suma los totales.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartState, ColorOption, Product } from '../../../types';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, color: ColorOption) => {
        const cartItemId = `${product.id}-${color.name}`;
        const items = get().items;
        const existingItem = items.find((item) => item.id === cartItemId);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === cartItemId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({
            items: [...items, { id: cartItemId, product, quantity: 1, selectedColor: color }],
          });
        }
      },

      removeItem: (cartItemId: string) => {
        set({
          items: get().items.filter((item) => item.id !== cartItemId),
        });
      },

      updateQuantity: (cartItemId: string, quantity: number) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.id === cartItemId ? { ...item, quantity } : item
          ),
        });
      },

      toggleCart: (open) => {
        set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen }));
      },

      clearCart: () => set({ items: [] }),

      itemCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      
      total: () => get().items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    }),
    {
      name: 'nc-cart-storage',
    }
  )
);
