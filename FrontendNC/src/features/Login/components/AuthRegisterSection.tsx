//REGISTRO DE USUARIOS
import styles from '../css/Login.module.css';

interface AuthRegisterSectionProps {
  registerEmail: string;
  errors: Record<string, string>;
  isLoading?: boolean;
  onRegisterEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AuthRegisterSection = ({
  registerEmail,
  errors,
  isLoading = false,
  onRegisterEmailChange,
  onSubmit,
}: AuthRegisterSectionProps) => (
  <section className={styles.authColumn}>
    <h2 className={styles.authTitle}>Registrarse</h2>
    <form onSubmit={onSubmit} className={styles.authForm} noValidate>
      <div className={styles.fieldGroup}>
        <label htmlFor="registerEmail" className={styles.label}>
          Direccion de correo electronico <span className={styles.required}>*</span>
        </label>
        <input
          id="registerEmail"
          type="email"
          autoComplete="email"
          value={registerEmail}
          onChange={(e) => onRegisterEmailChange(e.target.value)}
          className={`${styles.input} ${errors.registerEmail ? styles.inputError : ''}`}
        />
        {errors.registerEmail && <span className={styles.errorText}>{errors.registerEmail}</span>}
      </div>

      <p className={styles.infoText}>
        Se enviara un enlace a tu correo para crear tu contrasena inicial y activar tu cuenta.
      </p>

      <p className={styles.infoText}>
        Apenas termines ese paso ya podras iniciar sesion y entrar a tu perfil sin problema.
      </p>

      <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
        {isLoading ? (
          <>
            <span className={styles.loadingDots} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            REGISTRANDO...
          </>
        ) : (
          'REGISTRARSE'
        )}
      </button>
    </form>
  </section>
);
