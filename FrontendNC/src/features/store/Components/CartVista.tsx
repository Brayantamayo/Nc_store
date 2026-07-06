//Componente que muestra el panel de carrito
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import { useCartStore } from '../../store/pages/cartStore';
import { buildCartSuggestions } from './CartSuggestions';
import { useProductStore } from '../pages/productStore';
import { useCartFeedbackStore } from '../../store/pages/cartFeedbackStore';
import { useFlyToCartStore } from '../pages/flyToCartStore';
import { productoService } from '../../productos/services/productoService';
import { ColorOption } from '../../../types';
import styles from '../css/CartDrawer.module.css';

const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

export const CartDrawer = () => {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total, clearCart, itemCount, addItem } = useCartStore();
  const products = useProductStore((s) => s.products);
  const showSuccess = useCartFeedbackStore((s) => s.showSuccess);
  const triggerFly = useFlyToCartStore((s) => s.triggerFly);
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);

  const closeDrawer = () => toggleCart(false);
  const totalItems = itemCount();
  const suggestions = buildCartSuggestions(products, items);
  const hasSuggestions = suggestions.length > 0;

  const handleCheckout = async () => {
    setIsValidating(true);
    try {
      for (const item of items) {
        const prodDetail = await productoService.obtenerPorId(Number(item.product.id));
        const variant = prodDetail.variantes?.find(
          (v) => v.color.toLowerCase().trim() === item.selectedColor.name.toLowerCase().trim()
        );

        if (!variant) {
          toast.error(`El producto "${item.product.name} (${item.selectedColor.name})" ya no está disponible.`);
          setIsValidating(false);
          return;
        }

        if (variant.stock < item.quantity) {
          const d = variant.stock;
          toast.error(
            d === 0
              ? `"${item.product.name}" está agotado.`
              : `Solo quedan ${d} unidad${d === 1 ? '' : 'es'} de "${item.product.name}".`
          );
          setIsValidating(false);
          return;
        }
      }
      closeDrawer();
      navigate('/finalizar-compra');
    } catch {
      toast.error('No pudimos verificar el stock. Intenta de nuevo.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleQuickAdd = (productId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (product.colors.length === 0) {
      toast.error('No hay variantes disponibles para este producto.');
      return;
    }
    const color: ColorOption = product.colors[0];
    triggerFly(product.images[0], e.currentTarget);
    addItem(product, color, 99);
    showSuccess({ productName: product.name, quantity: 1 });
  };

  const showPanel = hasSuggestions && suggestionsOpen && items.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.div
            className={`${styles.drawer} ${showPanel ? styles.drawerWide : ''}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 38 }}
          >
            {/* ── TOP HEADER BAR ── */}
            <div className={styles.topBar}>
              {/* Left tab — suggestions toggle */}
              {hasSuggestions && items.length > 0 && (
                <button
                  type="button"
                  className={`${styles.tabBtn} ${showPanel ? styles.tabBtnActive : ''}`}
                  onClick={() => setSuggestionsOpen((v) => !v)}
                >
                  {showPanel ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                  <span>Te pueden gustar</span>
                </button>
              )}

              {/* Right side — cart title + close */}
              <div className={styles.topBarRight}>
                <div className={styles.cartLabel}>
                  <ShoppingBag size={17} className={styles.cartIcon} />
                  <span className={styles.cartTitle}>Carrito</span>
                  {totalItems > 0 && <span className={styles.countBadge}>{totalItems}</span>}
                </div>
                <button onClick={closeDrawer} className={styles.closeBtn} type="button" aria-label="Cerrar carrito">
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* ── BODY: two-column ── */}
            <div className={styles.body}>

              {/* LEFT — Suggestions panel */}
              <AnimatePresence initial={false}>
                {showPanel && (
                  <motion.aside
                    className={styles.suggestPanel}
                    key="suggest"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 270, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className={styles.suggestInner}>
                      <div className={styles.suggestHeader}>
                        <p className={styles.suggestHeading}>Te pueden gustar</p>
                        <p className={styles.suggestSub}>Combina con tu selección</p>
                      </div>

                      <ul className={styles.suggestList}>
                        {suggestions.map((product) => (
                          <li key={product.id} className={styles.suggestItem}>
                            <Link
                              to={`/producto/${product.slug}`}
                              onClick={closeDrawer}
                              className={styles.suggestImgLink}
                            >
                              <img src={product.images[0]} alt={product.name} className={styles.suggestImg} />
                            </Link>
                            <div className={styles.suggestInfo}>
                              <Link
                                to={`/producto/${product.slug}`}
                                onClick={closeDrawer}
                                className={styles.suggestName}
                              >
                                {product.name}
                              </Link>
                              <span className={styles.suggestPrice}>{formatPrice(product.price)}</span>
                              <button
                                type="button"
                                className={styles.suggestAddBtn}
                                onClick={(e) => handleQuickAdd(product.id, e)}
                                disabled={product.isSoldOut}
                              >
                                {product.isSoldOut ? 'Agotado' : 'Añadir al carrito'}
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.aside>
                )}
              </AnimatePresence>

              {/* Divider */}
              {showPanel && <div className={styles.divider} />}

              {/* RIGHT — Cart items */}
              <div className={styles.cartPanel}>

                {/* Items scroll */}
                <div className={styles.itemsScroll}>
                  {items.length === 0 ? (
                    <div className={styles.empty}>
                      <div className={styles.emptyIcon}>
                        <ShoppingBag size={38} strokeWidth={1.2} />
                      </div>
                      <p className={styles.emptyTitle}>Tu bolsa está vacía</p>
                      <span className={styles.emptyText}>
                        Agrega tus piezas favoritas y aquí verás el resumen.
                      </span>
                      <Link to="/coleccion" onClick={closeDrawer} className={styles.emptyLink}>
                        Explorar colección <ChevronRight size={14} />
                      </Link>
                    </div>
                  ) : (
                    <ul className={styles.itemList}>
                      {items.map((item, i) => (
                        <motion.li
                          key={item.id}
                          className={styles.item}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          layout
                        >
                          {/* Thumbnail */}
                          <div className={styles.itemThumb}>
                            <img src={item.product.images[0]} alt={item.product.name} className={styles.itemImage} />
                          </div>

                          {/* Info */}
                          <div className={styles.itemBody}>
                            <div className={styles.itemTop}>
                              <div className={styles.itemMeta}>
                                <h3 className={styles.itemName}>{item.product.name}</h3>
                                <span className={styles.itemColor}>
                                  <span
                                    className={styles.colorDot}
                                    style={{ background: item.selectedColor.hex ?? '#c2185b' }}
                                  />
                                  {item.selectedColor.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className={styles.removeBtn}
                                aria-label="Eliminar"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            <div className={styles.itemBottom}>
                              {/* Quantity pill */}
                              <div className={styles.qtyPill}>
                                <button
                                  type="button"
                                  className={styles.qtyBtn}
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  aria-label="Restar"
                                >
                                  <Minus size={11} />
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  max={item.stock}
                                  value={item.quantity}
                                  className={styles.qtyInput}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    if (isNaN(val) || val < 1) return;
                                    if (val > item.stock) {
                                      toast.error(`Solo hay ${item.stock} unidad${item.stock === 1 ? '' : 'es'} disponibles.`);
                                      updateQuantity(item.id, item.stock);
                                      return;
                                    }
                                    updateQuantity(item.id, val);
                                  }}
                                  aria-label="Cantidad"
                                />
                                <button
                                  type="button"
                                  className={styles.qtyBtn}
                                  onClick={() => {
                                    if (item.quantity >= item.stock) {
                                      toast.error(`Solo hay ${item.stock} unidad${item.stock === 1 ? '' : 'es'} disponibles.`);
                                      return;
                                    }
                                    updateQuantity(item.id, item.quantity + 1);
                                  }}
                                  disabled={item.quantity >= item.stock}
                                  aria-label="Sumar"
                                >
                                  <Plus size={11} />
                                </button>
                              </div>

                              {/* Price */}
                              <div className={styles.itemPriceBlock}>
                                <span className={styles.itemTotal}>{formatPrice(item.product.price * item.quantity)}</span>
                                {item.quantity > 1 && (
                                  <span className={styles.itemUnit}>{formatPrice(item.product.price)} c/u</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                  <div className={styles.footer}>
                    {/* Clear + total */}
                    <div className={styles.totalRow}>
                      <div>
                        <p className={styles.totalLabel}>Total</p>
                        <p className={styles.shippingNote}>Envío calculado al finalizar el pedido</p>
                      </div>
                      <div className={styles.totalRight}>
                        <button type="button" className={styles.clearBtn} onClick={clearCart}>
                          Vaciar carrito
                        </button>
                        <span className={styles.totalValue}>{formatPrice(total())}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className={styles.footerActions}>
                      <button type="button" onClick={closeDrawer} className={styles.continueBtn}>
                        Seguir comprando
                      </button>
                      <Link to="/carrito" onClick={closeDrawer} className={styles.viewCartBtn}>
                        Ver carrito
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleCheckout()}
                      disabled={isValidating}
                      className={styles.checkoutBtn}
                    >
                      <span>{isValidating ? 'Verificando...' : 'Finalizar compra'}</span>
                      <span className={styles.checkoutPrice}>
                        {formatPrice(total())} <ArrowRight size={15} />
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
