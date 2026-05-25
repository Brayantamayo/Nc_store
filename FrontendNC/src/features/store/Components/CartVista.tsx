// La barrita lateral que se abre cuando añades algo al carrito.
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '../../store/pages/cartStore';
import { Link } from 'react-router-dom';
import { CartSuggestions } from './CartSuggestions';
import styles from '../css/CartDrawer.module.css';

export const CartDrawer = () => {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total } = useCartStore();

  const closeDrawer = () => toggleCart(false);

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
              <h2 className={styles.title}>TU BOLSA ({items.length})</h2>
              <button onClick={closeDrawer} className={styles.closeBtn} type="button" aria-label="Cerrar carrito">
                <X size={24} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              <div className={styles.cartMain}>
                <div className={styles.content}>
                  {items.length === 0 ? (
                    <div className={styles.empty}>
                      <ShoppingBag size={48} strokeWidth={1} />
                      <p>Tu bolsa está vacía</p>
                      <Link to="/coleccion" onClick={closeDrawer} className={styles.emptyLink}>
                        Ver Colección
                      </Link>
                    </div>
                  ) : (
                    <ul className={styles.itemList}>
                      {items.map((item) => (
                        <li key={item.id} className={styles.item}>
                          <img src={item.product.images[0]} alt={item.product.name} className={styles.itemImage} />
                          <div className={styles.itemDetails}>
                            <div className={styles.itemHeader}>
                              <h3 className={styles.itemName}>{item.product.name}</h3>
                              <button
                                onClick={() => removeItem(item.id)}
                                className={styles.removeBtn}
                                aria-label="Eliminar producto"
                                type="button"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <p className={styles.itemMeta}>Color: {item.selectedColor.name}</p>
                            <div className={styles.itemFooter}>
                              <div className={styles.quantity}>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus size={14} />
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <p className={styles.itemPrice}>
                                {new Intl.NumberFormat('es-CO', {
                                  style: 'currency',
                                  currency: 'COP',
                                  maximumFractionDigits: 0,
                                }).format(item.product.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {items.length > 0 && (
                  <div className={styles.footer}>
                    <div className={styles.totalRow}>
                      <span>Total estimado</span>
                      <span>
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          maximumFractionDigits: 0,
                        }).format(total())}
                      </span>
                    </div>
                    <p className={styles.shippingInfo}>Impuestos y envío calculados al finalizar el pedido.</p>
                    <Link to="/carrito" onClick={closeDrawer} className={styles.checkoutBtn}>
                      Finalizar Pedido
                    </Link>
                  </div>
                )}
              </div>

              <CartSuggestions onNavigateProduct={closeDrawer} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
