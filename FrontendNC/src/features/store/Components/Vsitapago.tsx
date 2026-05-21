///Es la página del carrito de compras donde se ve el resumen del pedido.
import { motion } from 'motion/react';
import { Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store//pages/cartStore';
import styles from '../css/Cart.module.css';

export const Cart = () => {
  const { items, removeItem, updateQuantity, total } = useCartStore();

  if (items.length === 0) {
    return (
      <div className={styles.emptyPage}>
        <div className="container">
           <h1 className={styles.emptyTitle}>Tu bolsa está vacía</h1>
           <p className={styles.emptyText}>Parece que aún no has añadido nada a tu selección de lujo.</p>
           <Link to="/coleccion" className={styles.emptyLink}>Explorar Colección</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container">
        <header className={styles.header}>
          <Link to="/coleccion" className={styles.backLink}>
            <ArrowLeft size={16} /> Continuar comprando
          </Link>
          <h1 className={styles.title}>Bolsa de Compras</h1>
        </header>

        <div className={styles.layout}>
          {/* List */}
          <div className={styles.list}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <Link to={`/producto/${item.product.slug}`} className={styles.itemImageWrapper}>
                  <img src={item.product.images[0]} alt={item.product.name} className={styles.itemImage} />
                </Link>
                <div className={styles.itemInfo}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemName}>{item.product.name}</h3>
                    <p className={styles.itemPrice}>
                      {new Intl.NumberFormat('es-CO', { 
                        style: 'currency', 
                        currency: 'COP',
                        maximumFractionDigits: 0 
                      }).format(item.product.price)}
                    </p>
                  </div>
                  <p className={styles.itemMeta}>Color: {item.selectedColor.name}</p>
                  
                  <div className={styles.itemControls}>
                    <div className={styles.quantity}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className={styles.removeBtn}>
                      <Trash2 size={18} />
                    </button>
                    <p className={styles.itemSubtotal}>
                       {new Intl.NumberFormat('es-CO', { 
                        style: 'currency', 
                        currency: 'COP',
                        maximumFractionDigits: 0 
                      }).format(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Resumen del pedido</h2>
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>
                    {new Intl.NumberFormat('es-CO', { 
                      style: 'currency', 
                      currency: 'COP',
                      maximumFractionDigits: 0 
                    }).format(total())}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Envío</span>
                  <span className={styles.free}>Gratis</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.total}`}>
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat('es-CO', { 
                      style: 'currency', 
                      currency: 'COP',
                      maximumFractionDigits: 0 
                    }).format(total())}
                  </span>
                </div>
              </div>
              <button className={styles.checkoutBtn}>Proceder al Pago</button>
              <div className={styles.paymentIcons}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
