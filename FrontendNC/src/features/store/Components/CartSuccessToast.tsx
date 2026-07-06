//Su función es mostrar una notificación temporal (toast) 
// cuando un usuario agrega un producto al carrito.
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { useCartFeedbackStore } from '../pages/cartFeedbackStore';
import { useCartStore } from '../pages/cartStore';
import styles from '../css/CartSuccessToast.module.css';

export const CartSuccessToast = () => {
  const successMessage = useCartFeedbackStore((s) => s.successMessage);
  const hideSuccess = useCartFeedbackStore((s) => s.hideSuccess);
  const toggleCart = useCartStore((s) => s.toggleCart);

  useEffect(() => {
    if (!successMessage) return;

    const timeoutId = window.setTimeout(() => {
      hideSuccess();
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage, hideSuccess]);

  const handleOpenCart = () => {
    toggleCart(true);
    hideSuccess();
  };

  return (
    <AnimatePresence>
      {successMessage && (
        <motion.aside
          className={styles.toast}
          initial={{ opacity: 0, y: -18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -14, scale: 0.96 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          aria-live="polite"
        >
          <div className={styles.iconWrap}>
            <CheckCircle2 size={18} />
          </div>

          <div className={styles.copy}>
            <p className={styles.eyebrow}>Agregado con exito</p>
            <p className={styles.message}>
              {successMessage.productName}
              <span className={styles.quantity}>
                {successMessage.quantity > 1 ? ` x${successMessage.quantity}` : ''}
              </span>
            </p>
          </div>

          <button type="button" className={styles.action} onClick={handleOpenCart}>
            <ShoppingBag size={15} />
            Ver carrito
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
