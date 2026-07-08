import { dbService } from '../services/dbService.js';
import { SmtpEmailProvider } from './emailProvider.js';
import { MockSmsProvider, TwilioSmsProvider, Msg91SmsProvider } from './smsProvider.js';
import { FcmPushProvider } from './pushProvider.js';
import { EmailService } from '../services/emailService.js';

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

  async orchestrateEmailNotification({ user, userEmail, event, title, body, relatedBookingId, relatedProfileId }) {
    if (!userEmail) return false;
    if (!this.isEmailEnabled()) {
      console.log(`[NotificationService] Email disabled globally. Bypassing email to ${userEmail}.`);
      return true;
    }

    try {
      let emailPromise;
      let booking = null;

      if (relatedBookingId) {
        const bookings = await dbService.getCollection('bookings') || [];
        booking = bookings.find(b => b.id === relatedBookingId);
      }

      if (event === "Registration Submitted") {
        emailPromise = EmailService.sendRegistrationReceivedEmail(userEmail, {
          name: user.name,
          profileId: user.profileId
        });
      } else if (event === "Registration Approved") {
        emailPromise = EmailService.sendRegistrationApprovedEmail(userEmail, {
          name: user.name,
          profileId: user.profileId,
          phone: user.phone || user.mobile
        });
      } else if (event === "Registration Rejected") {
        emailPromise = EmailService.sendRegistrationRejectedEmail(userEmail, {
          name: user.name,
          reason: body
        });
      } else if (event === "Booking Submitted" && booking) {
        if (title && title.includes("Payment")) {
          emailPromise = EmailService.sendPaymentReceivedEmail(userEmail, {
            name: user.name,
            bookingId: booking.id,
            amount: booking.amount || 0,
            txnId: booking.txnId || "N/A"
          });
        } else {
          emailPromise = EmailService.sendBookingConfirmationEmail(userEmail, {
            clientName: user.name,
            bookingId: booking.id,
            packageName: booking.packageName,
            date: booking.date,
            time: booking.time,
            astrologerName: booking.astrologerName
          });
        }
      } else if (event === "Booking Approved" && booking) {
        if (title && title.includes("Verified")) {
          emailPromise = EmailService.sendPaymentVerifiedEmail(userEmail, {
            name: user.name,
            bookingId: booking.id,
            packageName: booking.packageName
          });
        } else {
          emailPromise = EmailService.sendBookingConfirmationEmail(userEmail, {
            clientName: user.name,
            bookingId: booking.id,
            packageName: booking.packageName,
            date: booking.date,
            time: booking.time,
            astrologerName: booking.astrologerName
          });
        }
      } else if (event === "Booking Completed" && booking) {
        emailPromise = EmailService.sendBookingCompletedEmail(userEmail, {
          name: user.name,
          bookingId: booking.id,
          packageName: booking.packageName
        });
      } else if (event === "Admin Chat Message" || event === "Chat Message") {
        emailPromise = EmailService.sendSupportReplyEmail(userEmail, {
          name: user.name,
          ticketId: relatedBookingId || "Support Ticket",
          message: body
        });
      } else {
        // Fallback to generic template
        emailPromise = EmailService.sendGenericNotification(userEmail, title, body);
      }

      return await emailPromise;
    } catch (err) {
      console.error(`[NotificationService] Error orchestrating email to ${userEmail}:`, err.message);
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
      const notifications = await dbService.getCollection('notifications') || [];
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
      await dbService.saveCollection('notifications', notifications);
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
      const users = await dbService.getCollection('users') || [];
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
        this.orchestrateEmailNotification({ user, userEmail, event, title, body, relatedBookingId, relatedProfileId }).catch(e => console.error("Async email error:", e));
        results.email = "Sent";
      } else if (channels.includes("email")) {
        results.email = "Bypassed (No Email/Pref)";
      }

      // 3. Push Notification
      if (channels.includes("push") && prefs.push !== false) {
        if (deviceToken) {
          this.sendPushNotification(deviceToken, title, body, {
            type: category,
            relatedBookingId,
            relatedProfileId
          }).catch(e => console.error("Async push error:", e));
          results.push = "Sent";
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
          this.sendSMS(userPhone, `${title}\n\n${body}`).catch(e => console.error("Async SMS error:", e));
          results.sms = "Sent";
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
      const notifications = await dbService.getCollection('notifications') || [];
      // If it wasn't added in in-app block, add a system delivery record
      if (!channels.includes("in-app")) {
        notifications.unshift(historyLog);
        await dbService.saveCollection('notifications', notifications);
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
      const users = await dbService.getCollection('users') || [];
      let recipients = [];

      if (targetUserIds && targetUserIds.length > 0) {
        recipients = users.filter(u => targetUserIds.includes(u.profileId) || targetUserIds.includes(u.email) || targetUserIds.includes(u.phone));
      } else if (targetRole) {
        recipients = users.filter(u => u.role === targetRole);
      } else {
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
      const notifications = await dbService.getCollection('notifications') || [];
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
      await dbService.saveCollection('notifications', updated);
      return { success: true, count };
    } catch (err) {
      console.error("[NotificationService] Failed to mark read:", err.message);
      return { success: false, error: err.message };
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      const notifications = await dbService.getCollection('notifications') || [];
      const filtered = notifications.filter(n => {
        const matchUser = n.userId === userId || n.userEmail === userId;
        const matchId = notificationId === 'all' || n.id === notificationId || n.notificationId === notificationId;
        return !(matchUser && matchId);
      });
      await dbService.saveCollection('notifications', filtered);
      return { success: true };
    } catch (err) {
      console.error("[NotificationService] Failed to delete notification:", err.message);
      return { success: false, error: err.message };
    }
  }

  async getNotificationHistory(userId) {
    try {
      const notifications = await dbService.getCollection('notifications') || [];
      if (userId === 'admin') {
        return notifications;
      }
      const users = await dbService.getCollection('users') || [];
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
