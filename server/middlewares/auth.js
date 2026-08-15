import { verifyToken } from '../utils/crypto.js';

/**
 * Middleware to require valid JWT authentication for protected API endpoints
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. Authentication token is missing." });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired session token. Please log in again." });
  }

  req.user = decoded;
  next();
}

/**
 * Middleware to enforce Admin role privileges
 */
export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. Authentication token is missing." });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired session token. Please log in again." });
  }

  if (decoded.role !== 'admin') {
    return res.status(403).json({ error: "Access forbidden. Administrator privileges are required." });
  }

  req.user = decoded;
  next();
}

/**
 * Optional authentication middleware: parses token if present, does not block if absent
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
}
