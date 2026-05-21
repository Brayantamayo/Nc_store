// La tira de texto que se mueve (usualmente para promociones).
import { Bow } from './Moñito';
import styles from '../css/MarqueeTicker.module.css';

interface MarqueeTickerProps {
  items?: string[];
}

const DEFAULT_ITEMS = [
  'COQUETTE LUXURY',
  'NC STORE MEDELLÍN',
  'BOLSOS CON ALMA',
  'HECHO CON AMOR',
  'NUEVA COLECCIÓN',
  'COQUETTE CHIC'
];

export const MarqueeTicker = ({ items = DEFAULT_ITEMS }: MarqueeTickerProps) => {
  return (
    <div className={styles.marquee}>
      <div className={styles.content}>
        {[...items, ...items, ...items].map((item, index) => (
          <span key={index} className={styles.item}>
            {item} <Bow size={14} className={styles.bowIcon} />
          </span>
        ))}
      </div>
    </div>
  );
};
