////INICIO DE SESION
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../css/Login.module.css';

interface AuthAccessSectionProps {
  loginEmail: string;
  loginPassword: string;
  showPassword: boolean;
  errors: Record<string, string>;
  isLoading?: boolean;
  onLoginEmailChange: (value: string) => void;
  onLoginPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AuthAccessSection = ({
  loginEmail,
  loginPassword,
  showPassword,
  errors,
  isLoading = false,
  onLoginEmailChange,
  onLoginPasswordChange,
  onTogglePassword,
  onSubmit,
}: AuthAccessSectionProps) => (
  <section className={styles.authColumn}>
    <h2 className={styles.authTitle}>Acceder</h2>
    <form onSubmit={onSubmit} className={styles.authForm} noValidate>
      <div className={styles.fieldGroup}>
        <label htmlFor="loginEmail" className={styles.label}>
          Nombre de usuario o correo electronico <span className={styles.required}>*</span>
        </label>
        <input
          id="loginEmail"
          type="email"
          autoComplete="email"
          value={loginEmail}
          onChange={(e) => onLoginEmailChange(e.target.value)}
          className={`${styles.input} ${errors.loginEmail ? styles.inputError : ''}`}
        />
        {errors.loginEmail && <span className={styles.errorText}>{errors.loginEmail}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="loginPassword" className={styles.label}>
          Contrasena <span className={styles.required}>*</span>
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="loginPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={loginPassword}
            onChange={(e) => onLoginPasswordChange(e.target.value)}
            className={`${styles.input} ${errors.loginPassword ? styles.inputError : ''}`}
          />
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={onTogglePassword}
            aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.loginPassword && <span className={styles.errorText}>{errors.loginPassword}</span>}
      </div>

      {errors.auth && <div className={styles.formAlert}>{errors.auth}</div>}

      <div className={styles.inlineRow}>
        <Link to="/recuperar-contrasena" className={styles.secondaryLink}>
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
        {isLoading ? (
          <>
            <span className={styles.loadingDots} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            INGRESANDO...
          </>
        ) : (
          'ACCESO'
        )}
      </button>
    </form>
  </section>
);
