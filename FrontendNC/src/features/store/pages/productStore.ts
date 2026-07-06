import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { productoService } from '../../productos/services/productoService';
import type { ProductoApiItem } from '../../productos/types';
import { Product } from '../../../types';

const colorMap: Record<string, string> = {
  negro: '#000000',
  blanco: '#FFFFFF',
  rosado: '#E91E8C',
  rosa: '#E91E8C',
  rojo: '#FF0000',
  azul: '#0066FF',
  verde: '#00AA00',
  amarillo: '#FFFF00',
  naranja: '#FF8800',
  morado: '#9933FF',
  gris: '#808080',
  beige: '#D4BCA8',
  cafe: '#8B4513',
  marron: '#8B4513',
};

const toProduct = (p: ProductoApiItem): Product => {
  const variantes = p.variantes?.filter((v) => ('activo' in v ? v.activo : true)) || [];
  const images = variantes.flatMap((v) => v.imagenes).filter(Boolean);

  return {
    id: String(p.id),
    slug: p.slug,
    name: p.nombre,
    price: Number(p.precio),
    originalPrice: p.precioOriginal ? Number(p.precioOriginal) : undefined,
    images: images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'],
    category: (p.categoria?.slug?.toLowerCase() || 'general') as Product['category'],
    colors: variantes
      .filter((v): v is typeof v & { color: string } => 'color' in v && !!v.color)
      .map((v) => ({
        name: v.color,
        hex: colorMap[v.color.toLowerCase().trim()] || '#db2777',
      })),
    material: '',
    description: p.descripcion || '',
    isNew: false,
    isSoldOut: variantes.length === 0 || !variantes.some((v) => (v as { stock?: number }).stock && (v as { stock?: number }).stock! > 0),
    isFeatured: false,
    tags: [],
  };
};

interface ProductState {
  products: Product[];
  isLoading: boolean;
  hasLoaded: boolean;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updatedFields: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  loadProducts: () => Promise<void>;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: [],
      isLoading: false,
      hasLoaded: false,

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

      loadProducts: async () => {
        set({ isLoading: true });
        try {
          const response = await productoService.listarParaTienda(1, 100);
          set({
            products: response.data.map(toProduct),
            hasLoaded: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'nc-products-storage',
      // No persistir los productos — siempre se cargan frescos desde el backend
      partialize: () => ({}),
    }
  )
);
