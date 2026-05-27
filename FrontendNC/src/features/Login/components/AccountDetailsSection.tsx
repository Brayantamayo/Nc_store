///DETALES DE LA CUENTA
import styles from '../css/Login.module.css';

interface AccountDetailsForm {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  password: string;
}

interface AccountDetailsSectionProps {
  accountForm: AccountDetailsForm;
  errors: Record<string, string>;
  onChange: (field: keyof AccountDetailsForm, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AccountDetailsSection = ({
  accountForm,
  errors,
  onChange,
  onSubmit,
}: AccountDetailsSectionProps) => (
  <form onSubmit={onSubmit} className={styles.accountForm}>
    <div className={styles.highlightBanner}>
      Tu cuenta de NC Store esta utilizando una contrasena temporal. Te enviamos por correo electronico la clave inicial para que puedas ingresar.
    </div>

    <div className={styles.formGrid}>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          Nombre <span className={styles.required}>*</span>
        </label>
        <input
          className={`${styles.input} ${errors.accountFirstName ? styles.inputError : ''}`}
          value={accountForm.firstName}
          onChange={(e) => onChange('firstName', e.target.value)}
        />
        {errors.accountFirstName && <span className={styles.errorText}>{errors.accountFirstName}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Apellidos</label>
        <input className={styles.input} value={accountForm.lastName} onChange={(e) => onChange('lastName', e.target.value)} />
      </div>

      <div className={`${styles.fieldGroup} ${styles.fullSpan}`}>
        <label className={styles.label}>
          Nombre visible <span className={styles.required}>*</span>
        </label>
        <input
          className={`${styles.input} ${errors.accountDisplayName ? styles.inputError : ''}`}
          value={accountForm.displayName}
          onChange={(e) => onChange('displayName', e.target.value)}
        />
        <span className={styles.helpText}>
          Asi sera como se mostrara tu nombre en la seccion de tu cuenta y en las valoraciones.
        </span>
        {errors.accountDisplayName && <span className={styles.errorText}>{errors.accountDisplayName}</span>}
      </div>

      <div className={`${styles.fieldGroup} ${styles.fullSpan}`}>
        <label className={styles.label}>
          Direccion de correo electronico <span className={styles.required}>*</span>
        </label>
        <input
          className={`${styles.input} ${errors.accountEmail ? styles.inputError : ''}`}
          value={accountForm.email}
          onChange={(e) => onChange('email', e.target.value)}
        />
        {errors.accountEmail && <span className={styles.errorText}>{errors.accountEmail}</span>}
      </div>

      <div className={`${styles.fieldGroup} ${styles.fullSpan}`}>
        <label className={styles.label}>
          Contrasena <span className={styles.required}>*</span>
        </label>
        <input
          className={`${styles.input} ${errors.accountPassword ? styles.inputError : ''}`}
          value={accountForm.password}
          onChange={(e) => onChange('password', e.target.value)}
        />
        {errors.accountPassword && <span className={styles.errorText}>{errors.accountPassword}</span>}
      </div>
    </div>

    <button type="submit" className={styles.saveBtn}>
      Guardar cambios
    </button>
  </form>
);
