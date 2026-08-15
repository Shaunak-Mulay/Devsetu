import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const PBKDF2_ITERATIONS = 210000;
const PBKDF2_KEYLEN = 64;
const PBKDF2_DIGEST = 'sha512';

/**
 * Hash password or 6-digit PIN using secure PBKDF2-HMAC-SHA512
 */
export function hashPassword(password, salt) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST).toString('hex');
  return { salt, hash };
}

/**
 * Verify password against stored PBKDF2 hash (with legacy fallback for existing migration data)
 */
export function verifyPassword(password, storedPassword, storedSalt) {
  if (!storedPassword) return false;
  if (!storedSalt) {
    // Legacy fallback for un-salted records during initial migration
    return password === storedPassword;
  }
  
  // Try current secure iteration count (210,000)
  const hashCurrent = crypto.pbkdf2Sync(password, storedSalt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST).toString('hex');
  if (hashCurrent === storedPassword) return true;

  // Backward compatibility check with legacy (1,000 iterations)
  const hashLegacy = crypto.pbkdf2Sync(password, storedSalt, 1000, PBKDF2_KEYLEN, PBKDF2_DIGEST).toString('hex');
  return hashLegacy === storedPassword;
}

/**
 * Cryptographically secure 6-digit verification code generation
 */
export function generateSecureOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

/**
 * Generate secure JSON Web Token for API authentication
 */
export function generateToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

/**
 * Verify JSON Web Token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (err) {
    return null;
  }
}
