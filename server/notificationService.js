import nodemailer from 'nodemailer';
import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { database } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load server/.env to ensure feature flags are available
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Helper to save messages to the mock outbox for front-end consumption
async function saveToMockOutbox(type, recipient, subject, message) {
  try {
    const outbox = (await database.getCollection('mock_outbox')) || [];
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
    await database.saveCollection('mock_outbox', outbox);
    console.log(`[OUTBOX STORED] Mock ${type} to ${recipient}`);
  } catch (err) {
    console.error("Failed to save mock message to outbox:", err);
  }
}

/**
 * Base EmailProvider interface
 */
export class EmailProvider {
  async sendEmail(to, subject, text) {
    throw new Error("Method 'sendEmail' must be implemented.");
  }
}

/**
 * Base SmsProvider interface
 */
export class SmsProvider {
  async sendSms(to, message) {
    throw new Error("Method 'sendSms' must be implemented.");
  }

  async sendOtp(to, email) {
    throw new Error("Method 'sendOtp' must be implemented.");
  }
}

/**
 * Base PushProvider interface
 */
export class PushProvider {
  async sendPush(token, payload) {
    throw new Error("Method 'sendPush' must be implemented.");
  }
}

/**
 * SMTP Email Provider implementation using Nodemailer
 */
export class SmtpEmailProvider extends EmailProvider {
  constructor() {
    super();
    this.emailTransporter = null;
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
    if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM) {
      try {
        this.emailTransporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: parseInt(SMTP_PORT, 10),
          secure: parseInt(SMTP_PORT, 10) === 465,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
          }
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
    const { SMTP_FROM } = process.env;

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
        from: SMTP_FROM,
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
    const otps = await database.getCollection('otps');
    const filteredOtps = otps.filter(o => o.email && o.email.toLowerCase() !== identity);
    filteredOtps.push({
      email: identity,
      code,
      expiresAt,
      attempts: 0
    });
    await database.saveCollection('otps', filteredOtps);

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
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
    this.fromNumber = TWILIO_PHONE_NUMBER;
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
      try {
        this.twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
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

    const otps = await database.getCollection('otps');
    const filteredOtps = otps.filter(o => o.email && o.email.toLowerCase() !== email.toLowerCase());
    filteredOtps.push({
      email: email.toLowerCase(),
      code,
      expiresAt,
      attempts: 0
    });
    await database.saveCollection('otps', filteredOtps);

    const message = `DEVSETU CONNECT\n\nYour login verification OTP is:\n\n${code}\n\nValid for 10 minutes.`;

    console.log(`\n================== [TWILIO SMS PROVIDER] ==================`);
    console.log(`[SMS SENDING] To ${to}:`);
    console.log(message);
    console.log(`[BACKEND LOG - SECURE OTP] Generated OTP: ${code} for email ${email}`);
    console.log(`===========================================================\n`);

    if (process.env.SMS_ENABLED === 'true') {
      await this.sendSms(to, message);
    } else {
      console.log(`[TwilioSmsProvider] SMS_ENABLED=false. Bypassing Twilio dispatch for OTP.`);
      await saveToMockOutbox('sms', to, 'Login OTP Code (Bypassed)', message);
    }

    return { success: true, code };
  }
}

/**
 * MSG91 SMS Provider - Complete Production Ready Integration
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

    const otps = await database.getCollection('otps');
    const filteredOtps = otps.filter(o => o.email && o.email.toLowerCase() !== email.toLowerCase());
    filteredOtps.push({
      email: email.toLowerCase(),
      code,
      expiresAt,
      attempts: 0
    });
    await database.saveCollection('otps', filteredOtps);

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

/**
 * FCM Push Notification Provider Stub & Implementation
 */
export class FcmPushProvider extends PushProvider {
  constructor() {
    super();
    this.fcmServerKey = process.env.FCM_SERVER_KEY;
    if (this.fcmServerKey) {
      console.log('[FcmPushProvider] FCM Server Key configured.');
    } else {
      console.log('[FcmPushProvider] FCM Server Key missing in env. Push notifications will be logged and bypassed.');
    }
  }

