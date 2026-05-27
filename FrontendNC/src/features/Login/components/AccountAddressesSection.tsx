////DIRRECIONES DE LA CUENTA
import type { CustomerAddress } from '../services/customerSessionService';
import styles from '../css/Login.module.css';

interface AccountAddressesSectionProps {
  addressForm: CustomerAddress;
  regions: Record<string, string[]>;
  onChange: (field: keyof CustomerAddress, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AccountAddressesSection = ({
  addressForm,
  regions,
  onChange,
  onSubmit,
}: AccountAddressesSectionProps) => (
  <form onSubmit={onSubmit} className={styles.accountForm}>
    <h2 className={styles.sectionTitle}>Direccion de envio</h2>

    <div className={styles.formGrid}>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Nombre <span className={styles.required}>*</span>
        </label>
        <input className={styles.input} value={addressForm.firstName} onChange={(e) => onChange('firstName', e.target.value)} />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Apellidos <span className={styles.required}>*</span>
        </label>
        <input className={styles.input} value={addressForm.lastName} onChange={(e) => onChange('lastName', e.target.value)} />
      </div>

      <div className={`${styles.fieldGroup} ${styles.fullSpan}`}>
        <label className={styles.label}>
          Pais / Region <span className={styles.required}>*</span>
        </label>
        <div className={styles.staticField}>Colombia</div>
      </div>

      <div className={`${styles.fieldGroup} ${styles.fullSpan}`}>
        <label className={styles.label}>
          Direccion de la calle <span className={styles.required}>*</span>
        </label>
        <input
          className={styles.input}
          placeholder="Nombre de la calle y numero de la casa"
          value={addressForm.addressLine1}
          onChange={(e) => onChange('addressLine1', e.target.value)}
        />
      </div>

      <div className={`${styles.fieldGroup} ${styles.fullSpan}`}>
        <input
          className={styles.input}
          placeholder="Apartamento, habitacion, etc. (opcional)"
          value={addressForm.addressLine2}
          onChange={(e) => onChange('addressLine2', e.target.value)}
        />
      </div>

      <div className={`${styles.fieldGroup} ${styles.fullSpan}`}>
        <label className={styles.label}>
          Region / Provincia <span className={styles.required}>*</span>
        </label>
        <select className={styles.input} value={addressForm.region} onChange={(e) => onChange('region', e.target.value)}>
          <option value="">Elige una opcion...</option>
          {Object.keys(regions).map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <div className={`${styles.fieldGroup} ${styles.fullSpan}`}>
        <label className={styles.label}>
          Poblacion <span className={styles.required}>*</span>
        </label>
        <select className={styles.input} value={addressForm.city} onChange={(e) => onChange('city', e.target.value)}>
          <option value="">Elige una opcion...</option>
          {(regions[addressForm.region] ?? []).map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className={`${styles.fieldGroup} ${styles.fullSpan}`}>
        <label className={styles.label}>Codigo postal / ZIP (opcional)</label>
        <input className={styles.input} value={addressForm.postalCode} onChange={(e) => onChange('postalCode', e.target.value)} />
      </div>
    </div>

    <button type="submit" className={styles.saveBtn}>
      Guardar direccion
    </button>
  </form>
);
