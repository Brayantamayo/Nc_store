export type ProductCategory =
  | 'tote'
  | 'clutch'
  | 'crossbody'
  | 'mini'
  | 'shopper'
  | 'bolsos'
  | 'maquillaje'
  | 'accesorios'
  | 'monedero'
  | 'cosmetiquera'
  | 'accesorios-bolsos'
  | 'puffer'
  | 'combos'
  | 'descuentos';

export interface ColorOption {
  name: string;
  hex: string;
  varianteId?: number;
  opcionComboNombre?: string;
}


export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];           // [0] = principal, [1] = hover
  category: ProductCategory;
  colors: ColorOption[];
  material: string;
  description: string;
  isNew: boolean;
  isSoldOut: boolean;
  isFeatured: boolean;
  tags: string[];
  esCombo?: boolean;
  opcionesCombo?: string[];
}

// src/types/cart.ts
export interface CartItem {
  id: string; // Composite ID: productId + colorName
  product: Product;
  quantity: number;
  selectedColor: ColorOption;
  detallesCombo?: Record<string, string>;
  /** Stock disponible al momento de agregar. Se usa para limitar la cantidad máxima en el carrito. */
  stock: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, color: ColorOption, stock: number, detallesCombo?: Record<string, string>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  toggleCart: (open?: boolean) => void;
  clearCart: () => void;
  itemCount: () => number;
  total: () => number;
}

// src/types/wishlist.ts
export interface WishlistState {
  items: Product[];
  toggle: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
}

// src/types/ui.ts
export interface UIState {
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const BRAND_PLACEHOLDER_IMAGE = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect width='800' height='800' fill='%23fff5f8'/%3E%3Crect x='200' y='200' width='400' height='400' rx='40' fill='%23fcdce6'/%3E%3Cpath d='M350 400c-20-20-50-20-70 0s-20 50 0 70l120 120 120-120c20-20 20-50 0-70s-50-20-70 0l-50 50-50-50z' fill='%23db2777' opacity='0.75'/%3E%3Ctext x='400' y='280' font-family='sans-serif' font-size='32' font-weight='bold' fill='%23db2777' text-anchor='middle'%3ENC Store%3C/text%3E%3C/svg%3E";
