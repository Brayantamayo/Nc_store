//pantalla para escribir la nueva contraseña después de validar el OTP.

import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AccountHeader } from '../components/AccountHeader';
import { PasswordForm } from '../components/PasswordForm';
import { authService } from '../services/AuthServices';
import type { PasswordFormErrors } from '../utils/password';
import styles from '../css/Login.module.css';
import { useCustomerSessionStore } from '@/shared/contexts/customerSessionStore';

export const ResetPasswordPage = () => {
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
        ? `Ya validamos tu correo ${email}. Ahora escribe una contraseña nueva para continuar.`
        : 'Ya validamos tu código. Ahora escribe una contraseña nueva para continuar.',
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
      const response = await authService.nuevaPassword(token, password, confirm);
      setErrors({});
      setSuccess(response.message);
      if (email) {
        const session = await login(email, password);
        if (session.success) {
          navigate('/mi-cuenta');
        }
      }
    } catch (error) {
      setErrors({ auth: error instanceof Error ? error.message : 'No pudimos actualizar la contraseña.' });
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
          title="RESTABLECER CONTRASEÑA"
          backgroundWord="secure"
          subtitle={subtitle}
        />

        {success ? (
          <section className={styles.pageCard}>
            <div className={styles.successState}>
              <h2 className={styles.pageCardTitle}>Contraseña actualizada</h2>
              <p className={styles.pageCardText}>{success}</p>
              <button type="button" className={styles.primaryBtn} onClick={() => navigate('/mi-cuenta')}>
                Ir a iniciar sesión
              </button>
            </div>
          </section>
        ) : !token ? (
          <section className={styles.pageCard}>
            <div className={styles.successState}>
              <h2 className={styles.pageCardTitle}>Falta el enlace de recuperación</h2>
              <p className={styles.pageCardText}>
                Abre el correo donde recibiste el enlace y vuelve a intentar. Si lo prefieres, puedes empezar de nuevo desde el formulario de recuperación.
              </p>
              <button type="button" className={styles.primaryBtn} onClick={() => navigate('/recuperar-contrasena')}>
                Volver a recuperar
              </button>
            </div>
          </section>
        ) : (
          <PasswordForm
            title="Escribe tu nueva contraseña"
            description="Ya comprobamos tu identidad. Solo falta guardar la nueva clave para tu cuenta."
            buttonLabel="Guardar contraseña"
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
