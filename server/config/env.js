import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: process.env.PORT || 5000,
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
    fromName: process.env.SMTP_FROM_NAME || 'Devsetu Connect',
    fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@devsetu.in',
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
  }
};
