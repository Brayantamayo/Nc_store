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