  async sendPush(token, payload) {
    const { title, body, type, relatedBookingId, relatedProfileId, deepLink } = payload;
    const timestamp = new Date().toISOString();

    console.log(`\n================== [FCM PUSH DISPATCH] ==================`);
    console.log(`[PUSH SENDING] To token: ${token}`);
    console.log(`Title: ${title}`);
    console.log(`Body: ${body}`);
    console.log(`Payload:`, { type, relatedBookingId, relatedProfileId, timestamp, deepLink });
    console.log(`==========================================================\n`);

    await saveToMockOutbox('push', token, title, JSON.stringify({ body, type, relatedBookingId, relatedProfileId, timestamp, deepLink }));

    if (!this.fcmServerKey) {
      console.log(`[FcmPushProvider] FCM not configured. Push to ${token.slice(0, 10)}... bypassed.`);
      return true;
    }

    try {
      const res = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Authorization": `key=${this.fcmServerKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: token,
          notification: {
            title,
            body,
            click_action: "FLUTTER_NOTIFICATION_CLICK"
          },
          data: {
            type,
            relatedBookingId,
            relatedProfileId,
            timestamp,
            deepLink
          }
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[FcmPushProvider] FCM Send API returned non-OK:`, errText);
        return false;
      }

      console.log(`[FcmPushProvider] Push successfully sent via FCM.`);
      return true;
    } catch (err) {
      console.error(`[FcmPushProvider] Failed to send FCM push:`, err.message);
      return false;
    }
  }
}

// Notification Matrix Definition
const eventMapping = {
  "Registration Submitted": { priority: "MEDIUM", category: "registration", channels: ["email", "push", "in-app"] },
  "Registration Approved": { priority: "HIGH", category: "registration", channels: ["email", "push", "sms", "in-app"] },
  "Registration Rejected": { priority: "HIGH", category: "registration", channels: ["email", "push", "sms", "in-app"] },
  "Booking Submitted": { priority: "MEDIUM", category: "booking", channels: ["email", "push", "in-app"] },
  "Booking Approved": { priority: "HIGH", category: "booking", channels: ["email", "push", "sms", "in-app"] },
  "Booking Rejected": { priority: "HIGH", category: "booking", channels: ["email", "push", "sms", "in-app"] },
  "Admin Chat Message": { priority: "LOW", category: "chat", channels: ["push", "in-app"] },
  "Chat Message": { priority: "LOW", category: "chat", channels: ["push", "in-app"] },
  "Password Reset": { priority: "HIGH", category: "admin", channels: ["email", "push", "sms", "in-app"] },
  "Password Changed": { priority: "HIGH", category: "admin", channels: ["email", "push", "in-app"] },
  "Membership Activated": { priority: "MEDIUM", category: "membership", channels: ["email", "push", "in-app"] },
  "Membership Expired": { priority: "MEDIUM", category: "membership", channels: ["email", "push", "in-app"] },
  "Membership Reminder": { priority: "MEDIUM", category: "membership", channels: ["email", "push", "in-app"] },
  "App Update": { priority: "LOW", category: "admin", channels: ["push"] },
  "Maintenance Alert": { priority: "LOW", category: "admin", channels: ["push"] }
};

/**
 * Centralized Notification Service orchestrator
 */
export class NotificationService {
  constructor(emailProvider, smsProvider, pushProvider) {
    this.emailProvider = emailProvider;
    this.smsProvider = smsProvider;
    this.pushProvider = pushProvider;
  }

  isEmailEnabled() {
    return process.env.EMAIL_ENABLED === 'true';
  }

  isSmsEnabled() {
    return process.env.SMS_ENABLED === 'true';
  }

  async sendEmail(to, subject, text) {
    if (!to) return true;
    if (!this.isEmailEnabled()) {
      console.log(`[NotificationService] Email disabled globally. Bypassing email to ${to}.`);
      return true;
    }
    try {
      return await this.emailProvider.sendEmail(to, subject, text);
    } catch (err) {
      console.error(`[NotificationService] Error sending email to ${to}:`, err.message);
      return false;
    }
  }

  async sendSMS(to, message) {
    if (!to) return true;
    if (!this.isSmsEnabled()) {
      console.log(`[NotificationService] SMS disabled globally. Bypassing SMS to ${to}.`);
      return true;
    }
    try {
      return await this.smsProvider.sendSms(to, message);
    } catch (err) {
      console.error(`[NotificationService] Error sending SMS to ${to}:`, err.message);
      return false;
    }
  }

  async sendPushNotification(token, title, body, data) {
    if (!token) return true;
    try {
      return await this.pushProvider.sendPush(token, { title, body, ...data });
    } catch (err) {
      console.error(`[NotificationService] Error sending push:`, err.message);
      return false;
    }
  }

  async createInAppNotification(userId, type, title, body, relatedBookingId, relatedProfileId) {
    try {
      const notifications = await database.getCollection('notifications');
      const newNotif = {
        id: "NT-" + Math.floor(10000 + Math.random() * 90000),
        notificationId: "NT-" + Math.floor(10000 + Math.random() * 90000),
        userId,
        userEmail: userId, // Backwards compatibility mapping
        type,
        title,
        message: body,
        body: body, // Backwards compatibility mapping
        channel: "in-app",
        status: "Sent",
        read: false,
        createdAt: new Date().toISOString(),
        relatedBookingId: relatedBookingId || null,
        relatedProfileId: relatedProfileId || null
      };
      notifications.unshift(newNotif);
      await database.saveCollection('notifications', notifications);
      console.log(`[In-App Notification] Created for ${userId}: ${title}`);
      return newNotif;
    } catch (err) {
      console.error("[NotificationService] Failed to create in-app notification:", err.message);
      return null;
    }
  }

  async sendNotification({ userId, event, title, body, relatedBookingId, relatedProfileId }) {
    console.log(`[NotificationService] Orchestrating notification for event: "${event}"`);
    try {
      const users = await database.getCollection('users');
      const user = users.find(u => (u.email && u.email.toLowerCase() === userId.toLowerCase()) || u.phone === userId || u.mobile === userId || u.profileId === userId);
      
      if (!user) {
        console.warn(`[NotificationService] User not found for recipient: ${userId}`);
        return { success: false, error: "User not found" };
      }

      const userEmail = user.email || "";
      const userPhone = user.phone || user.mobile || "";
      const deviceToken = user.deviceToken || "";

      // Load user preferences, default to all enabled
      const prefs = user.notificationPreferences || {
        email: true,
        push: true,
        sms: true,
        booking: true,
        membership: true,
        chat: true
      };

      // Get event channel mapping
      const mapping = eventMapping[event] || { priority: "LOW", category: "admin", channels: ["push", "in-app"] };
      const { priority, category, channels } = mapping;

      // Check category preference
      if (prefs[category] === false) {
        console.log(`[NotificationService] User disabled notifications for category: "${category}". Bypassing all channels.`);
        return { success: true, bypassed: "category_preference" };
      }

      const results = {};

      // 1. In-App Notification (Always stored)
      if (channels.includes("in-app")) {
        const notif = await this.createInAppNotification(
          userEmail || userPhone,
          category,
          title,
          body,
          relatedBookingId,
          relatedProfileId
        );
        results.inApp = notif ? "Sent" : "Failed";
      }

      // 2. Email Notification
      if (channels.includes("email") && userEmail && prefs.email !== false) {
        const emailSent = await this.sendEmail(userEmail, title, body);
        results.email = emailSent ? "Sent" : "Failed";
      } else if (channels.includes("email")) {
        results.email = "Bypassed (No Email/Pref)";
      }

      // 3. Push Notification
      if (channels.includes("push") && prefs.push !== false) {
        if (deviceToken) {
          const pushSent = await this.sendPushNotification(deviceToken, title, body, {
            type: category,
            relatedBookingId,
            relatedProfileId
          });
          results.push = pushSent ? "Sent" : "Failed";
        } else {
          console.log(`[NotificationService] No push token registered for ${userEmail || userPhone}. Push bypassed.`);
          results.push = "Bypassed (No Token)";
        }
      } else if (channels.includes("push")) {
        results.push = "Bypassed (Pref)";
      }

      // 4. SMS Notification (Enforce Cost Optimization & priority checks)
      if (channels.includes("sms") && userPhone && prefs.sms !== false) {
        if (priority === "HIGH") {
          const smsSent = await this.sendSMS(userPhone, `${title}\n\n${body}`);
          results.sms = smsSent ? "Sent" : "Failed";
        } else {
          console.log(`[NotificationService] Cost Optimization: Skipping SMS for Medium/Low priority event "${event}".`);
          results.sms = "Bypassed (Priority)";
        }
      } else if (channels.includes("sms")) {
        results.sms = "Bypassed (No Phone/Pref)";
      }

      // Record this delivery status in history log for Admin Console tracking
      const historyLog = {
        notificationId: "NT-" + Math.floor(10000 + Math.random() * 90000),
        userId: userEmail || userPhone,
        type: category,
        title,
        message: body,
        channel: channels.join(','),
        status: JSON.stringify(results),
        read: false,
        createdAt: new Date().toISOString(),
        relatedBookingId: relatedBookingId || null,
        relatedProfileId: relatedProfileId || null,
        priority
      };
      const notifications = await database.getCollection('notifications');
      // If it wasn't added in in-app block, add a system delivery record
      if (!channels.includes("in-app")) {
        notifications.unshift(historyLog);
        await database.saveCollection('notifications', notifications);
      }

      return { success: true, priority, category, results };
    } catch (err) {
      console.error("[NotificationService] Orchestration failed:", err.message);
      return { success: false, error: err.message };
    }
  }

  async broadcastNotification(adminId, { targetRole, targetUserIds, title, body, type }) {
    console.log(`[NotificationService] Broadcasting from ${adminId} to target:`, { targetRole, targetUserIds });
    try {
      const users = await database.getCollection('users');
      let recipients = [];

      if (targetUserIds && targetUserIds.length > 0) {
        recipients = users.filter(u => targetUserIds.includes(u.profileId) || targetUserIds.includes(u.email) || targetUserIds.includes(u.phone));
      } else if (targetRole) {
        recipients = users.filter(u => u.role === targetRole);
      } else {
        // Broadcast to all astrologers by default if targetRole is "astrologer" or empty
        recipients = users.filter(u => u.role === "astrologer");
      }

      const promises = recipients.map(user => {
        return this.sendNotification({
          userId: user.email || user.phone,
          event: "Admin Chat Message",
          title,
          body,
          relatedProfileId: adminId
        });
      });

      await Promise.all(promises);
      return { success: true, count: recipients.length };
    } catch (err) {
      console.error("[NotificationService] Broadcast failed:", err.message);
      return { success: false, error: err.message };
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notifications = await database.getCollection('notifications');
      let count = 0;
      const updated = notifications.map(n => {
        const matchUser = n.userId === userId || n.userEmail === userId;
        const matchId = notificationId === 'all' || n.id === notificationId || n.notificationId === notificationId;
        if (matchUser && matchId) {
          count++;
          return { ...n, read: true };
        }
        return n;
      });
      await database.saveCollection('notifications', updated);
      return { success: true, count };
    } catch (err) {
      console.error("[NotificationService] Failed to mark read:", err.message);
      return { success: false, error: err.message };
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      const notifications = await database.getCollection('notifications');
      const filtered = notifications.filter(n => {
        const matchUser = n.userId === userId || n.userEmail === userId;
        const matchId = notificationId === 'all' || n.id === notificationId || n.notificationId === notificationId;
        return !(matchUser && matchId);
      });
      await database.saveCollection('notifications', filtered);
      return { success: true };
    } catch (err) {
      console.error("[NotificationService] Failed to delete notification:", err.message);
      return { success: false, error: err.message };
    }
  }

  async getNotificationHistory(userId) {
    try {
      const notifications = await database.getCollection('notifications');
      if (userId === 'admin') {
        return notifications;
      }
      const users = await database.getCollection('users');
      const user = users.find(u => (u.email && u.email.toLowerCase() === userId.toLowerCase()) || u.phone === userId || u.mobile === userId || u.profileId === userId);
      const searchKeys = user 
        ? [user.email, user.phone, user.mobile, user.profileId].filter(Boolean).map(k => k.toLowerCase()) 
        : [userId.toLowerCase()];

      return notifications.filter(n => {
        const nUser = (n.userId || n.userEmail || "").toLowerCase();
        return searchKeys.includes(nUser);
      });
    } catch (err) {
      console.error("[NotificationService] Failed to retrieve notifications:", err.message);
      return [];
    }
  }
}

// Select providers dynamically based on Environment variables
const emailProvider = new SmtpEmailProvider();

let smsProvider;
const smsProviderType = process.env.SMS_PROVIDER || 'mock';
if (smsProviderType === 'twilio') {
  smsProvider = new TwilioSmsProvider();
} else if (smsProviderType === 'msg91') {
  smsProvider = new Msg91SmsProvider();
} else {
  smsProvider = new MockSmsProvider();
}

const pushProvider = new FcmPushProvider();

export const notificationService = new NotificationService(emailProvider, smsProvider, pushProvider);

