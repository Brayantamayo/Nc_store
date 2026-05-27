import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CustomerAddress {
  firstName: string;
  lastName: string;
  country: string;
  addressLine1: string;
  addressLine2: string;
  region: string;
  city: string;
  postalCode: string;
}

export interface CustomerSession {
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  password: string;
  createdAt: string;
  address: CustomerAddress;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  customer?: CustomerSession;
}

export interface RegisterResponse extends AuthResponse {
  generatedPassword?: string;
}

interface CustomerSessionState {
  customer: CustomerSession | null;
  customers: CustomerSession[];
  login: (email: string, password: string) => AuthResponse;
  registerWithEmail: (email: string) => RegisterResponse;
  updateProfile: (payload: Partial<CustomerSession>) => void;
  updateAddress: (address: CustomerAddress) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const ACCOUNT_REGIONS: Record<string, string[]> = {
  Antioquia: ['Medellin', 'Envigado', 'Sabaneta', 'Bello', 'Itagui', 'Rionegro'],
  Cundinamarca: ['Bogota', 'Chia', 'Soacha', 'Zipaquira'],
  Valle: ['Cali', 'Palmira', 'Jamundi'],
  Atlantico: ['Barranquilla', 'Soledad', 'Puerto Colombia'],
  Santander: ['Bucaramanga', 'Floridablanca', 'Giron'],
};

const STORAGE_KEY = 'nc-customer-session';
const STORAGE_VERSION = 2;
const DEFAULT_COUNTRY = 'Colombia';

const generateTemporaryPassword = (email: string) => {
  const seed = email.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5) || 'nc';
  const suffix = Math.floor(100 + Math.random() * 900);
  return `NC-${seed}${suffix}`;
};

const normalizeNameToken = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const wasGeneratedFromEmail = (value: string, email: string) => {
  const normalizedValue = normalizeNameToken(value);
  if (!normalizedValue) return false;

  const emailAlias = email.split('@')[0] ?? '';
  const normalizedAlias = normalizeNameToken(emailAlias);
  const normalizedFirstAlias = normalizeNameToken(emailAlias.replace(/[._-]+/g, ' ').trim().split(' ')[0] ?? '');

  return normalizedValue === normalizedAlias || normalizedValue === normalizedFirstAlias;
};

const buildEmptyAddress = (): CustomerAddress => ({
  firstName: '',
  lastName: '',
  country: DEFAULT_COUNTRY,
  addressLine1: '',
  addressLine2: '',
  region: '',
  city: '',
  postalCode: '',
});

const buildCustomer = (email: string): CustomerSession => ({
  email,
  firstName: '',
  lastName: '',
  displayName: '',
  password: generateTemporaryPassword(email),
  createdAt: new Date().toISOString(),
  address: buildEmptyAddress(),
});

const normalizeEmail = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const normalizeCustomer = (value: unknown): CustomerSession | null => {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Partial<CustomerSession>;
  const email = normalizeEmail(candidate.email);
  if (!email) return null;

  const firstName = typeof candidate.firstName === 'string' ? candidate.firstName.trim() : '';
  const displayName = typeof candidate.displayName === 'string' ? candidate.displayName.trim() : '';

  return {
    email,
    firstName: firstName && !wasGeneratedFromEmail(firstName, email) ? firstName : '',
    lastName: typeof candidate.lastName === 'string' ? candidate.lastName.trim() : '',
    displayName: displayName && !wasGeneratedFromEmail(displayName, email) ? displayName : '',
    password:
      typeof candidate.password === 'string' && candidate.password.trim()
        ? candidate.password.trim()
        : generateTemporaryPassword(email),
    createdAt:
      typeof candidate.createdAt === 'string' && candidate.createdAt.trim()
        ? candidate.createdAt
        : new Date().toISOString(),
    address: {
      ...buildEmptyAddress(),
      ...(candidate.address && typeof candidate.address === 'object' ? candidate.address : {}),
      country:
        candidate.address && typeof candidate.address === 'object' && typeof candidate.address.country === 'string'
          ? candidate.address.country
          : DEFAULT_COUNTRY,
    },
  };
};

const normalizePersistedState = (state: unknown) => {
  if (!state || typeof state !== 'object') {
    return { customer: null, customers: [] as CustomerSession[] };
  }

  const rawState = state as { customer?: unknown; customers?: unknown };
  const customers = Array.isArray(rawState.customers)
    ? rawState.customers.map(normalizeCustomer).filter((item): item is CustomerSession => Boolean(item))
    : [];

  const currentCustomer = normalizeCustomer(rawState.customer);
  if (currentCustomer && !customers.some((item) => item.email === currentCustomer.email)) {
    customers.unshift(currentCustomer);
  }

  return {
    customer: currentCustomer,
    customers,
  };
};

export const useCustomerSessionStore = create<CustomerSessionState>()(
  persist(
    (set, get) => ({
      customer: null,
      customers: [],

      login: (email: string, password: string) => {
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPassword = password.trim();
        const foundCustomer = get().customers.find((item) => item.email === normalizedEmail);

        if (!foundCustomer) {
          return {
            success: false,
            message: 'No encontramos una cuenta con ese correo. Registrate primero para crearla.',
          };
        }

        if (foundCustomer.password !== normalizedPassword) {
          return {
            success: false,
            message: 'La contrasena no coincide con la asignada a esta cuenta.',
          };
        }

        set({ customer: foundCustomer });
        return {
          success: true,
          message: 'Sesion iniciada correctamente.',
          customer: foundCustomer,
        };
      },

      registerWithEmail: (email: string) => {
        const normalizedEmail = email.trim().toLowerCase();
        const existingCustomer = get().customers.find((item) => item.email === normalizedEmail);

        if (existingCustomer) {
          set({ customer: existingCustomer });
          return {
            success: true,
            message: 'Esta cuenta ya existia. Te llevamos a tu perfil.',
            customer: existingCustomer,
          };
        }

        const newCustomer = buildCustomer(normalizedEmail);

        set((state) => ({
          customer: newCustomer,
          customers: [newCustomer, ...state.customers],
        }));

        return {
          success: true,
          message: 'Cuenta creada correctamente.',
          customer: newCustomer,
          generatedPassword: newCustomer.password,
        };
      },

      updateProfile: (payload) => {
        const currentCustomer = get().customer;
        if (!currentCustomer) return;

        const updatedCustomer: CustomerSession = {
          ...currentCustomer,
          ...payload,
          email: payload.email?.trim().toLowerCase() ?? currentCustomer.email,
          address: payload.address ? { ...currentCustomer.address, ...payload.address } : currentCustomer.address,
        };

        set((state) => ({
          customer: updatedCustomer,
          customers: state.customers.map((item) => (item.email === currentCustomer.email ? updatedCustomer : item)),
        }));
      },

      updateAddress: (address) => {
        const currentCustomer = get().customer;
        if (!currentCustomer) return;

        const updatedCustomer = {
          ...currentCustomer,
          address,
        };

        set((state) => ({
          customer: updatedCustomer,
          customers: state.customers.map((item) => (item.email === currentCustomer.email ? updatedCustomer : item)),
        }));
      },

      logout: () => set({ customer: null }),

      isLoggedIn: () => Boolean(get().customer),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      migrate: (persistedState) => normalizePersistedState(persistedState),
    }
  )
);
