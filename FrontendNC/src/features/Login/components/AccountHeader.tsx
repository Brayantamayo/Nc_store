///pagina al iniciar sesion
import { Bow } from '../../home/components/Moñito';
import styles from '../css/Login.module.css';

interface AccountHeaderProps {
  showBackgroundWord?: boolean;
}

export const AccountHeader = ({ showBackgroundWord = true }: AccountHeaderProps) => (
  <header className={styles.header}>
    {showBackgroundWord && (
      <div className={styles.headerTopDecoration}>
        <Bow size={20} color="var(--color-primary, #c2185b)" className={styles.headerBow} />
      </div>
    )}
    <div className={styles.titleContainer}>
      {showBackgroundWord && <span className={styles.titleBackgroundText}>bienvenue</span>}
      <h1 className={styles.pageTitle}>MI CUENTA</h1>
    </div>
    <div className={styles.dividerWrapper}>
      <span className={styles.dividerLine} />
      <svg className={styles.sparkleIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2c0 5.523 4.477 10 10 10-5.523 0-10 4.477-10 10 0-5.523-4.477-10-10-10 5.523 0 10-4.477 10-10z"
          fill="var(--color-primary, #c2185b)"
        />
      </svg>
      <span className={styles.dividerLine} />
    </div>
  </header>
);
