import { motion } from 'motion/react';
import { useAdminPanel } from '../context/AdminPanelContext';
import styles from '../css/Admin.module.css';

export const SettingsPage = () => {
  const { showMessage } = useAdminPanel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.glassCard}
      style={{ maxWidth: '600px' }}
    >
      <h2
        className={styles.chartCardTitle}
        style={{ fontSize: '1.4rem', borderBottom: '1px solid rgba(248, 187, 208, 0.3)', paddingBottom: '0.8rem' }}
      >
        Ajustes de Panel de Administración
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          showMessage('Configuraciones guardadas localmente.', 'success');
        }}
        className={styles.settingsForm}
        style={{ marginTop: '1.5rem' }}
      >
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Nombre de la Tienda</label>
          <input type="text" defaultValue="NC STORE" className={styles.textInput} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Moneda de Visualización</label>
          <select className={styles.textInput} style={{ padding: '0.75rem 1rem' }}>
            <option value="COP">COP ($) - Peso Colombiano</option>
            <option value="USD">USD ($) - Dólar Estadounidense</option>
            <option value="EUR">EUR (€) - Euro</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Costo de Envío Base (Medellín)</label>
          <input type="number" defaultValue="0" className={styles.textInput} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.toggleLabel}>
            <input type="checkbox" defaultChecked className={styles.toggleInput} />
            <span className={styles.toggleSwitch} />
            <span>Habilitar lazos coquette interactivos en animaciones</span>
          </label>
        </div>
        <button type="submit" className={styles.settingsSaveBtn}>
          Guardar Cambios
        </button>
      </form>
    </motion.div>
  );
};
