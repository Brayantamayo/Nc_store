///DETALES DE LA CUENTA
import styles from '../css/Login.module.css';

interface AccountDetailsForm {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
}

interface AccountDetailsSectionProps {
  accountForm: AccountDetailsForm;
  errors: Record<string, string>;
  isLoading?: boolean;
  onChange: (field: keyof AccountDetailsForm, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AccountDetailsSection = ({
  accountForm,
  errors,
  isLoading = false,
  onChange,
  onSubmit,
}: AccountDetailsSectionProps) => (
  <form onSubmit={onSubmit} className={styles.accountForm} noValidate>
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
    </div>

    <button type="submit" className={styles.saveBtn} disabled={isLoading}>
      {isLoading ? (
        <>
          <span className={styles.loadingDots} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          Guardando...
        </>
      ) : (
        'Guardar cambios'
      )}
    </button>
  </form>
);
