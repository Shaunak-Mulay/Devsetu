import twilio from 'twilio';
import { config } from '../config/env.js';
import { dbService } from '../services/dbService.js';
import { saveToMockOutbox } from './emailProvider.js';

export class SmsProvider {
  async sendSms(to, message) {
    throw new Error("Method 'sendSms' must be implemented.");
  }

  async sendOtp(to, email) {
    throw new Error("Method 'sendOtp' must be implemented.");
  }
}

/**
 * Mock SMS Provider for development
 */
export class MockSmsProvider extends SmsProvider {
  async sendSms(to, message) {
    console.log(`\n================== [MOCK SMS DISPATCH] ==================`);
    console.log(`[SMS SENDING] To ${to}:`);
    console.log(message);
    console.log(`=========================================================\n`);

    await saveToMockOutbox('sms', to, 'SMS Message', message);
    return true;
  }

  async sendOtp(to, email) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const identity = (email || to).toLowerCase();

    // Store securely in the DB otps collection
    const otps = await dbService.getCollection('otps') || [];
    const filteredOtps = otps.filter(o => o.email && o.email.toLowerCase() !== identity);
    filteredOtps.push({
      email: identity,
      code,
      expiresAt,
      attempts: 0
    });
    await dbService.saveCollection('otps', filteredOtps);

    const message = `DEVSETU CONNECT\n\nYour login verification OTP is:\n\n${code}\n\nValid for 10 minutes.`;

    console.log(`\n================== [MOCK SMS PROVIDER] ==================`);
    console.log(`[SMS SENDING] To ${to}:`);
    console.log(message);
    console.log(`[BACKEND LOG - SECURE OTP] Generated OTP: ${code} for identity ${identity}`);
    console.log(`=========================================================\n`);

    await saveToMockOutbox('sms', to, 'Login OTP Code', message);
    return { success: true, code };
  }
}

/**
 * Twilio SMS Provider
 */
export class TwilioSmsProvider extends SmsProvider {
  constructor() {
    super();
    this.twilioClient = null;
    const { accountSid, authToken, phoneNumber } = config.twilio;
    this.fromNumber = phoneNumber;
    if (accountSid && authToken && phoneNumber) {
      try {
        this.twilioClient = twilio(accountSid, authToken);
        console.log('[TwilioSmsProvider] Twilio client initialized successfully.');
      } catch (err) {
        console.error('[TwilioSmsProvider] Failed to initialize Twilio client:', err.message);
      }
    } else {
      console.log('[TwilioSmsProvider] Twilio credentials missing in env. Twilio SMS will be logged and bypassed.');
    }
  }

  async sendSms(to, message) {
    // Format to E.164 standard
    let formattedTo = to.trim();
    if (!formattedTo.startsWith('+')) {
      if (formattedTo.length === 10) {
        formattedTo = '+91' + formattedTo;
      } else {
        formattedTo = '+' + formattedTo;
      }
    }

    console.log(`\n================== [TWILIO SMS DISPATCH] ==================`);
    console.log(`[SMS SENDING] To ${formattedTo}:`);
    console.log(message);
    console.log(`===========================================================\n`);

    await saveToMockOutbox('sms', to, 'SMS Message', message);

    if (!this.twilioClient) {
      console.log(`[TwilioSmsProvider] Twilio client not configured. SMS to ${formattedTo} bypassed.`);
      return true;
    }

    try {
      const response = await this.twilioClient.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedTo
      });
      console.log(`[TwilioSmsProvider] SMS successfully sent via Twilio to ${formattedTo}. SID: ${response.sid}`);
      return true;
    } catch (err) {
      console.error(`[TwilioSmsProvider] Failed to send SMS via Twilio to ${to}:`, err.message);
      return false;
    }
  }

  async sendOtp(to, email) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const otps = await dbService.getCollection('otps') || [];
    const filteredOtps = otps.filter(o => o.email && o.email.toLowerCase() !== email.toLowerCase());
    filteredOtps.push({
      email: email.toLowerCase(),
      code,
      expiresAt,
      attempts: 0
    });
    await dbService.saveCollection('otps', filteredOtps);

    const message = `DEVSETU CONNECT\n\nYour login verification OTP is:\n\n${code}\n\nValid for 10 minutes.`;

    console.log(`\n================== [TWILIO SMS PROVIDER] ==================`);
    console.log(`[SMS SENDING] To ${to}:`);
    console.log(message);
    console.log(`[BACKEND LOG - SECURE OTP] Generated OTP: ${code} for email ${email}`);
    console.log(`===========================================================\n`);

    await saveToMockOutbox('sms', to, 'Login OTP Code', message);

    // If twilio client not initialized, fallback to mock SMS print success
    if (!this.twilioClient) {
      return { success: true, code };
    }

    try {
      let formattedTo = to.trim();
      if (!formattedTo.startsWith('+')) {
        if (formattedTo.length === 10) formattedTo = '+91' + formattedTo;
        else formattedTo = '+' + formattedTo;
      }
      await this.twilioClient.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedTo
      });
      return { success: true, code };
    } catch (err) {
      console.error('[TwilioSmsProvider] Twilio failed to dispatch OTP SMS:', err.message);
      return { success: true, code };
    }
  }
}

