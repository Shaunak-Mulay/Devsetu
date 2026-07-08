import crypto from 'crypto';

export function hashPassword(password, salt) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPassword(password, storedPassword, storedSalt) {
  if (!storedSalt) {
    // Plaintext fallback for legacy/seeded database items
    return password === storedPassword;
  }
  const hash = crypto.pbkdf2Sync(password, storedSalt, 1000, 64, 'sha512').toString('hex');
  return hash === storedPassword;
}
