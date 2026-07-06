import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../Login/services/AuthServices';
import { setAdminEmail } from '../constants/adminProfile';
import { useCustomerSessionStore } from '@/shared/contexts/customerSessionStore';
import { ADMIN_SESSION_KEY, ADMIN_TOKEN_KEY } from '../components/AdminGuard';

// Las keys de admin son INDEPENDIENTES del token de cliente ('token').
// Esto evita que un login de cliente normal permita acceder al panel admin.

/** Devuelve true si hay sesión admin activa con su propio token */
const hasLocalSession = () =>
  localStorage.getItem(ADMIN_SESSION_KEY) === 'active' &&
  Boolean(localStorage.getItem(ADMIN_TOKEN_KEY));

/** Limpia completamente la sesión admin sin tocar el token de cliente */
const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem('nc-admin-email');
};

// ─── Hook ───────────────────────────────────────────────────────────────────

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const logoutCustomerSession = useCustomerSessionStore((s) => s.logout);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking]           = useState(true);
  const [isLoggingIn, setIsLoggingIn]         = useState(false);
  const [authError, setAuthError]             = useState('');

  // ── Verificación inicial ─────────────────────────────────────────────────
  useEffect(() => {
    if (hasLocalSession()) {
      setIsAuthenticated(true);
    } else {
      // Solo limpiar residuos — NO redirigir.
      // AdminGuard se encarga de proteger /admin/*.
      // El modal no debe interferir con la navegación normal de la tienda.
      clearAdminSession();
    }
    setIsChecking(false);
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string) => {
      setAuthError('');
      setIsLoggingIn(true);

      try {
        const { usuario, token } = await authService.login(email, password);

        if (String(usuario.rol ?? '').toUpperCase() !== 'ADMIN') {
          throw new Error('Solo las cuentas con rol ADMIN pueden acceder al panel.');
        }

        // Asegurar que no queda sesión de cliente activa
        logoutCustomerSession();

        localStorage.setItem(ADMIN_SESSION_KEY, 'active');
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
        setAdminEmail(usuario.email);

        setIsAuthenticated(true);
        setIsLoggingIn(false);
        navigate('/admin', { replace: true });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Credenciales incorrectas. Verifica tu correo y contraseña.';
        setAuthError(message);
        setIsLoggingIn(false);
      }
    },
    [navigate, logoutCustomerSession]
  );

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    logoutCustomerSession();
    clearAdminSession();
    setIsAuthenticated(false);
    setAuthError('');
    // AdminGuard detectará que no hay sesión y redirigirá a / en el próximo render
    navigate('/', { replace: true });
  }, [navigate, logoutCustomerSession]);

  return {
    isAuthenticated,
    isChecking,
    isLoggingIn,
    authError,
    login,
    logout,
  };
};
