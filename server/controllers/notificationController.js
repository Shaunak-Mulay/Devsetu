import { dbService } from '../services/dbService.js';
import { notificationService } from '../notifications/notificationService.js';

export async function getNotifications(req, res) {
  const { email } = req.query;
  try {
    if (email) {
      const history = await notificationService.getNotificationHistory(email);
      res.json(history);
    } else {
      const history = await notificationService.getNotificationHistory('admin');
      res.json(history);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve notifications." });
  }
}

export async function clearNotifications(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }
  try {
    await notificationService.markAsRead('all', email);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to clear notifications." });
  }
}

export async function markRead(req, res) {
  const { email, notificationId } = req.body;
  if (!email || !notificationId) {
    return res.status(400).json({ error: "Email and notificationId are required." });
  }
  try {
    await notificationService.markAsRead(notificationId, email);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark notification as read." });
  }
}

export async function deleteNotification(req, res) {
  const { id } = req.params;
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email/Mobile query parameter is required." });
  }
  try {
    await notificationService.deleteNotification(id, email);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete notification." });
  }
}

export async function registerToken(req, res) {
  const { email, deviceToken } = req.body;
  if (!email || !deviceToken) {
    return res.status(400).json({ error: "Email/Mobile and deviceToken are required." });
  }
  try {
    const users = await dbService.getCollection('users') || [];
    const userIndex = users.findIndex(u => (u.email && u.email.toLowerCase() === email.toLowerCase()) || u.phone === email || u.mobile === email || u.profileId === email);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found." });
    }
    users[userIndex].deviceToken = deviceToken;
    await dbService.saveCollection('users', users);
    console.log(`[Push Token Registered] for user ${email}: ${deviceToken}`);
    res.json({ success: true, message: "Device token registered successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register push token." });
  }
}

export async function updatePrefs(req, res) {
  const { email, preferences } = req.body;
  if (!email || !preferences) {
    return res.status(400).json({ error: "Email/Mobile and preferences are required." });
  }
  try {
    const users = await dbService.getCollection('users') || [];
    const userIndex = users.findIndex(u => (u.email && u.email.toLowerCase() === email.toLowerCase()) || u.phone === email || u.mobile === email || u.profileId === email);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found." });
    }
    users[userIndex].notificationPreferences = preferences;
    await dbService.saveCollection('users', users);
    console.log(`[Preferences Updated] for user ${email}:`, preferences);
    res.json({ success: true, preferences: users[userIndex].notificationPreferences });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update notification preferences." });
  }
}

export async function broadcast(req, res) {
  const { adminId, targetRole, targetUserIds, title, body, type } = req.body;
  if (!adminId || !title || !body) {
    return res.status(400).json({ error: "adminId, title, and body are required." });
  }
  try {
    const result = await notificationService.broadcastNotification(adminId, { targetRole, targetUserIds, title, body, type });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to broadcast notification." });
  }
}

export async function adminHistory(req, res) {
  try {
    const history = await notificationService.getNotificationHistory('admin');
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve history." });
  }
}

export async function resendNotification(req, res) {
  const { notificationId } = req.body;
  if (!notificationId) {
    return res.status(400).json({ error: "notificationId is required." });
  }
  try {
    const notifications = await dbService.getCollection('notifications') || [];
    const notif = notifications.find(n => n.id === notificationId || n.notificationId === notificationId);
    if (!notif) {
      return res.status(404).json({ error: "Notification record not found." });
    }
    const result = await notificationService.sendNotification({
      userId: notif.userId || notif.userEmail,
      event: notif.type === 'registration' ? 'Registration Approved' : 'Booking Approved',
      title: notif.title,
      body: notif.message || notif.body,
      relatedBookingId: notif.relatedBookingId,
      relatedProfileId: notif.relatedProfileId
    });
    res.json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to resend notification." });
  }
}
