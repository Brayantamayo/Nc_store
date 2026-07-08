import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../store/pages/orderStore';
import { AccountAddressesSection } from '../components/AccountAddressesSection';
import { AccountDashboardSection } from '../components/AccountDashboardSection';
import { AccountDetailsSection } from '../components/AccountDetailsSection';
import { AccountDownloadsSection } from '../components/AccountDownloadsSection';
import { AccountHeader } from '../components/AccountHeader';
import { AccountOrdersSection } from '../components/AccountOrdersSection';
import { AccountSidebar, type AccountSection } from '../components/AccountSidebar';
import { AuthAccessSection } from '../components/AuthAccessSection';
import { AuthRegisterSection } from '../components/AuthRegisterSection';
import { authService } from '../services/AuthServices';
import styles from '../css/Login.module.css';
import { ACCOUNT_REGIONS } from '@/shared/constants/regions';
import { useCustomerSessionStore } from '@/shared/contexts/customerSessionStore';
import type { AuthUser, CustomerAddress, CustomerSession } from '@/shared/types/auth.types';
import { DEFAULT_ADMIN_EMAIL, setAdminEmail } from '../../panel/constants/adminProfile';

const EMAIL_REGEX = /\S+@\S+\.\S+/;

const buildCustomerSession = (usuario: AuthUser): CustomerSession => ({
  id:          usuario.id,
  email:       usuario.email,
  firstName:   usuario.nombre ?? '',
  lastName:    usuario.apellido ?? '',
  displayName: usuario.nombreVisible ?? '',
  rol:         usuario.rol,
  createdAt:   new Date().toISOString(),
  address:     usuario.cliente ?? {
    firstName:    '',
    lastName:     '',
    country:      'Colombia',
    addressLine1: '',
    addressLine2: '',
    region:       '',
    city:         '',
    postalCode:   '',
  },
});

const buildAddressForm = (customer: CustomerSession | null): CustomerAddress => ({
  firstName:    customer?.address.firstName    ?? customer?.firstName ?? '',
  lastName:     customer?.address.lastName     ?? customer?.lastName  ?? '',
  country:      customer?.address.country      ?? 'Colombia',
  addressLine1: customer?.address.addressLine1 ?? '',
  addressLine2: customer?.address.addressLine2 ?? '',
  region:       customer?.address.region       ?? '',
  city:         customer?.address.city         ?? '',
  postalCode:   customer?.address.postalCode   ?? '',
});

