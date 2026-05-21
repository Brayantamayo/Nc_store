//wishlistStore.ts: Controla qué productos ha marcado el usuario como favoritos.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, WishlistState } from '../../../types';

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      toggle: (product: Product) => {
        const items = get().items;
        const isWishlisted = items.some((item) => item.id === product.id);

        if (isWishlisted) {
          set({ items: items.filter((item) => item.id !== product.id) });
        } else {
          set({ items: [...items, product] });
        }
      },

      isWishlisted: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },
    }),
    {
      name: 'nc-wishlist-storage',
    }
  )
);
