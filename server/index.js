import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { corsMiddleware } from './middlewares/cors.js';
import { loggerMiddleware } from './middlewares/logger.js';

import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

import { getSmtpHealth } from './controllers/emailController.js';
import { updatePrefs } from './controllers/notificationController.js';
import { getServices } from './controllers/servicesController.js';

const app = express();
const PORT = config.port;

// Middlewares
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads
app.use(loggerMiddleware);

// Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api', supportRoutes); // /api/tickets, /api/chats
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes); // /api/admin/pin-resets, /api/admin/audit-logs
app.use('/api/notifications', notificationRoutes);
app.use('/api/debug', debugRoutes); // /api/debug/outbox
app.use('/api/payment', paymentRoutes); // /api/payment/qr

// Email health endpoint & backward compatibility routes
app.get('/api/email/health', getSmtpHealth);
app.get('/api/services', getServices);
app.post('/api/users/notification-preferences', updatePrefs);

// Serve static assets from front-end build directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to index.html for Single Page Application routing (excluding API routes)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Server Listen (only in standalone Node server environment)
if (!process.env.VERCEL && process.env.VERCEL !== '1') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server successfully running on http://0.0.0.0:${PORT}`);
    console.log(`Accessible locally at http://localhost:${PORT}`);
  });
}

export default app;
