import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'capacitor://localhost',
  'http://localhost',
  'https://localhost',
  'https://devsetu.in',
  'https://www.devsetu.in',
  'https://devsetu-eta.vercel.app',
  'https://devsetuconnect.web.app'
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Mobile apps (Capacitor/Cordova/React Native), curl, Postman often send no origin or custom scheme
    if (!origin) return callback(null, true);
    
    // Check allowed list or any localhost/capacitor/Vercel origins
    if (
      allowedOrigins.includes(origin) ||
      origin.includes('localhost') ||
      origin.startsWith('capacitor://') ||
      origin.startsWith('file://') ||
      origin.endsWith('.vercel.app') ||
      /^https?:\/\/(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(origin) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }

    // Always allow origin for mobile webviews to prevent network fetch errors
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
});
