//REGISTRO DE USUARIOS
import styles from '../css/Login.module.css';

interface AuthRegisterSectionProps {
  registerEmail: string;
  errors: Record<string, string>;
  onRegisterEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AuthRegisterSection = ({
  registerEmail,
  errors,
  onRegisterEmailChange,
  onSubmit,
}: AuthRegisterSectionProps) => (
  <section className={styles.authColumn}>
    <h2 className={styles.authTitle}>Registrarse</h2>
    <form onSubmit={onSubmit} className={styles.authForm}>
      <div className={styles.fieldGroup}>
        <label htmlFor="registerEmail" className={styles.label}>
          Direccion de correo electronico <span className={styles.required}>*</span>
        </label>
        <input
          id="registerEmail"
          type="email"
          value={registerEmail}
          onChange={(e) => onRegisterEmailChange(e.target.value)}
          className={`${styles.input} ${errors.registerEmail ? styles.inputError : ''}`}
        />
        {errors.registerEmail && <span className={styles.errorText}>{errors.registerEmail}</span>}
      </div>

      <p className={styles.infoText}>
        Se enviara una contrasena temporal a tu direccion de correo electronico para que puedas ingresar a tu cuenta.
      </p>

      <p className={styles.infoText}>
        Apenas te registres, te dejamos dentro de tu perfil para que navegues por tus secciones sin problema.
      </p>

      <button type="submit" className={styles.primaryBtn}>
        REGISTRARSE
      </button>
    </form>
  </section>
);
