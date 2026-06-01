//SECCION ESCRITORIO DE LA CUENTA INICIO 
import type { CustomerSession } from '@/shared/types/auth.types';
import styles from '../css/Login.module.css';

interface AccountDashboardSectionProps {
  customer: CustomerSession;
}

export const AccountDashboardSection = ({ customer }: AccountDashboardSectionProps) => {
  const customerName = customer.firstName.trim() || customer.displayName.trim() || 'cliente';

  return (
    <div className={styles.sectionStack}>
      <div className={styles.highlightBanner}>
        Ingreso exitoso. Ya puedes revisar tus pedidos, direcciones y detalles de la cuenta.
      </div>

      <div className={styles.sectionCopy}>
        <p className={styles.greetingLine}>
          Hola <strong>{customerName}</strong> ({customer.email})
        </p>
        <p>
          Desde el escritorio de tu cuenta puedes ver tus <strong>pedidos recientes</strong>, gestionar tus
          <strong> direcciones de envio</strong> y editar los detalles de tu cuenta.
        </p>
      </div>
    </div>
  );
};
