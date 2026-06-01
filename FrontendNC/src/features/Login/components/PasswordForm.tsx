//// cambiar contraseña
import { Eye, EyeOff } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { PasswordFormErrors } from '../utils/password';
import styles from '../css/Login.module.css';

interface PasswordFormProps {
  title: string;
  description: string;
  buttonLabel: string;
  passwordLabel?: string;
  confirmLabel?: string;
  passwordHint?: string;
  password: string;
  confirm: string;
  errors: PasswordFormErrors;
  submitting?: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}

export const PasswordForm = ({
  title,
  description,
  buttonLabel,
  passwordLabel = 'Nueva contraseña',
  confirmLabel = 'Confirmar contraseña',
  passwordHint,
  password,
  confirm,
  errors,
  submitting = false,
  onPasswordChange,
  onConfirmChange,
  onSubmit,
}: PasswordFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className={styles.pageCard}>
      <div className={styles.pageCardHeader}>
        <h2 className={styles.pageCardTitle}>{title}</h2>
        <p className={styles.pageCardText}>{description}</p>
      </div>

      <form className={styles.authForm} onSubmit={onSubmit} noValidate>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="password">
            {passwordLabel} <span className={styles.required}>*</span>
          </label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {passwordHint && <p className={styles.passwordRules}>{passwordHint}</p>}
          {errors.password && <span className={styles.errorText}>{errors.password}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="confirmPassword">
            {confirmLabel} <span className={styles.required}>*</span>
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className={`${styles.input} ${errors.confirmar ? styles.inputError : ''}`}
            value={confirm}
            onChange={(event) => onConfirmChange(event.target.value)}
          />
          {errors.confirmar && <span className={styles.errorText}>{errors.confirmar}</span>}
        </div>

        {errors.auth && <div className={styles.formAlert}>{errors.auth}</div>}

        <button type="submit" className={styles.primaryBtn} disabled={submitting}>
          {submitting ? 'Procesando...' : buttonLabel}
        </button>
      </form>
    </section>
  );
};
