/**
 * Utility functions for sanitizing objects before serializing to API responses.
 * Prevents accidental exposure of password hashes, salts, security tokens, and credentials.
 */

export function sanitizeUser(user) {
  if (!user) return null;
  // If it's a plain object or Firestore document object, create a clean copy
  const userObj = typeof user.toObject === 'function' ? user.toObject() : { ...user };

  delete userObj.password;
  delete userObj.salt;
  delete userObj.secret;
  delete userObj.smtpPass;
  delete userObj.smtpPassword;
  delete userObj.privateKey;
  delete userObj.serviceAccount;

  return userObj;
}

export function sanitizeUsers(users) {
  if (!Array.isArray(users)) return [];
  return users.map(u => sanitizeUser(u));
}
