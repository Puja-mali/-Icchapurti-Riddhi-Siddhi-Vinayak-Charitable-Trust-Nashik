import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Securely hashes a plain-text password using bcrypt.
 * Never store raw passwords.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares a plain-text password against an existing bcrypt hash.
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
