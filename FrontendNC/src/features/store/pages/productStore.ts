import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { productoService } from '../../productos/services/productoService';
import type { ProductoApiItem } from '../../productos/types';
import { Product } from '../../../types';

const colorMap: Record<string, string> = {
  negro: '#1a1a1a', blanco: '#f5f5f5', gris: '#9e9e9e',
  rosado: '#f48fb1', rosa: '#f48fb1', 'rosa fucsia': '#e91e8c', fucsia: '#e91e8c',
  rojo: '#e53935', coral: '#ff7043', naranja: '#fb8c00', amarillo: '#fdd835',
  verde: '#43a047', 'verde menta': '#80cbc4', azul: '#1e88e5', 'azul cielo': '#81d4fa',
  morado: '#8e24aa', lavanda: '#ce93d8', beige: '#d7b899', café: '#6d4c41',
  cafe: '#6d4c41', dorado: '#ffd54f', plateado: '#b0bec5', nude: '#e8c4a0',
  marron: '#8b4513', marrón: '#8b4513',
};

const toProduct = (p: ProductoApiItem): Product => {
  const variantes = p.variantes?.filter((v) => ('activo' in v ? v.activo : true)) || [];
  const fallback = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800';

  // La imagen principal del producto es solo la imagenPrincipal.
  // Las imágenes de variantes solo se usan en ProductDetail al elegir color.
  const allVariantImages = variantes.flatMap((v) => v.imagenes).filter(Boolean);
  const images = p.imagenPrincipal
    ? [p.imagenPrincipal]
    : allVariantImages.length > 0
      ? [allVariantImages[0]]
      : [fallback];

  return {
    id: String(p.id),
    slug: p.slug,
    name: p.nombre,
    price: Number(p.precio),
    originalPrice: p.precioOriginal ? Number(p.precioOriginal) : undefined,
    images,
    category: (p.categoria?.slug?.toLowerCase() || 'general') as Product['category'],
    colors: variantes
      .filter((v): v is typeof v & { color: string } => 'color' in v && !!v.color)
      .map((v, i) => {
        const trimmed = v.color.trim();
        const parts = trimmed.split('|');

        // 1. Si contiene el separador "nombre|#hex"
        if (parts.length === 2) {
          return {
            name: parts[0].trim(),
            hex: parts[1].trim(),
            varianteId: (v as any).id,
            opcionComboNombre: (v as any).opcionComboNombre,
          };
        }

        // 2. Si ya es un hex válido → usarlo directamente
        if (/^#[0-9a-fA-F]{3,6}$/.test(trimmed)) {
          return {
            name: trimmed,
            hex: trimmed,
            varianteId: (v as any).id,
            opcionComboNombre: (v as any).opcionComboNombre,
          };
        }
        // 3. Buscar por nombre exacto en el mapa
        const normalized = trimmed.toLowerCase();
        let hex = colorMap[normalized];
        // 4. Búsqueda parcial
        if (!hex) {
          const partial = Object.keys(colorMap).find(
            (k) => normalized.includes(k) || k.includes(normalized)
          );
          hex = partial ? colorMap[partial] : undefined;
        }
        // 5. Fallback rotativo
        const fallbacks = ['#c2185b', '#f48fb1', '#1a1a1a', '#f5f5f5', '#9e9e9e', '#fb8c00'];

        return {
          name: trimmed,
          hex: hex ?? fallbacks[i % fallbacks.length],
          varianteId: (v as any).id,
          opcionComboNombre: (v as any).opcionComboNombre,
        };
      }),
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
