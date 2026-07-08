import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import { dbService } from '../services/dbService.js';

async function saveToMockOutbox(type, recipient, subject, message) {
  try {
    const outbox = (await dbService.getCollection('mock_outbox')) || [];
    const newMsg = {
      id: "MSG-" + Math.floor(100000 + Math.random() * 900000),
      type, // 'sms' or 'email'
      recipient,
      subject,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    outbox.unshift(newMsg);
    if (outbox.length > 50) {
      outbox.pop();
    }
    await dbService.saveCollection('mock_outbox', outbox);
    console.log(`[OUTBOX STORED] Mock ${type} to ${recipient}`);
  } catch (err) {
    console.error("Failed to save mock message to outbox:", err);
  }
}

export class EmailProvider {
  async sendEmail(to, subject, text) {
    throw new Error("Method 'sendEmail' must be implemented.");
  }
}

export class SmtpEmailProvider extends EmailProvider {
  constructor() {
    super();
    this.emailTransporter = null;
    const { host, port, user, pass } = config.smtp;
    if (host && port && user && pass) {
      try {
        this.emailTransporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 5000
        });
        console.log('[SmtpEmailProvider] Nodemailer SMTP transporter initialized successfully.');
      } catch (err) {
        console.error('[SmtpEmailProvider] Failed to initialize SMTP transporter:', err.message);
      }
    } else {
      console.log('[SmtpEmailProvider] SMTP credentials missing in env. SMTP emails will be logged and bypassed.');
    }
  }

  async sendEmail(to, subject, text) {
    const from = config.smtp.from;

    // Log the transmission in the console log
    console.log(`\n================== [EMAIL DISPATCH] ==================`);
    console.log(`[EMAIL SENDING] To ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message:\n${text}`);
    console.log(`======================================================\n`);

    // Record the simulated outbox entry
    await saveToMockOutbox('email', to, subject, text);

    if (!this.emailTransporter) {
      console.log(`[SmtpEmailProvider] SMTP transporter not configured. Email to ${to} bypassed.`);
      return true;
    }

    try {
      const info = await this.emailTransporter.sendMail({
        from,
        to,
        subject,
        text
      });
      console.log(`[SmtpEmailProvider] Email successfully sent via SMTP to ${to}. MessageID: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error(`[SmtpEmailProvider] Failed to send Email via SMTP to ${to}:`, err.message);
      return false;
    }
  }
}
export { saveToMockOutbox };
