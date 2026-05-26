import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/pages/cartStore';
import { CartSuggestions } from './CartSuggestions';
import styles from '../css/CartDrawer.module.css';

const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

export const CartDrawer = () => {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total, clearCart, itemCount } = useCartStore();

  const closeDrawer = () => toggleCart(false);
  const totalItems = itemCount();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.div
            className={styles.drawer}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4 }}
          >
            <div className={styles.header}>
              <div>
                <p className={styles.kicker}>Tu seleccion</p>
                <h2 className={styles.title}>Carrito ({totalItems})</h2>
              </div>
              <button onClick={closeDrawer} className={styles.closeBtn} type="button" aria-label="Cerrar carrito">
                <X size={24} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              <CartSuggestions onNavigateProduct={closeDrawer} />

              <div className={styles.cartMain}>
                {items.length > 0 && (
                  <div className={styles.summaryBanner}>
                    <div className={styles.summaryCopy}>
                      <Sparkles size={15} />
                      <span>Tu bolsa esta casi lista para checkout.</span>
                    </div>
                    <button type="button" className={styles.clearBtn} onClick={clearCart}>
                      Vaciar
                    </button>
                  </div>
                )}

                <div className={styles.content}>
                  {items.length === 0 ? (
                    <div className={styles.empty}>
                      <ShoppingBag size={48} strokeWidth={1} />
                      <p>Tu bolsa esta vacia</p>
                      <span className={styles.emptyText}>
                        Agrega tus favoritos y aqui veras el resumen antes de pagar.
                      </span>
                      <Link to="/coleccion" onClick={closeDrawer} className={styles.emptyLink}>
                        Ir a coleccion
                      </Link>
                    </div>
                  ) : (
                    <ul className={styles.itemList}>
                      {items.map((item) => (
                        <li key={item.id} className={styles.item}>
                          <div className={styles.itemMedia}>
                            <img src={item.product.images[0]} alt={item.product.name} className={styles.itemImage} />
                          </div>

                          <div className={styles.itemDetails}>
                            <div className={styles.itemHeader}>
                              <div>
                                <h3 className={styles.itemName}>{item.product.name}</h3>
                                <p className={styles.itemMeta}>Color: {item.selectedColor.name}</p>
                              </div>
                              <p className={styles.itemUnitPrice}>{formatPrice(item.product.price)}</p>
                            </div>

                            <div className={styles.itemFooter}>
                              <div className={styles.quantity}>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  aria-label="Disminuir cantidad"
                                >
                                  <Minus size={14} />
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  aria-label="Aumentar cantidad"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>

                              <div className={styles.itemActions}>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className={styles.removeBtn}
                                  aria-label="Eliminar producto"
                                  type="button"
                                >
                                  <Trash2 size={15} />
                                  Quitar
                                </button>
                                <p className={styles.itemPrice}>{formatPrice(item.product.price * item.quantity)}</p>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {items.length > 0 && (
                  <div className={styles.footer}>
                    <div className={styles.totalBlock}>
                      <div className={styles.totalRow}>
                        <span>Subtotal</span>
                        <span>{formatPrice(total())}</span>
                      </div>
                      <div className={styles.totalRow}>
                        <span>Envio</span>
                        <span>Se calcula al pagar</span>
                      </div>
                    </div>

                    <p className={styles.shippingInfo}>Impuestos y envio calculados al finalizar el pedido.</p>

                    <div className={styles.footerActions}>
                      <button type="button" onClick={closeDrawer} className={styles.secondaryBtn}>
                        Seguir comprando
                      </button>
                      <Link to="/carrito" onClick={closeDrawer} className={styles.ghostBtn}>
                        Ver carrito
                      </Link>
                    </div>

                    <Link to="/carrito" onClick={closeDrawer} className={styles.checkoutBtn}>
                      <span>Finalizar compra</span>
                      <span>{formatPrice(total())}</span>
                      <ArrowRight size={16} />
                    </Link>
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
