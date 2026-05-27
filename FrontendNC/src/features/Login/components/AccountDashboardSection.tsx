//SECCION ESCRITORIO DE LA CUENTA INICIO 
import type { CustomerSession } from '../services/customerSessionService';
import styles from '../css/Login.module.css';

interface AccountDashboardSectionProps {
  customer: CustomerSession;
}

export const AccountDashboardSection = ({ customer }: AccountDashboardSectionProps) => (
  <div className={styles.sectionStack}>
    <div className={styles.highlightBanner}>
      Tu cuenta de NC Store esta utilizando una contrasena temporal. Te enviamos por correo electronico la clave inicial para que puedas ingresar.
    </div>

    <div className={styles.sectionCopy}>
      <p className={styles.greetingLine}>
        Hola <strong>{customer.displayName}</strong> ({customer.email})
      </p>
      <p>
        Desde el escritorio de tu cuenta puedes ver tus <strong>pedidos recientes</strong>, gestionar tus
        <strong> direcciones de envio</strong> y editar tu contrasena y los detalles de tu cuenta.
      </p>
    </div>
  </div>
);
