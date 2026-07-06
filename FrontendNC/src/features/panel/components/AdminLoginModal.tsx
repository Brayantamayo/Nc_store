import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { Bow } from '../../home/components/Moñito';
import styles from '../css/Admin.module.css';

/**
 * Modal de login del panel admin.
 * No tiene URL propia — se activa con Ctrl+Shift+A desde cualquier página.
 * Invisible para usuarios normales.
 */
export const AdminLoginModal = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isChecking, isLoggingIn, authError, login } = useAdminAuth();

  const [open,     setOpen]     = useState(false);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  // Atajo de teclado: Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Si ya está autenticado al abrir, ir directo al panel
  useEffect(() => {
    if (open && !isChecking && isAuthenticated) {
      setOpen(false);
      navigate('/admin', { replace: true });
    }
  }, [open, isChecking, isAuthenticated, navigate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void login(email, password);
  };

  const handleClose = () => {
    setOpen(false);
    setEmail('');
    setPassword('');
  };

  if (!open) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Acceso al panel de administración"
    >
      <div className={styles.modalCard}>
        <button
          className={styles.modalClose}
          onClick={handleClose}
          aria-label="Cerrar"
          type="button"
        >
          <X size={18} />
        </button>

        <Bow size={28} className={styles.authBow} />
        <h2>NC Panel Control</h2>
        <p>Inicia sesión con tu cuenta de administrador.</p>

        {authError && (
          <div className={`${styles.messageBanner} ${styles.errorBanner}`}>
            <AlertCircle size={16} />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="admin-email" className={styles.formLabel}>
              Correo administrador
            </label>
            <input
              type="email"
              id="admin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.textInput}
              placeholder="correo@ncstore.com"
              disabled={isLoggingIn}
              autoComplete="email"
              autoFocus
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="admin-password" className={styles.formLabel}>
              Contraseña
            </label>
            <input
              type="password"
              id="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.textInput}
              placeholder="••••••••"
              disabled={isLoggingIn}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className={styles.authBtn} disabled={isLoggingIn}>
            {isLoggingIn ? 'VERIFICANDO...' : 'INGRESAR AL PANEL'}
          </button>
        </form>
      </div>
    </div>
  );
};
