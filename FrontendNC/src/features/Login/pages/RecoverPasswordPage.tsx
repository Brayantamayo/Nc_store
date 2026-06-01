///primera pantalla de recuperación.
//Pides el correo, mandas el OTP, validas el código y pasas al siguiente paso.
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AccountHeader } from '../components/AccountHeader';
import { authService } from '../services/AuthServices';
import styles from '../css/Login.module.css';

type RecoveryStep = 'email' | 'otp';

export const RecoverPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<RecoveryStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!feedback) return undefined;
    const timeout = window.setTimeout(() => setFeedback(''), 4500);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const currentStep = useMemo(
    () => (step === 'email' ? 1 : 2),
    [step]
  );

  const handleSendCode = async (event: FormEvent) => {
    event.preventDefault();

    setLoading(true);
    try {
      const response = await authService.solicitarOtp(email.trim().toLowerCase());
      setFeedback(response.message);
      setErrors({});
      setStep('otp');
    } catch (error) {
      setErrors({ auth: error instanceof Error ? error.message : 'No pudimos enviar el código.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event: FormEvent) => {
    event.preventDefault();

    setLoading(true);
    try {
      const response = await authService.verificarOtp(email.trim().toLowerCase(), otp.trim());
      if (!response.resetToken) {
        throw new Error('No pudimos generar el enlace para restablecer tu contraseña.');
      }
      setErrors({});
      navigate(
        `/restablecer-contrasena?token=${encodeURIComponent(response.resetToken)}&email=${encodeURIComponent(email.trim().toLowerCase())}`,
      );
    } catch (error) {
      setErrors({ auth: error instanceof Error ? error.message : 'No pudimos validar el código.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const response = await authService.solicitarOtp(email.trim().toLowerCase());
      setFeedback(response.message);
      setErrors({});
    } catch (error) {
      setErrors({ auth: error instanceof Error ? error.message : 'No pudimos reenviar el código.' });
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
          title="RECUPERAR CONTRASEÑA"
          backgroundWord="reset"
          subtitle="Primero verificamos tu correo con un código. Cuando lo valides, te llevaremos al formulario para crear una nueva contraseña."
        />

        <div className={styles.pageGrid}>
          <section className={styles.pageCard}>
            <div className={styles.stepPills}>
              <span className={`${styles.stepPill} ${currentStep === 1 ? styles.stepPillActive : ''}`}>1. Correo</span>
              <span className={`${styles.stepPill} ${currentStep === 2 ? styles.stepPillActive : ''}`}>2. Código</span>
            </div>

            {step === 'email' ? (
              <form className={styles.authForm} onSubmit={handleSendCode} noValidate>
                <div className={styles.fieldGroup}>
                  <label htmlFor="recoveryEmail" className={styles.label}>
                    Correo electrónico <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="recoveryEmail"
                    type="email"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrors((current) => ({ ...current, email: '', auth: '' }));
                    }}
                    placeholder="tu-correo@ejemplo.com"
                  />
                  {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>

                {errors.auth && <div className={styles.formAlert}>{errors.auth}</div>}
                {feedback && <div className={styles.successState}><strong>Correo enviado</strong><p className={styles.miniNote}>{feedback}</p></div>}

                <div className={styles.actionRow}>
                  <button type="submit" className={styles.primaryBtn} disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar código'}
                  </button>
                  <Link to="/mi-cuenta" className={styles.backLink}>
                    Volver al inicio de sesión
                  </Link>
                </div>
              </form>
            ) : (
              <form className={styles.authForm} onSubmit={handleVerifyCode} noValidate>
                <div className={styles.fieldGroup}>
                  <label htmlFor="recoveryOtp" className={styles.label}>
                    Código de verificación <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="recoveryOtp"
                    className={`${styles.input} ${styles.codeInput} ${errors.otp ? styles.inputError : ''}`}
                    value={otp}
                    onChange={(event) => {
                      const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(digitsOnly);
                      setErrors((current) => ({ ...current, otp: '', auth: '' }));
                    }}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                  />
                  <p className={styles.otpHelper}>
                    Enviamos el código a <strong>{email}</strong>. Revisa spam si no lo ves.
                  </p>
                  {errors.otp && <span className={styles.errorText}>{errors.otp}</span>}
                </div>

                {errors.auth && <div className={styles.formAlert}>{errors.auth}</div>}

                <div className={styles.actionRow}>
                  <button type="submit" className={styles.primaryBtn} disabled={loading}>
                    {loading ? 'Validando...' : 'Validar código'}
                  </button>
                  <button type="button" className={styles.ghostBtn} onClick={handleResend} disabled={loading}>
                    Reenviar código
                  </button>
                  <button type="button" className={styles.ghostBtn} onClick={() => setStep('email')} disabled={loading}>
                    Cambiar correo
                  </button>
                </div>
              </form>
            )}
          </section>

          <aside className={styles.helpCard}>
            <h3 className={styles.pageCardTitle}>¿Qué pasa aquí?</h3>
            <p className={styles.pageCardText}>
              Este flujo protege tu cuenta con dos pasos sencillos: primero recibes un código en tu correo y luego definimos una nueva contraseña.
            </p>
            <ul className={styles.helpList}>
              <li>El código llega al correo registrado.</li>
              <li>El código expira en 15 minutos.</li>
              <li>Después de validarlo te llevamos al cambio de contraseña.</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
};
