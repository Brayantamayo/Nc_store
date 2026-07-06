//genera sugerencias de productos para el carrito,
import { Product } from '../../../types';
import { useCartStore } from '../pages/cartStore';
import { useProductStore } from '../pages/productStore';

function getSuggestions(products: Product[], cartProductIds: Set<string>, limit = 6): Product[] {
  const notInCart = products.filter((p) => !cartProductIds.has(p.id));
  const available = notInCart.filter((p) => !p.isSoldOut);
  const soldOut   = notInCart.filter((p) => p.isSoldOut);
  return [...available, ...soldOut].slice(0, limit);
}

export function buildCartSuggestions(products: Product[], items: { product: { id: string } }[]) {
  const cartIds = new Set(items.map((i) => i.product.id));
  return getSuggestions(products, cartIds);
}


export const CartSuggestions = (_props: { onNavigateProduct?: () => void }) => {
  const products = useProductStore((s) => s.products);
  const items = useCartStore((s) => s.items);

  void buildCartSuggestions(products, items);
  return null;
};
