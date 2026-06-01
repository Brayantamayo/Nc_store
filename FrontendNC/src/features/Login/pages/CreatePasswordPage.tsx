///pantalla para crear la contraseña inicial cuando el usuario recién se registra osea la que llega al email.
import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AccountHeader } from '../components/AccountHeader';
import { PasswordForm } from '../components/PasswordForm';
import { authService } from '../services/AuthServices';
import type { PasswordFormErrors } from '../utils/password';
import styles from '../css/Login.module.css';
import { useCustomerSessionStore } from '@/shared/contexts/customerSessionStore';

export const CreatePasswordPage = () => {
  const navigate = useNavigate();
  const login = useCustomerSessionStore((state) => state.login);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<PasswordFormErrors>({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const subtitle = useMemo(
    () =>
      email
        ? `Estamos a un paso de activar tu cuenta con el correo ${email}.`
        : 'Usa el enlace del correo para definir la contraseña inicial de tu cuenta.',
    [email],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!token) {
      setErrors({ auth: 'El enlace no tiene un token válido.' });
      return;
    }

    setLoading(true);
    try {
      const response = await authService.crearPassword(token, password, confirm);
      setErrors({});
      setSuccess(response.message);
      if (email) {
        const session = await login(email, password);
        if (session.success) {
          navigate('/mi-cuenta');
        }
      }
    } catch (error) {
      setErrors({ auth: error instanceof Error ? error.message : 'No pudimos crear la contraseña.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageShell}>
      <div className={styles.glowingOrbLeft} />
      <div className={styles.glowingOrbRight} />
      <div className={styles.container}>
        <AccountHeader
          title="CREAR CONTRASEÑA"
          backgroundWord="welcome"
          subtitle={subtitle}
        />

        {success ? (
          <section className={styles.pageCard}>
            <div className={styles.successState}>
              <h2 className={styles.pageCardTitle}>¡Contraseña creada!</h2>
              <p className={styles.pageCardText}>{success}</p>
              <button type="button" className={styles.primaryBtn} onClick={() => navigate('/mi-cuenta')}>
                Ir a iniciar sesión
              </button>
            </div>
          </section>
        ) : (
          <PasswordForm
            title="Define tu contraseña inicial"
            description="Esta contraseña reemplaza la temporal y será la que uses para entrar a tu cuenta."
            buttonLabel="Crear contraseña"
            passwordHint="Debe tener al menos 8 caracteres, una mayúscula y un número."
            password={password}
            confirm={confirm}
            errors={errors}
            submitting={loading}
            onPasswordChange={setPassword}
            onConfirmChange={setConfirm}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};
