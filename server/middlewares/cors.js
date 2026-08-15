import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'capacitor://localhost',
  'http://localhost',
  'https://devsetu.in',
  'https://www.devsetu.in',
  'https://devsetu-eta.vercel.app',
  'https://devsetuconnect.web.app'
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Capacitor native, Postman)
    if (!origin) return callback(null, true);
    
    // Check whitelist or any Vercel subdomains
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      /^https?:\/\/(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(origin) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy does not allow access from origin: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
});
