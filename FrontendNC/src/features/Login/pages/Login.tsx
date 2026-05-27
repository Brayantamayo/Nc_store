import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
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
import styles from '../css/Login.module.css';
import {
  ACCOUNT_REGIONS,
  useCustomerSessionStore,
  type CustomerAddress,
  type CustomerSession,
} from '../services/customerSessionService';

const EMAIL_REGEX = /\S+@\S+\.\S+/;

const buildAddressForm = (customer: CustomerSession | null): CustomerAddress => ({
  firstName: customer?.address.firstName ?? customer?.firstName ?? '',
  lastName: customer?.address.lastName ?? customer?.lastName ?? '',
  country: customer?.address.country ?? 'Colombia',
  addressLine1: customer?.address.addressLine1 ?? '',
  addressLine2: customer?.address.addressLine2 ?? '',
  region: customer?.address.region ?? '',
  city: customer?.address.city ?? '',
  postalCode: customer?.address.postalCode ?? '',
});

export const Login = () => {
  const customer = useCustomerSessionStore((state) => state.customer);
  const login = useCustomerSessionStore((state) => state.login);
  const registerWithEmail = useCustomerSessionStore((state) => state.registerWithEmail);
  const updateProfile = useCustomerSessionStore((state) => state.updateProfile);
  const updateAddress = useCustomerSessionStore((state) => state.updateAddress);
  const logout = useCustomerSessionStore((state) => state.logout);
  const orders = useOrderStore((state) => state.orders);

  const [activeSection, setActiveSection] = useState<AccountSection>('dashboard');
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [addressForm, setAddressForm] = useState<CustomerAddress>(buildAddressForm(customer));
  const [accountForm, setAccountForm] = useState({
    firstName: customer?.firstName ?? '',
    lastName: customer?.lastName ?? '',
    displayName: customer?.displayName ?? '',
    email: customer?.email ?? '',
    password: customer?.password ?? '',
  });

  useEffect(() => {
    setAddressForm(buildAddressForm(customer));
    setAccountForm({
      firstName: customer?.firstName ?? '',
      lastName: customer?.lastName ?? '',
      displayName: customer?.displayName ?? '',
      email: customer?.email ?? '',
      password: customer?.password ?? '',
    });
  }, [customer]);

  useEffect(() => {
    const cities = ACCOUNT_REGIONS[addressForm.region] ?? [];
    if (addressForm.region && cities.length > 0 && !cities.includes(addressForm.city)) {
      setAddressForm((prev) => ({ ...prev, city: cities[0] }));
    }
  }, [addressForm.region, addressForm.city]);

  const customerOrders = useMemo(() => {
    if (!customer) return [];
    return orders.filter((order) => order.customerEmail.toLowerCase() === customer.email.toLowerCase());
  }, [customer, orders]);

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      return { ...prev, [field]: '' };
    });
  };

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

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmail(loginEmail, 'loginEmail');
    if (!loginPassword.trim()) {
      setErrors((prev) => ({ ...prev, loginPassword: 'La contrasena es obligatoria.' }));
      return;
    }

    if (!isEmailValid) return;

    const result = login(loginEmail, loginPassword);
    if (!result.success) {
      setErrors((prev) => ({ ...prev, auth: result.message }));
      return;
    }

    setErrors({});
    setFeedback('Sesion iniciada correctamente. Ya puedes navegar por las secciones de tu cuenta.');
    setActiveSection('dashboard');
    setLoginPassword('');
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmail(registerEmail, 'registerEmail');
    if (!isEmailValid) return;

    const result = registerWithEmail(registerEmail);
    if (!result.success) {
      setErrors((prev) => ({ ...prev, registerEmail: result.message }));
      return;
    }

    setErrors({});
    setRegisterEmail('');
    setFeedback(
      result.generatedPassword
        ? 'Tu cuenta se creo con una contrasena temporal y ya quedaste dentro de tu perfil.'
        : 'Tu cuenta ya existia y te llevamos directo a tu perfil.'
    );
    setActiveSection('account');
  };

  const handleSaveAddress = (e: FormEvent) => {
    e.preventDefault();
    updateAddress(addressForm);
    updateProfile({
      firstName: addressForm.firstName || customer?.firstName || '',
      lastName: addressForm.lastName || customer?.lastName || '',
    });
    setFeedback('Tu direccion de envio quedo guardada.');
  };

  const handleSaveAccount = (e: FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmail(accountForm.email, 'accountEmail');
    if (!accountForm.firstName.trim()) {
      setErrors((prev) => ({ ...prev, accountFirstName: 'Ingresa tu nombre.' }));
      return;
    }

    if (!accountForm.displayName.trim()) {
      setErrors((prev) => ({ ...prev, accountDisplayName: 'Ingresa un nombre visible.' }));
      return;
    }

    if (!accountForm.password.trim()) {
      setErrors((prev) => ({ ...prev, accountPassword: 'La contrasena no puede quedar vacia.' }));
      return;
    }

    if (!isEmailValid) return;

    updateProfile({
      firstName: accountForm.firstName.trim(),
      lastName: accountForm.lastName.trim(),
      displayName: accountForm.displayName.trim(),
      email: accountForm.email.trim(),
      password: accountForm.password.trim(),
    });
    setFeedback('Los detalles de tu cuenta fueron actualizados.');
    setErrors((prev) => ({
      ...prev,
      accountFirstName: '',
      accountDisplayName: '',
      accountPassword: '',
      accountEmail: '',
    }));
  };

  const handleAddressFieldChange = (field: keyof CustomerAddress, value: string) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAccountFieldChange = (field: keyof typeof accountForm, value: string) => {
    setAccountForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'firstName') clearError('accountFirstName');
    if (field === 'displayName') clearError('accountDisplayName');
    if (field === 'email') clearError('accountEmail');
    if (field === 'password') clearError('accountPassword');
  };

  const renderAccountSection = () => {
    if (!customer) return null;

    switch (activeSection) {
      case 'orders':
        return <AccountOrdersSection customerOrders={customerOrders} />;
      case 'downloads':
        return <AccountDownloadsSection />;
      case 'addresses':
        return (
          <AccountAddressesSection
            addressForm={addressForm}
            regions={ACCOUNT_REGIONS}
            onChange={handleAddressFieldChange}
            onSubmit={handleSaveAddress}
          />
        );
      case 'account':
        return (
          <AccountDetailsSection
            accountForm={accountForm}
            errors={errors}
            onChange={handleAccountFieldChange}
            onSubmit={handleSaveAccount}
          />
        );
      default:
        return <AccountDashboardSection customer={customer} />;
    }
  };

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
          {feedback && <div className={styles.feedbackBanner}>{feedback}</div>}

          <div className={styles.authGrid}>
            <AuthAccessSection
              loginEmail={loginEmail}
              loginPassword={loginPassword}
              showPassword={showPassword}
              errors={errors}
              onLoginEmailChange={(value) => {
                setLoginEmail(value);
                clearError('loginEmail');
                clearError('auth');
              }}
              onLoginPasswordChange={(value) => {
                setLoginPassword(value);
                clearError('loginPassword');
                clearError('auth');
              }}
              onTogglePassword={() => setShowPassword((prev) => !prev)}
              onSubmit={handleLoginSubmit}
            />

            <AuthRegisterSection
              registerEmail={registerEmail}
              errors={errors}
              onRegisterEmailChange={(value) => {
                setRegisterEmail(value);
                clearError('registerEmail');
              }}
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
        {feedback && <div className={styles.feedbackBanner}>{feedback}</div>}

        <div className={styles.accountLayout}>
          <section className={styles.accountContent}>{renderAccountSection()}</section>
          <AccountSidebar activeSection={activeSection} onChangeSection={setActiveSection} onLogout={logout} />
        </div>
      </div>
    </motion.div>
  );
};
