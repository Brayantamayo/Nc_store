import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { AdminLogin } from '../components/AdminLogin';
import { AdminLoadingScreen } from '../components/AdminLoadingScreen';

/**
 * Página pública en /admin/login.
 * Si ya hay sesión activa redirige directamente al panel.
 */
export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { isChecking, isLoggingIn, isAuthenticated, authError, login } = useAdminAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  // Si ya está autenticado, saltar al panel
  useEffect(() => {
    if (!isChecking && isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isChecking, isAuthenticated, navigate]);

  if (isChecking) return <AdminLoadingScreen message="Cargando..." />;
  if (isLoggingIn) return <AdminLoadingScreen message="Iniciando sesión..." />;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void login(email, password);
  };

  return (
    <AdminLogin
      username={email}
      password={password}
      authError={authError}
      isSubmitting={isLoggingIn}
      onUsernameChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
    />
  );
};
