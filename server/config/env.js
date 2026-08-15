import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'devsetu-super-secret-jwt-key-2026-production',
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceRoleKey: supabaseServiceKey,
    isConfigured: !!(supabaseUrl && (supabaseServiceKey || supabaseAnonKey))
  },
  databaseUrl: process.env.DATABASE_URL || '',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    user: process.env.SMTP_USER || process.env.SMTP_LOGIN,
    pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
    from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_FROM || 'noreply@devsetu.in',
    fromName: process.env.SMTP_FROM_NAME || 'Devsetu Connect',
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_FROM || 'noreply@devsetu.in',
    emailEnabled: process.env.EMAIL_ENABLED !== 'false'
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID
  },
  fcm: {
    serverKey: process.env.FCM_SERVER_KEY
  },
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || "",
    databaseURL: process.env.FIREBASE_DATABASE_URL || ""
  },
  support: {
    phone: process.env.SUPPORT_PHONE || '+91 97631 47067',
    rawPhone: process.env.SUPPORT_RAW_PHONE || '+919763147067',
    email: process.env.SUPPORT_EMAIL || 'devsetuconnect@gmail.com'
  }
};
