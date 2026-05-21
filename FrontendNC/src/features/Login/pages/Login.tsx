import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, MessageCircle } from 'lucide-react';
import { Bow } from '../../home/components/Moñito';
import styles from '../css/Login.module.css';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Iniciando sesión con: ${loginEmail}`);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Registrando correo: ${registerEmail}`);
  };

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background soft pink coquette glowing circles */}
      <div className={styles.glowingOrbLeft} />
      <div className={styles.glowingOrbRight} />

      <div className={styles.container}>
        {/* Header Section */}
        <header className={styles.header}>
          <div className={styles.headerTopDecoration}>
            <Bow size={20} color="var(--color-primary, #c2185b)" className={styles.headerBow} />
          </div>
          <div className={styles.titleContainer}>
            <span className={styles.titleBackgroundText}>bienvenue</span>
            <h1 className={styles.pageTitle}>MI CUENTA</h1>
          </div>
          <div className={styles.dividerWrapper}>
            <span className={styles.dividerLine} />
            <svg 
              className={styles.sparkleIcon} 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 2c0 5.523 4.477 10 10 10-5.523 0-10 4.477-10 10 0-5.523-4.477-10-10-10 5.523 0 10-4.477 10-10z" 
                fill="var(--color-primary, #c2185b)"
              />
            </svg>
            <span className={styles.dividerLine} />
          </div>
        </header>

        {/* Content Grid */}
        <div className={styles.grid}>
          {/* ACCEDER COLUMN */}
          <section className={styles.column}>
            <h2 className={styles.colTitle}>Acceder</h2>
            <form onSubmit={handleLoginSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="loginEmail" className={styles.label}>
                  Nombre de usuario o correo electrónico <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="loginEmail"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="loginPassword" className={styles.label}>
                  Contraseña <span className={styles.required}>*</span>
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="loginPassword"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={styles.inputPassword}
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className={styles.rememberRow}>
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxLabel}>Recuérdame</span>
                </label>
              </div>

              <button type="submit" className={styles.submitBtn}>
                ACCESO
              </button>
            </form>

            <a href="#forgot" className={styles.forgotLink}>
              ¿Olvidaste la contraseña?
            </a>
          </section>

          {/* REGISTRARSE COLUMN */}
          <section className={styles.column}>
            <h2 className={styles.colTitle}>Registrarse</h2>
            <form onSubmit={handleRegisterSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="registerEmail" className={styles.label}>
                  Dirección de correo electrónico <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  id="registerEmail"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <p className={styles.infoText}>
                Se enviará un enlace a tu dirección de correo electrónico para establecer una nueva contraseña.
              </p>

              <p className={styles.privacyText}>
                Sus datos personales se utilizarán para respaldar su experiencia en este sitio web, para administrar el acceso a su cuenta y para otros fines descritos en nuestra <a href="#privacy" className={styles.privacyLink}>política de privacidad</a>.
              </p>

              <button type="submit" className={styles.submitBtn}>
                REGISTRARSE
              </button>
            </form>
          </section>
        </div>
      </div>

      {/* Floating WhatsApp Support Button */}
      <a 
        href="https://wa.me/573000000000" 
        target="_blank" 
        rel="noopener noreferrer" 
        className={styles.whatsappFloat}
      >
        <div className={styles.whatsappIconWrapper}>
          <MessageCircle size={22} fill="currentColor" />
        </div>
        <div className={styles.whatsappText}>
          <span className={styles.whatsappTitle}>Línea de</span>
          <span className={styles.whatsappSubtitle}>atención</span>
        </div>
      </a>
    </motion.div>
  );
};
