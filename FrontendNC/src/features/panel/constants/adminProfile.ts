export const ADMIN_EMAIL_KEY = 'nc-admin-email';
export const DEFAULT_ADMIN_EMAIL = 'admin@ncstore.com';

export const getAdminEmail = (): string =>
  localStorage.getItem(ADMIN_EMAIL_KEY) || DEFAULT_ADMIN_EMAIL;

export const setAdminEmail = (email: string) => {
  localStorage.setItem(ADMIN_EMAIL_KEY, email);
};
