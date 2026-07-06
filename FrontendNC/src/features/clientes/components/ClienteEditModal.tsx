import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { LoaderCircle, Mail, MapPin, PencilLine, User, X } from 'lucide-react';
import { clienteService } from '../services/clienteService';
import type { ClienteFormPayload, ClienteFormValues, ClienteListado } from '../types';
import styles from '../../panel/css/Admin.module.css';

interface ClienteEditModalProps {
  mode: 'create' | 'edit';
  cliente?: ClienteListado | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

const buildInitialValues = (cliente?: ClienteListado | null): ClienteFormValues => {
  const nombreVisible =
    cliente?.usuario.nombreVisible?.trim() ||
    [cliente?.usuario.nombre, cliente?.usuario.apellido].filter(Boolean).join(' ').trim() ||
    '';

  return {
    email: cliente?.usuario.email ?? '',
    password: '',
    firstName: cliente?.usuario.nombre ?? '',
    lastName: cliente?.usuario.apellido ?? '',
    displayName: nombreVisible,
    addressLine1: cliente?.direccion ?? '',
    addressLine2: cliente?.direccion2 ?? '',
    region: cliente?.region ?? '',
    city: cliente?.ciudad ?? '',
    postalCode: cliente?.codigoPostal ?? '',
  };
};

export const ClienteEditModal = ({ mode, cliente, onClose, onSaved }: ClienteEditModalProps) => {
  const [form, setForm] = useState<ClienteFormValues>(() => buildInitialValues(cliente));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(buildInitialValues(cliente));
    setError('');
  }, [cliente, mode]);

  const title = mode === 'create' ? 'Nuevo cliente' : 'Editar cliente';
  const submitLabel = mode === 'create' ? 'Crear cliente' : 'Guardar cambios';

  const subtitle = useMemo(
    () =>
      mode === 'create'
        ? 'Registra un nuevo usuario cliente para que aparezca en este listado.'
        : 'Ajusta los datos de acceso y la informacion de contacto.',
    [mode],
  );

  const updateField = (field: keyof ClienteFormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (mode === 'create' && !form.password.trim()) {
      setError('La contrasena es obligatoria para crear el cliente.');
      return;
    }

    const payload: ClienteFormPayload = {
      email: form.email.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      displayName: form.displayName.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
      region: form.region.trim(),
      city: form.city.trim(),
      postalCode: form.postalCode.trim(),
    };

    const password = form.password.trim();
    if (password) {
      payload.password = password;
    }

    try {
      setIsSubmitting(true);

      if (mode === 'create') {
        await clienteService.crear({
          ...payload,
          password: payload.password ?? '',
        });
      } else if (cliente) {
        await clienteService.actualizar(cliente.id, payload);
      }

      await onSaved();
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar el cliente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        className={styles.modalContent}
      >
        <div className={styles.modalHeader}>
          <div>
            <h2>{title}</h2>
            <p className={styles.ordersSubtitle}>{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className={styles.closeModalBtn} aria-label="Cerrar modal">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGrid}>
            <label className={styles.formGroup}>
              <span className={styles.formLabel}>
                <Mail size={14} /> Correo
              </span>
              <input
                className={styles.textInput}
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="cliente@correo.com"
                required
              />
            </label>

            <label className={styles.formGroup}>
              <span className={styles.formLabel}>
                <PencilLine size={14} /> Contrasena {mode === 'edit' ? '(opcional)' : ''}
              </span>
              <input
                className={styles.textInput}
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder={mode === 'create' ? 'Minimo 8 caracteres' : 'Deja en blanco para no cambiarla'}
                minLength={mode === 'create' ? 8 : undefined}
                required={mode === 'create'}
              />
            </label>

            <label className={styles.formGroup}>
              <span className={styles.formLabel}>
                <User size={14} /> Nombre
              </span>
              <input
                className={styles.textInput}
                value={form.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="Nombre"
                required
              />
            </label>

            <label className={styles.formGroup}>
              <span className={styles.formLabel}>
                <User size={14} /> Apellido
              </span>
              <input
                className={styles.textInput}
                value={form.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Apellido"
              />
            </label>

            <label className={`${styles.formGroup} ${styles.fullWidth}`}>
              <span className={styles.formLabel}>
                <User size={14} /> Nombre visible
              </span>
              <input
                className={styles.textInput}
                value={form.displayName}
                onChange={(e) => updateField('displayName', e.target.value)}
                placeholder="Como se vera el cliente en el panel"
                required
              />
            </label>

            <label className={`${styles.formGroup} ${styles.fullWidth}`}>
              <span className={styles.formLabel}>
                <MapPin size={14} /> Direccion principal
              </span>
              <input
                className={styles.textInput}
                value={form.addressLine1}
                onChange={(e) => updateField('addressLine1', e.target.value)}
                placeholder="Calle, carrera, numero"
              />
            </label>

            <label className={`${styles.formGroup} ${styles.fullWidth}`}>
              <span className={styles.formLabel}>
                <MapPin size={14} /> Direccion extra
              </span>
              <input
                className={styles.textInput}
                value={form.addressLine2}
                onChange={(e) => updateField('addressLine2', e.target.value)}
                placeholder="Apartamento, barrio o referencia"
              />
            </label>

            <label className={styles.formGroup}>
              <span className={styles.formLabel}>
                <MapPin size={14} /> Region
              </span>
              <input
                className={styles.textInput}
                value={form.region}
                onChange={(e) => updateField('region', e.target.value)}
                placeholder="Departamento o region"
              />
            </label>

            <label className={styles.formGroup}>
              <span className={styles.formLabel}>
                <MapPin size={14} /> Ciudad
              </span>
              <input
                className={styles.textInput}
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Ciudad"
              />
            </label>

            <label className={styles.formGroup}>
              <span className={styles.formLabel}>Codigo postal</span>
              <input
                className={styles.textInput}
                value={form.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value)}
                placeholder="Codigo postal"
              />
            </label>
          </div>

          {error ? <p className={styles.formAlert}>{error}</p> : null}

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
              {submitLabel}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
