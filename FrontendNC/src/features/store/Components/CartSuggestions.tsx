import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product, ColorOption } from '../../../types';
import { useProductStore } from '../pages/productStore';
import { useCartStore } from '../pages/cartStore';
import { useFlyToCartStore } from '../pages/flyToCartStore';
import styles from '../css/CartDrawer.module.css';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price);

function getSuggestions(products: Product[], cartProductIds: Set<string>, limit = 5): Product[] {
  const available = products.filter((p) => !p.isSoldOut && !cartProductIds.has(p.id));

  const featured = available.filter((p) => p.isFeatured);
  const rest = available.filter((p) => !p.isFeatured);

  return [...featured, ...rest].slice(0, limit);
}

interface CartSuggestionsProps {
  /** Cierra el drawer al ir al detalle del producto */
  onNavigateProduct?: () => void;
}

export const CartSuggestions = ({ onNavigateProduct }: CartSuggestionsProps) => {
  const products = useProductStore((s) => s.products);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const triggerFly = useFlyToCartStore((s) => s.triggerFly);

  const cartIds = new Set(items.map((i) => i.product.id));
  const suggestions = getSuggestions(products, cartIds);

  if (suggestions.length === 0) return null;

  const handleQuickAdd = (product: Product, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const color: ColorOption = product.colors[0];
    triggerFly(product.images[0], e.currentTarget);
    addItem(product, color);
  };

  return (
    <aside className={styles.suggestionsPanel} aria-label="También puedes llevar">
      <h3 className={styles.suggestionsTitle}>También puedes llevar</h3>
      <p className={styles.suggestionsSubtitle}>Completa tu bolsa con estas piezas</p>

      <ul className={styles.suggestionsList}>
        {suggestions.map((product) => (
          <li key={product.id} className={styles.suggestionItem}>
            <Link
              to={`/producto/${product.slug}`}
              className={styles.suggestionImageLink}
              onClick={onNavigateProduct}
            >
              <img src={product.images[0]} alt={product.name} className={styles.suggestionImage} />
            </Link>
            <div className={styles.suggestionInfo}>
              <Link
                to={`/producto/${product.slug}`}
                className={styles.suggestionName}
                onClick={onNavigateProduct}
              >
                {product.name}
              </Link>
              <span className={styles.suggestionPrice}>{formatPrice(product.price)}</span>
              <button
                type="button"
                className={styles.suggestionAddBtn}
                onClick={(e) => handleQuickAdd(product, e)}
                aria-label={`Añadir ${product.name} al carrito`}
              >
                <Plus size={14} />
                Añadir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};
