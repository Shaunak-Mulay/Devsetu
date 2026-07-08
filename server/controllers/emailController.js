import { EmailService } from '../services/emailService.js';
import { dbService } from '../services/dbService.js';

export async function getEmailLogs(req, res) {
  try {
    const logs = await dbService.getCollection('email_logs') || [];
    res.status(200).json(logs);
  } catch (err) {
    console.error('[EmailController] Failed to retrieve email logs:', err.message);
    res.status(500).json({ error: "Failed to retrieve email logs." });
  }
}

export async function resendEmailLog(req, res) {
  const { id } = req.params;
  try {
    const success = await EmailService.resendEmail(id);
    if (success) {
      res.status(200).json({ success: true, message: "Email resent successfully." });
    } else {
      res.status(400).json({ error: "Failed to resend email." });
    }
  } catch (err) {
    console.error('[EmailController] Resend error:', err.message);
    res.status(500).json({ error: err.message || "Failed to resend email." });
  }
}

export async function getSmtpHealth(req, res) {
  try {
    const health = await EmailService.checkHealth();
    res.status(200).json(health);
  } catch (err) {
    console.error('[EmailController] Health check error:', err.message);
    res.status(500).json({ status: 'unhealthy', message: err.message });
  }
}

export async function sendTestEmail(req, res) {
  const { to } = req.body;
  if (!to) {
    return res.status(400).json({ error: "Recipient email is required." });
  }
  try {
    const success = await EmailService.sendGenericNotification(
      to,
      "DEVSETU SMTP Test Email",
      "Namaste!<br><br>This is a successful SMTP test verification message from the <strong>DEVSETU Connect</strong> admin settings dashboard.<br><br>All system relays are active and healthy. 🕉️"
    );
    if (success) {
      res.status(200).json({ success: true, message: `Test email successfully dispatched to ${to}.` });
    } else {
      res.status(500).json({ error: "Failed to dispatch test email. Check server log for transporter error details." });
    }
  } catch (err) {
    console.error('[EmailController] Test email failed:', err.message);
    res.status(500).json({ error: err.message || "Failed to dispatch test email." });
  }
}

export async function getSmtpSettings(req, res) {
  try {
    const settings = await dbService.getCollection('settings') || [];
    let emailSetting = settings.find(s => s.id === 'email_settings');
    if (!emailSetting) {
      emailSetting = { id: 'email_settings', enabled: EmailService.isEmailEnabled() };
    }
    res.status(200).json(emailSetting);
  } catch (err) {
    console.error('[EmailController] Get settings error:', err.message);
    res.status(500).json({ error: "Failed to load notification settings." });
  }
}

export async function updateSmtpSettings(req, res) {
  const { enabled } = req.body;
  if (enabled === undefined) {
    return res.status(400).json({ error: "enabled field is required." });
  }
  try {
    const settings = await dbService.getCollection('settings') || [];
    const idx = settings.findIndex(s => s.id === 'email_settings');
    const updateObj = { id: 'email_settings', enabled: !!enabled };

    if (idx !== -1) {
      settings[idx] = updateObj;
    } else {
      settings.push(updateObj);
    }
    await dbService.saveCollection('settings', settings);

    // Apply value to config memory cache directly
    process.env.EMAIL_ENABLED = enabled ? 'true' : 'false';

    res.status(200).json({ success: true, enabled: !!enabled });
  } catch (err) {
    console.error('[EmailController] Update settings error:', err.message);
    res.status(500).json({ error: "Failed to update notification settings." });
  }
}
