import { Navigate } from 'react-router-dom';

export const ADMIN_SESSION_KEY = 'nc-admin-session';
export const ADMIN_TOKEN_KEY   = 'nc-admin-token';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Protege todas las rutas bajo /admin/*.
 *
 * Usa keys EXCLUSIVAS para la sesión admin (nc-admin-session, nc-admin-token),
 * separadas del token de cliente ('token') para evitar que un login de cliente
 * permita el acceso al panel de administración.
 *
 * La verificación es SÍNCRONA y DECLARATIVA usando <Navigate>.
 * El panel NUNCA se renderiza si no hay sesión admin válida.
 */
export const AdminGuard = ({ children }: AdminGuardProps) => {
  const session    = localStorage.getItem(ADMIN_SESSION_KEY);
  const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);

  const hasAdminSession = session === 'active' && Boolean(adminToken);

  if (!hasAdminSession) {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem('nc-admin-email');
    // Sin ruta de login pública — redirigir a la landing
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