export const Login = () => {
  const navigate = useNavigate();
  const customer          = useCustomerSessionStore((s) => s.customer);
  const login             = useCustomerSessionStore((s) => s.login);
  const registerWithEmail = useCustomerSessionStore((s) => s.registerWithEmail);
  const updateProfile     = useCustomerSessionStore((s) => s.updateProfile);
  const updateAddress     = useCustomerSessionStore((s) => s.updateAddress);
  const logout            = useCustomerSessionStore((s) => s.logout);
  const orders            = useOrderStore((s) => s.orders);

  const [activeSection,   setActiveSection]   = useState<AccountSection>('dashboard');
  const [showPassword,    setShowPassword]    = useState(false);
  const [loginEmail,      setLoginEmail]      = useState('');
  const [loginPassword,   setLoginPassword]   = useState('');
  const [registerEmail,   setRegisterEmail]   = useState('');
  const [feedback,        setFeedback]        = useState('');
  const [errors,          setErrors]          = useState<Record<string, string>>({});
  const [isLoggingIn,     setIsLoggingIn]     = useState(false);
  const [isRegistering,   setIsRegistering]   = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  const [addressForm, setAddressForm] = useState<CustomerAddress>(buildAddressForm(customer));
  const [accountForm, setAccountForm] = useState({
    firstName:          customer?.firstName          ?? '',
    lastName:           customer?.lastName           ?? '',
    displayName:        customer?.displayName        ?? '',
    email:              customer?.email              ?? '',
    tipoIdentificacion: customer?.tipoIdentificacion ?? '',
    nroIdentificacion:  customer?.nroIdentificacion  ?? '',
    telefono:           customer?.telefono           ?? '',
  });

  useEffect(() => {
    setAddressForm(buildAddressForm(customer));
    setAccountForm({
      firstName:          customer?.firstName          ?? '',
      lastName:           customer?.lastName           ?? '',
      displayName:        customer?.displayName        ?? '',
      email:              customer?.email              ?? '',
      tipoIdentificacion: customer?.tipoIdentificacion ?? '',
      nroIdentificacion:  customer?.nroIdentificacion  ?? '',
      telefono:           customer?.telefono           ?? '',
    });
  }, [customer]);

  useEffect(() => {
    const cities = ACCOUNT_REGIONS[addressForm.region] ?? [];
    if (addressForm.region && cities.length > 0 && !cities.includes(addressForm.city)) {
      setAddressForm((prev) => ({ ...prev, city: cities[0] }));
    }
  }, [addressForm.region, addressForm.city]);

  useEffect(() => {
    if (!feedback) return undefined;
    const id = window.setTimeout(() => setFeedback(''), 4200);
    return () => window.clearTimeout(id);
  }, [feedback]);

  const customerOrders = useMemo(
    () => orders.filter((o) => o.customerEmail.toLowerCase() === customer?.email.toLowerCase()),
    [customer, orders]
  );

  const clearError = (field: string) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));

  const validateEmail = (value: string, field: string) => {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [field]: 'Este campo es obligatorio.' }));
      return false;
    }
    if (!EMAIL_REGEX.test(value.trim())) {
      setErrors((prev) => ({ ...prev, [field]: 'Ingresa un correo valido.' }));
      return false;
    }
    clearError(field);
    return true;
  };

  // LOGIN
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const { usuario, token } = await authService.login(loginEmail, loginPassword);
      const rol = String(usuario.rol ?? '').toUpperCase();

      if (rol === 'ADMIN') {
        logout();
        setAdminEmail(usuario.email || DEFAULT_ADMIN_EMAIL);
        localStorage.setItem('nc-admin-session', 'active');
        localStorage.setItem('nc-admin-token', token);
        setErrors({});
        setFeedback('Ingreso exitoso. Ya puedes acceder al panel de administracion.');
        setLoginPassword('');
        setLoginEmail('');
        navigate('/admin');
        return;
      }

      const session = buildCustomerSession(usuario);
      localStorage.removeItem('nc-admin-session');
      useCustomerSessionStore.setState({ customer: session, token });

      setErrors({});
      setFeedback('Ingreso exitoso. Ya puedes navegar por las secciones de tu cuenta.');
      setActiveSection('dashboard');
      setLoginPassword('');
      navigate('/mi-cuenta');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'No pudimos iniciar sesion. Revisa tus datos e intenta de nuevo.';
      setErrors((prev) => ({ ...prev, auth: message }));
    } finally {
      setIsLoggingIn(false);
    }
  };

  // REGISTRO
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateEmail(registerEmail, 'registerEmail')) return;

    setIsRegistering(true);
    try {
      const result = await registerWithEmail(registerEmail);
      if (!result.success) {
        setErrors((prev) => ({ ...prev, registerEmail: result.message }));
        return;
      }

      if (result.passwordTemporal) {
        const loginResult = await login(registerEmail, result.passwordTemporal);
        if (loginResult.success) {
          setErrors({});
          setRegisterEmail('');
          setFeedback('Cuenta creada. Ya entraste al area del cliente.');
          navigate('/mi-cuenta');
          return;
        }
      }

      setErrors({});
      setRegisterEmail('');
      setFeedback('Cuenta creada. Revisa tu correo para crear tu contrasena inicial.');
    } finally {
      setIsRegistering(false);
    }
  };

  // DIRECCION
  const handleSaveAddress = async (e: FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);

    try {
      const addressResult = await updateAddress(addressForm);

      if (!addressResult.success) {
        setErrors((prev) => ({ ...prev, address: addressResult.message }));
        return;
      }

      setErrors((prev) => ({ ...prev, address: '' }));
      setFeedback('Tu direccion de envio quedo guardada.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // DATOS DE CUENTA
  const handleSaveAccount = async (e: FormEvent) => {
    e.preventDefault();
    setIsSavingAccount(true);

    try {
      const result = await updateProfile({
        firstName:          accountForm.firstName.trim(),
        lastName:           accountForm.lastName.trim(),
        displayName:        accountForm.displayName.trim(),
        email:              accountForm.email.trim(),
        tipoIdentificacion: accountForm.tipoIdentificacion.trim(),
        nroIdentificacion:  accountForm.nroIdentificacion.trim(),
        telefono:           accountForm.telefono.trim(),
      });

      if (!result.success) {
        setErrors((prev) => ({ ...prev, accountEmail: result.message }));
        return;
      }

      setFeedback('Los detalles de tu cuenta fueron actualizados.');
      setErrors((prev) => ({ ...prev, accountFirstName: '', accountDisplayName: '', accountEmail: '' }));
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleLogout = () => {
    logout();
    setLoginEmail('');
    setLoginPassword('');
    setRegisterEmail('');
    setShowPassword(false);
    setActiveSection('dashboard');
    setFeedback('');
    setErrors({});
    navigate('/mi-cuenta', { replace: true });
  };

  const handleAddressFieldChange = (field: string | number | symbol, value: string) => {
    clearError('address');
    setAddressForm((prev) => ({ ...prev, [field as keyof CustomerAddress]: value }));
  };

  const handleAccountFieldChange = (field: keyof typeof accountForm, value: string) => {
    setAccountForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'firstName')   clearError('accountFirstName');
    if (field === 'displayName') clearError('accountDisplayName');
    if (field === 'email')       clearError('accountEmail');
  };

  // SECCION ACTIVA
  const renderAccountSection = () => {
    if (!customer) return null;
    switch (activeSection) {
      case 'orders':    return <AccountOrdersSection customerOrders={customerOrders} />;
      case 'downloads': return <AccountDownloadsSection />;
      case 'addresses': return (
        <AccountAddressesSection
          addressForm={addressForm}
          errors={errors}
          isLoading={isSavingAddress}
          regions={ACCOUNT_REGIONS}
          onChange={handleAddressFieldChange}
          onSubmit={handleSaveAddress}
        />
      );
      case 'account': return (
        <AccountDetailsSection
          accountForm={accountForm}
          errors={errors}
          isLoading={isSavingAccount}
          onChange={handleAccountFieldChange}
          onSubmit={handleSaveAccount}
        />
      );
      default: return <AccountDashboardSection customer={customer} />;
    }
  };

  // TOAST
  const feedbackToast = (
    <AnimatePresence>
      {feedback && (
        <motion.div
          className={styles.feedbackToast}
          initial={{ opacity: 0, y: -18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <div className={styles.feedbackToastIcon}><CheckCircle2 size={20} /></div>
          <div className={styles.feedbackToastBody}>
            <span className={styles.feedbackToastEyebrow}>Exito</span>
            <p>{feedback}</p>
          </div>
          <button
            type="button"
            className={styles.feedbackToastClose}
            onClick={() => setFeedback('')}
            aria-label="Cerrar notificacion"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // RENDER
  if (!customer) {
    return (
      <motion.div
        className={styles.page}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.glowingOrbLeft} />
        <div className={styles.glowingOrbRight} />
        <div className={styles.container}>
          <AccountHeader />
          {feedbackToast}
          <div className={styles.authGrid}>
            <AuthAccessSection
              loginEmail={loginEmail}
              loginPassword={loginPassword}
              showPassword={showPassword}
              errors={errors}
              isLoading={isLoggingIn}
              onLoginEmailChange={(v) => { setLoginEmail(v); clearError('loginEmail'); clearError('auth'); }}
              onLoginPasswordChange={(v) => { setLoginPassword(v); clearError('loginPassword'); clearError('auth'); }}
              onTogglePassword={() => setShowPassword((p) => !p)}
              onSubmit={handleLoginSubmit}
            />
            <AuthRegisterSection
              registerEmail={registerEmail}
              errors={errors}
              isLoading={isRegistering}
              onRegisterEmailChange={(v) => { setRegisterEmail(v); clearError('registerEmail'); }}
              onSubmit={handleRegisterSubmit}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.glowingOrbLeft} />
      <div className={styles.glowingOrbRight} />
      <div className={styles.container}>
        <AccountHeader showBackgroundWord={false} />
        {feedbackToast}
        <div className={styles.accountLayout}>
          <section className={styles.accountContent}>{renderAccountSection()}</section>
          <AccountSidebar activeSection={activeSection} onChangeSection={setActiveSection} onLogout={handleLogout} />
        </div>
      </div>
    </motion.div>
  );
};