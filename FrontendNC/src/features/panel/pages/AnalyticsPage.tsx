import { motion } from 'motion/react';
import { useProductStore } from '../../store/pages/productStore';
import styles from '../css/Admin.module.css';

export const AnalyticsPage = () => {
  const products = useProductStore((s) => s.products);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.chartsFlex}>
      <div className={styles.chartCard}>
        <h3 className={styles.chartCardTitle}>Distribución de Ventas por Categoría</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          {[
            { cat: 'Totes', count: products.filter((p) => p.category === 'tote').length, color: '#c2185b' },
            { cat: 'Minis', count: products.filter((p) => p.category === 'mini').length, color: '#f06292' },
            { cat: 'Clutches', count: products.filter((p) => p.category === 'clutch').length, color: '#e8a0b4' },
            { cat: 'Crossbody', count: products.filter((p) => p.category === 'crossbody').length, color: '#4a142c' },
            { cat: 'Shopper', count: products.filter((p) => p.category === 'shopper').length, color: '#ad1457' },
          ].map((row, index) => {
            const pct = products.length > 0 ? (row.count / products.length) * 100 : 0;
            return (
              <div key={index} style={{ fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 600 }}>{row.cat}</span>
                  <span>
                    {row.count} prod. ({Math.round(pct)}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', backgroundColor: row.color, borderRadius: '4px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.chartCard}>
        <h3 className={styles.chartCardTitle}>Tendencia de Ventas Semanales (COP)</h3>
        <svg viewBox="0 0 300 150" style={{ width: '100%', height: 'auto', marginTop: '1rem' }} fill="none">
          <path d="M10,130 L10,10 L300,10 M10,130 L290,130" stroke="rgba(74, 20, 44, 0.15)" strokeWidth="1" />
          <line x1="10" y1="90" x2="290" y2="90" stroke="rgba(74, 20, 44, 0.05)" strokeDasharray="3" />
          <line x1="10" y1="50" x2="290" y2="50" stroke="rgba(74, 20, 44, 0.05)" strokeDasharray="3" />
          <path d="M10,120 Q50,130 90,80 T170,100 T250,40 T290,20" stroke="#c2185b" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M10,120 Q50,130 90,80 T170,100 T250,40 T290,20 L290,130 L10,130 Z" fill="url(#glowGrad)" />
          <circle cx="90" cy="80" r="4.5" fill="#4a142c" />
          <circle cx="250" cy="40" r="4.5" fill="#c2185b" />
          <circle cx="290" cy="20" r="4.5" fill="#c2185b" />
          <text x="10" y="145" fill="#7d6b73" fontSize="8" textAnchor="middle">
            Sem 1
          </text>
          <text x="90" y="145" fill="#7d6b73" fontSize="8" textAnchor="middle">
            Sem 2
          </text>
          <text x="170" y="145" fill="#7d6b73" fontSize="8" textAnchor="middle">
            Sem 3
          </text>
          <text x="250" y="145" fill="#7d6b73" fontSize="8" textAnchor="middle">
            Sem 4
          </text>
        </svg>
      </div>
    </motion.div>
  );
};
