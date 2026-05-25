import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../../../types';
import { MOCK_PRODUCTS } from '../../../mockData';

interface ProductState {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updatedFields: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: MOCK_PRODUCTS,

      addProduct: (product: Product) => {
        set((state) => ({
          products: [product, ...state.products],
        }));
      },

      updateProduct: (id: string, updatedFields: Partial<Product>) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updatedFields } : p
          ),
        }));
      },

      deleteProduct: (id: string) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      resetProducts: () => {
        set({ products: MOCK_PRODUCTS });
      },
    }),
    {
      name: 'nc-products-storage',
    }
  )
);
