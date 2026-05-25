import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFlyToCartStore } from '../pages/flyToCartStore';
import styles from '../css/FlyToCart.module.css';

const CART_TARGET_ID = 'nc-cart-trigger';

export const FlyToCart = () => {
  const current = useFlyToCartStore((s) => s.current);
  const completeFly = useFlyToCartStore((s) => s.completeFly);
  const [target, setTarget] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!current) return;

    const updateTarget = () => {
      const cartEl = document.getElementById(CART_TARGET_ID);
      if (!cartEl) return;
      const rect = cartEl.getBoundingClientRect();
      setTarget({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    };

    updateTarget();
    window.addEventListener('resize', updateTarget);
    window.addEventListener('scroll', updateTarget, true);

    return () => {
      window.removeEventListener('resize', updateTarget);
      window.removeEventListener('scroll', updateTarget, true);
    };
  }, [current]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          className={styles.flyLayer}
          aria-hidden
          initial={false}
        >
          <motion.img
            src={current.imageUrl}
            alt=""
            className={styles.flyImage}
            initial={{
              left: current.startX,
              top: current.startY,
              width: current.startSize,
              height: current.startSize,
              x: '-50%',
              y: '-50%',
              opacity: 1,
              scale: 1,
            }}
            animate={{
              left: target.x,
              top: target.y,
              width: 36,
              height: 36,
              x: '-50%',
              y: '-50%',
              opacity: 0.85,
              scale: 0.35,
            }}
            transition={{
              duration: 0.72,
              ease: [0.32, 0.72, 0.35, 1],
            }}
            onAnimationComplete={completeFly}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
