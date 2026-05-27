import { AlertCircle } from 'lucide-react';
import { Bow } from '../../home/components/Moñito';
import styles from '../css/Admin.module.css';

interface AdminLoginProps {
  username: string;
  password: string;
  authError: string;
  isSubmitting?: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AdminLogin = ({
  username,
  password,
  authError,
  isSubmitting = false,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: AdminLoginProps) => (
  <div className={styles.page}>
    <div className={styles.glowingOrb1} />
    <div className={styles.glowingOrb2} />
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <Bow size={32} className={styles.authBow} />
        <h2>NC Panel Control</h2>
        <p>Inicia sesion con credenciales administrativas para gestionar inventario y pedidos.</p>

        {authError && (
          <div className={`${styles.messageBanner} ${styles.errorBanner}`}>
            <AlertCircle size={18} />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className={styles.authForm} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.formLabel}>
              Correo administrador
            </label>
            <input
              type="email"
              id="username"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              className={styles.textInput}
              placeholder="Correo administrador"
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Contrasena
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className={styles.textInput}
              placeholder="Contrasena (ej: admin)"
              disabled={isSubmitting}
            />
          </div>
          <button type="submit" className={styles.authBtn} disabled={isSubmitting}>
            {isSubmitting ? 'VERIFICANDO...' : 'INGRESAR AL PANEL'}
          </button>
        </form>
      </div>
    </div>
  </div>
);
