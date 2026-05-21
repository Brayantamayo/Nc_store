// src/types/product.ts
export type ProductCategory = 'tote' | 'clutch' | 'crossbody' | 'mini' | 'shopper';

export interface ColorOption {
  name: string;
  hex: string;
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
}

// src/types/cart.ts
export interface CartItem {
  id: string; // Composite ID: productId + colorName
  product: Product;
  quantity: number;
  selectedColor: ColorOption;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, color: ColorOption) => void;
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