/**
 * MSG91 SMS Provider
 */
export class Msg91SmsProvider extends SmsProvider {
  constructor() {
    super();
    this.authKey = process.env.MSG91_AUTH_KEY;
    this.senderId = process.env.MSG91_SENDER_ID || "DEVSTU";
    if (this.authKey) {
      console.log('[Msg91SmsProvider] MSG91 SMS Client configured successfully.');
    } else {
      console.log('[Msg91SmsProvider] MSG91 credentials missing. MSG91 SMS will be logged and bypassed.');
    }
  }

  async sendSms(to, message) {
    let formattedTo = to.trim().replace('+', '');
    if (formattedTo.length === 10) {
      formattedTo = '91' + formattedTo;
    }

    console.log(`\n================== [MSG91 SMS DISPATCH] ==================`);
    console.log(`[SMS SENDING] To ${formattedTo}:`);
    console.log(message);
    console.log(`==========================================================\n`);

    await saveToMockOutbox('sms', to, 'SMS Message (MSG91)', message);

    if (!this.authKey) {
      console.log(`[Msg91SmsProvider] MSG91 not configured. SMS to ${formattedTo} bypassed.`);
      return true;
    }

    try {
      const res = await fetch("https://control.msg91.com/api/v5/sms/send", {
        method: "POST",
        headers: {
          "authkey": this.authKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender: this.senderId,
          route: "4",
          country: "91",
          sms: [
            {
              message: message,
              to: [formattedTo]
            }
          ]
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[Msg91SmsProvider] MSG91 API responded with error:`, errText);
        return false;
      }

      console.log(`[Msg91SmsProvider] SMS successfully sent via MSG91 to ${formattedTo}.`);
      return true;
    } catch (err) {
      console.error(`[Msg91SmsProvider] Failed to send SMS via MSG91 to ${to}:`, err.message);
      return false;
    }
  }

  async sendOtp(to, email) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const otps = await dbService.getCollection('otps') || [];
    const filteredOtps = otps.filter(o => o.email && o.email.toLowerCase() !== email.toLowerCase());
    filteredOtps.push({
      email: email.toLowerCase(),
      code,
      expiresAt,
      attempts: 0
    });
    await dbService.saveCollection('otps', filteredOtps);

    const message = `DEVSETU CONNECT\n\nYour login verification OTP is:\n\n${code}\n\nValid for 10 minutes.`;

    console.log(`\n================== [MSG91 SMS PROVIDER] ==================`);
    console.log(`[SMS SENDING] To ${to}:`);
    console.log(message);
    console.log(`[BACKEND LOG - SECURE OTP] Generated OTP: ${code} for email ${email}`);
    console.log(`==========================================================\n`);

    if (process.env.SMS_ENABLED === 'true') {
      await this.sendSms(to, message);
    } else {
      console.log(`[Msg91SmsProvider] SMS_ENABLED=false. Bypassing MSG91 dispatch for OTP.`);
      await saveToMockOutbox('sms', to, 'Login OTP Code (Bypassed)', message);
    }

    return { success: true, code };
  }
}
