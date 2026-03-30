import { config } from '../config/index.js';

export type UserRole = 'admin' | 'user';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const getRoleForEmail = (email: string): UserRole => {
  const adminEmail = normalizeEmail(config.adminEmail);
  const loginEmail = normalizeEmail(email);
  return loginEmail === adminEmail ? 'admin' : 'user';
};
