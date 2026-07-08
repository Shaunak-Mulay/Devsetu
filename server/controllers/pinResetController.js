import { dbService } from '../services/dbService.js';
import { notificationService } from '../notifications/notificationService.js';
import { logAuditEvent } from '../services/auditService.js';
import { hashPassword } from '../utils/crypto.js';

export async function getPinResets(req, res) {
  try {
    const pin_reset_requests = await dbService.getCollection('pin_reset_requests') || [];
    res.json(pin_reset_requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch PIN reset requests." });
  }
}

export async function updatePinResetStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body; // pending, in_review, pin_reset, closed

  if (!status || !['pending', 'in_review', 'pin_reset', 'closed'].includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  try {
    const pin_reset_requests = await dbService.getCollection('pin_reset_requests') || [];
    let updatedRequest = null;

    const nextRequests = pin_reset_requests.map(r => {
      if (r.id === id) {
        updatedRequest = { ...r, status };
        return updatedRequest;
      }
      return r;
    });

    if (!updatedRequest) {
      return res.status(404).json({ error: "PIN reset request not found." });
    }

    await dbService.saveCollection('pin_reset_requests', nextRequests);
    
    await logAuditEvent("admin", `PIN Reset Request ${id} status updated to ${status}`);

    res.json(updatedRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update PIN reset request status." });
  }
}

export async function resetPin(req, res) {
  const { id } = req.params;

  try {
    const pin_reset_requests = await dbService.getCollection('pin_reset_requests') || [];
    const requestIndex = pin_reset_requests.findIndex(r => r.id === id);
    if (requestIndex === -1) {
      return res.status(404).json({ error: "PIN reset request not found." });
    }

    const request = pin_reset_requests[requestIndex];
    const { profileId } = request;

    const users = await dbService.getCollection('users') || [];
    const userIndex = users.findIndex(u => u.profileId === profileId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "Astrologer user not found for this profile ID." });
    }

    const user = users[userIndex];

    const tempPin = String(Math.floor(100000 + Math.random() * 900000));
    const { salt, hash } = hashPassword(tempPin);

    user.password = hash;
    user.salt = salt;
    user.sessionVersion = (user.sessionVersion || 1) + 1;
    
    users[userIndex] = user;
    await dbService.saveCollection('users', users);

    request.status = "pin_reset";
    pin_reset_requests[requestIndex] = request;
    await dbService.saveCollection('pin_reset_requests', pin_reset_requests);

    await logAuditEvent(user.email || user.phone, "PIN Reset Completed by Admin");

    await notificationService.sendNotification({
      userId: user.email || user.phone,
      event: "Registration Approved", 
      title: "PIN Reset Completed",
      body: `Your temporary login PIN is: ${tempPin}. Please log in and change your PIN immediately.`,
      relatedProfileId: user.profileId
    });

    res.json({ success: true, tempPin, request, message: "PIN reset successfully. Temporary PIN generated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset PIN." });
  }
}

export async function getAuditLogs(req, res) {
  try {
    const audit_logs = await dbService.getCollection('audit_logs') || [];
    res.json(audit_logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch audit logs." });
  }
}
