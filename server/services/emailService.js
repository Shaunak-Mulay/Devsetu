import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import { dbService } from './dbService.js';

class EmailServiceClass {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    const { host, port, user, pass } = config.smtp;
    if (host && port && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          connectionTimeout: 8000,
          greetingTimeout: 8000,
          socketTimeout: 8000
        });
        console.log('[EmailService] Nodemailer SMTP transporter initialized successfully.');
      } catch (err) {
        console.error('[EmailService] Failed to initialize Nodemailer transporter:', err.message);
      }
    } else {
      console.log('[EmailService] SMTP credentials missing in configuration. Emails will be logged and bypassed.');
    }
  }

  isEmailEnabled() {
    return config.smtp.emailEnabled;
  }

  async checkHealth() {
    if (!this.transporter) {
      return { status: 'unconfigured', message: 'SMTP credentials missing' };
    }
    try {
      await this.transporter.verify();
      return { status: 'healthy', message: 'SMTP server is responding successfully' };
    } catch (err) {
      console.error('[EmailService] Health check failed:', err.message);
      return { status: 'unhealthy', message: err.message };
    }
  }

  async logEmail(recipient, templateName, subject, html, text, status, errorMessage = null) {
    try {
      const logs = await dbService.getCollection('email_logs') || [];
      const newLog = {
        id: "EML-" + Math.floor(100000 + Math.random() * 900000),
        recipient,
        template: templateName,
        subject,
        html,
        text,
        createdAt: new Date().toISOString(),
        status, // 'sent' or 'failed'
        errorMessage
      };
      logs.unshift(newLog);
      // Cap log size to 200 logs
      if (logs.length > 200) {
        logs.pop();
      }
      await dbService.saveCollection('email_logs', logs);
      console.log(`[Email Log Stored] ${newLog.id} to ${recipient} status: ${status}`);
      return newLog;
    } catch (err) {
      console.error("[EmailService] Failed to save email log:", err.message);
      return null;
    }
  }

  async sendMailDirect(to, subject, html, text, templateName) {
    const from = `${config.smtp.fromName} <${config.smtp.fromEmail}>`;

    console.log(`\n================== [SMTP EMAIL DISPATCH] ==================`);
    console.log(`[EMAIL SENDING] To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Template: ${templateName}`);
    console.log(`===========================================================\n`);

    if (!this.isEmailEnabled()) {
      console.log(`[EmailService] Email disabled globally. Bypassing email to ${to}.`);
      await this.logEmail(to, templateName, subject, html, text, 'sent', 'Bypassed (Globally Disabled)');
      return true;
    }

    if (!this.transporter) {
      console.log(`[EmailService] Transporter not configured. Bypassing email to ${to}.`);
      await this.logEmail(to, templateName, subject, html, text, 'failed', 'transporter not configured');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
        text
      });
      console.log(`[EmailService] Email successfully sent to ${to}. MessageID: ${info.messageId}`);
      await this.logEmail(to, templateName, subject, html, text, 'sent');
      return true;
    } catch (err) {
      console.error(`[EmailService] Failed to send email to ${to}:`, err.message);
      await this.logEmail(to, templateName, subject, html, text, 'failed', err.message);
      return false;
    }
  }

  async resendEmail(logId) {
    try {
      const logs = await dbService.getCollection('email_logs') || [];
      const logIdx = logs.findIndex(l => l.id === logId);
      if (logIdx === -1) {
        throw new Error("Email log record not found.");
      }

      const log = logs[logIdx];
      const from = `${config.smtp.fromName} <${config.smtp.fromEmail}>`;

      if (!this.transporter) {
        throw new Error("Transporter not configured.");
      }

      console.log(`[EmailService] Resending log ${logId} to ${log.recipient}...`);
      const info = await this.transporter.sendMail({
        from,
        to: log.recipient,
        subject: log.subject,
        html: log.html,
        text: log.text
      });

      // Update log status to sent
      logs[logIdx].status = 'sent';
      logs[logIdx].errorMessage = null;
      logs[logIdx].createdAt = new Date().toISOString(); // update timestamp on resend success
      await dbService.saveCollection('email_logs', logs);
      console.log(`[EmailService] Log ${logId} resent successfully. MessageID: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error(`[EmailService] Resend failed for log ${logId}:`, err.message);
      // Update log error message
      const logs = await dbService.getCollection('email_logs') || [];
      const logIdx = logs.findIndex(l => l.id === logId);
      if (logIdx !== -1) {
        logs[logIdx].status = 'failed';
        logs[logIdx].errorMessage = err.message;
        await dbService.saveCollection('email_logs', logs);
      }
      throw err;
    }
  }

  getBaseHtmlTemplate(title, innerContent) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f7f2ed;
      margin: 0;
      padding: 0;
      color: #2b1b12;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border: 2px solid #d4af37;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    .header {
      background-color: #2b1b12;
      padding: 24px;
      text-align: center;
      border-bottom: 3px solid #d4af37;
    }
    .header h2 {
      color: #d4af37;
      margin: 0;
      font-size: 24px;
      letter-spacing: 1px;
      font-weight: bold;
    }
    .content {
      padding: 30px;
      line-height: 1.6;
      font-size: 16px;
    }
    .content h1 {
      font-size: 22px;
      color: #2b1b12;
      margin-top: 0;
      font-weight: bold;
      border-bottom: 1px solid #f0e6df;
      padding-bottom: 10px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed #f0e6df;
      padding: 8px 0;
      font-size: 14px;
    }
    .detail-row strong {
      color: #8c7365;
    }
    .badge {
      display: inline-block;
      background-color: #fff6e9;
      border: 1px solid #e67e22;
      color: #e67e22;
      padding: 6px 12px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 13px;
      margin: 12px 0;
    }
    .footer {
      background-color: #fff6e9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #8c7365;
      border-top: 1px solid #f0e6df;
    }
    .footer a {
      color: #e67e22;
      text-decoration: none;
    }
    .button {
      display: inline-block;
      background-color: #2b1b12;
      color: #ffffff !important;
      padding: 12px 24px;
      border-radius: 28px;
      text-decoration: none;
      font-weight: bold;
      margin: 20px 0;
      border: 1.5px solid #d4af37;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>DEVSETU CONNECT</h2>
    </div>
    <div class="content">
      ${innerContent}
    </div>
    <div class="footer">
      <p>This is an automated notification from <strong>DEVSETU Connect</strong>.</p>
      <p>For support, please call <strong>+91 80 4709 6888</strong> or email <a href="mailto:support@devsetu.com">support@devsetu.com</a>.</p>
      <p>&copy; 2026 Devsetu Spiritual Services. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
  }

  // --- HTML Email Dispatch Methods ---

  async sendRegistrationReceivedEmail(to, data) {
    const title = "Welcome to DEVSETU Connect";
    const name = data.name || "Shastri Ji";
    const profileId = data.profileId || "N/A";

    const content = `
      <h1>Registration Received</h1>
      <p>Namaste <strong>${name}</strong>,</p>
      <p>Thank you for registering as a partner on <strong>DEVSETU Connect</strong>. We are thrilled to welcome you to our professional spiritual community.</p>
      <p>Your application is currently under administrator verification. Our team will review your submitted credentials and specialization documents shortly.</p>
      <div class="badge">Status: Pending Verification</div>
      <div class="detail-row">
        <strong>Profile ID:</strong>
        <span><strong>${profileId}</strong></span>
      </div>
      <p>We will notify you immediately via email once your registration status is updated. If you have any urgent queries, please do not hesitate to contact our admin support desk.</p>
    `;
    const text = `Namaste ${name},\n\nThank you for registering on DEVSETU Connect. Your application is currently under admin verification.\n\nProfile ID: ${profileId}\n\nSupport: +91 80 4709 6888 / support@devsetu.com`;
    return this.sendMailDirect(to, title, this.getBaseHtmlTemplate(title, content), text, 'registration_received');
  }

  async sendRegistrationApprovedEmail(to, data) {
    const title = "Your DEVSETU Registration has been Approved";
    const name = data.name || "Shastri Ji";
    const profileId = data.profileId || "N/A";
    const phone = data.phone || "N/A";

    const content = `
      <h1>Account Approved!</h1>
      <p>Namaste <strong>${name}</strong>,</p>
      <p>Congratulations! Your registration with <strong>DEVSETU Connect</strong> has been approved by the administrator. Your professional partner account is now fully active.</p>
      <div class="badge" style="border-color:#2e7d32; color:#2e7d32; background-color:#e8f5e9;">Status: Active & Verified</div>
      
      <h3>Your Login Details:</h3>
      <div class="detail-row">
        <strong>Profile ID:</strong>
        <span>${profileId}</span>
      </div>
      <div class="detail-row">
        <strong>Registered Mobile:</strong>
        <span>${phone}</span>
      </div>
      
      <p style="background-color:#fff9c4; padding:12px; border-radius:8px; font-size:14px; border:1px solid #ffe082;">
        <strong>🔑 Login Reminder:</strong> To log in to the DEVSETU Mobile App, enter your registered <strong>Mobile Number</strong> and your <strong>6-digit secure login PIN</strong>.
      </p>
      <p>Welcome aboard! You can now start receiving pooja bookings, managing your schedule, and interacting with customers.</p>
    `;
    const text = `Congratulations ${name}! Your DEVSETU registration has been approved.\n\nProfile ID: ${profileId}\nRegistered Mobile: ${phone}\n\nLogin using your Mobile Number + your 6-digit secure PIN.`;
    return this.sendMailDirect(to, title, this.getBaseHtmlTemplate(title, content), text, 'registration_approved');
  }

  async sendRegistrationRejectedEmail(to, data) {
    const title = "DEVSETU Registration Update";
    const name = data.name || "Shastri Ji";
    const reason = data.reason || "Documents submitted could not be verified.";

    const content = `
      <h1>Registration Status Update</h1>
      <p>Namaste <strong>${name}</strong>,</p>
      <p>Thank you for your interest in partnering with <strong>DEVSETU Connect</strong>.</p>
      <p>We regret to inform you that your registration request could not be approved at this time.</p>
      <div class="badge" style="border-color:#c62828; color:#c62828; background-color:#ffebee;">Status: Not Approved</div>
      
      <div style="background-color:#fafafa; border:1px solid #e0e0e0; padding:15px; border-radius:8px; margin:15px 0; font-size:14px;">
        <strong>Reason for rejection:</strong><br>
        ${reason}
      </div>
      
      <p>If you believe this decision was made in error or wish to submit additional verification documents, please reach out to our partner support desk directly.</p>
    `;
    const text = `Namaste ${name},\n\nWe regret to inform you that your DEVSETU registration request could not be approved at this time.\n\nReason: ${reason}\n\nSupport: support@devsetu.com`;
    return this.sendMailDirect(to, title, this.getBaseHtmlTemplate(title, content), text, 'registration_rejected');
  }

  async sendBookingConfirmationEmail(to, data) {
    const title = "DEVSETU Booking Confirmation";
    const clientName = data.clientName || "Client";
    const bookingId = data.bookingId || "N/A";
    const packageName = data.packageName || "Vedic Ritual";
    const date = data.date || "N/A";
    const time = data.time || "N/A";
    const astrologerName = data.astrologerName || "Unassigned";

    const content = `
      <h1>Booking Confirmed</h1>
      <p>Namaste <strong>${clientName}</strong>,</p>
      <p>Your pooja booking request on <strong>DEVSETU Connect</strong> has been successfully confirmed. A dedicated priest has been assigned to perform your sacred rituals.</p>
      
      <h3>Booking Summary:</h3>
      <div class="detail-row">
        <strong>Booking ID:</strong>
        <span><strong>${bookingId}</strong></span>
      </div>
      <div class="detail-row">
        <strong>Pooja Name:</strong>
        <span>${packageName}</span>
      </div>
      <div class="detail-row">
        <strong>Date:</strong>
        <span>${date}</span>
      </div>
      <div class="detail-row">
        <strong>Time:</strong>
        <span>${time}</span>
      </div>
      <div class="detail-row">
        <strong>Assigned Pandit:</strong>
        <span>${astrologerName}</span>
      </div>
      
      <p>Thank you for choosing DEVSETU. We look forward to facilitating a divine and seamless experience for you.</p>
    `;
    const text = `Namaste ${clientName},\n\nYour pooja booking is confirmed!\n\nBooking ID: ${bookingId}\nPooja: ${packageName}\nDate: ${date}\nTime: ${time}\nAssigned Pandit: ${astrologerName}`;
    return this.sendMailDirect(to, `Booking Confirmation: ${packageName}`, this.getBaseHtmlTemplate(title, content), text, 'booking_confirmed');
  }

  async sendPaymentReceivedEmail(to, data) {
    const title = "Payment Proof Received";
    const name = data.name || "Client";
    const bookingId = data.bookingId || "N/A";
    const amount = data.amount || 0;
    const txnId = data.txnId || "N/A";

    const content = `
      <h1>Payment Proof Received</h1>
      <p>Namaste <strong>${name}</strong>,</p>
      <p>We have successfully received your payment transaction proof for booking <strong>${bookingId}</strong>.</p>
      
      <div style="background-color:#eef8ff; border:1px solid #b3e5fc; padding:12px; border-radius:8px; font-size:14px; margin:15px 0;">
        <strong>Transaction details are under administrator verification.</strong>
      </div>
      
      <div class="detail-row">
        <strong>UTR / Transaction Ref:</strong>
        <span>${txnId}</span>
      </div>
      <div class="detail-row">
        <strong>Amount Paid (Advance):</strong>
        <span>₹${amount.toLocaleString()}</span>
      </div>
      
      <p>Once our finance team verifies the transaction, your booking will be officially activated. You will receive a confirmation email shortly.</p>
    `;
    const text = `Namaste ${name},\n\nWe have received your payment proof for booking ${bookingId}.\n\nTxn ID: ${txnId}\nAmount: ₹${amount.toLocaleString()}\n\nThis is currently awaiting administrator verification.`;
    return this.sendMailDirect(to, title, this.getBaseHtmlTemplate(title, content), text, 'payment_received');
  }

  async sendPaymentVerifiedEmail(to, data) {
    const title = "Payment Verified & Booking Active";
    const name = data.name || "Client";
    const bookingId = data.bookingId || "N/A";
    const packageName = data.packageName || "Pooja";

    const content = `
      <h1>Payment Successfully Verified</h1>
      <p>Namaste <strong>${name}</strong>,</p>
      <p>Your payment transaction for booking <strong>${bookingId}</strong> has been successfully verified by our administrator.</p>
      <div class="badge" style="border-color:#2e7d32; color:#2e7d32; background-color:#e8f5e9;">Payment Status: Verified</div>
      <p>Your sacred ritual <strong>${packageName}</strong> is now officially scheduled and confirmed on our calendars.</p>
      <p>Our coordinator will connect with you soon to share setup details and virtual join link options.</p>
    `;
    const text = `Namaste ${name},\n\nYour payment for booking ${bookingId} has been verified successfully. Your booking for ${packageName} is now confirmed.`;
    return this.sendMailDirect(to, title, this.getBaseHtmlTemplate(title, content), text, 'payment_verified');
  }

  async sendBookingCompletedEmail(to, data) {
    const title = "DEVSETU Pooja Completed";
    const name = data.name || "Client";
    const bookingId = data.bookingId || "N/A";
    const packageName = data.packageName || "Ritual";

    const content = `
      <h1>Sacred Ritual Completed</h1>
      <p>Namaste <strong>${name}</strong>,</p>
      <p>We are pleased to inform you that your booking <strong>${bookingId}</strong> for <strong>${packageName}</strong> has been completed successfully.</p>
      <p>We hope the divine rituals bring health, prosperity, and peace to you and your family.</p>
      
      <p style="text-align:center; margin:30px 0;">
        <a href="https://devsetu.in/feedback?bookingId=${bookingId}" class="button">Submit Feedback & Blessings</a>
      </p>
      <p>Your feedback helps us maintain the highest standard of sacred ceremonies. Thank you for choosing DEVSETU.</p>
    `;
    const text = `Namaste ${name},\n\nYour pooja for ${packageName} (Booking: ${bookingId}) is now completed. We hope the ritual brings you peace and blessings.\n\nPlease submit your feedback here: https://devsetu.in/feedback?bookingId=${bookingId}`;
    return this.sendMailDirect(to, title, this.getBaseHtmlTemplate(title, content), text, 'booking_completed');
  }

  async sendSupportReplyEmail(to, data) {
    const title = "Response to Your DEVSETU Support Query";
    const name = data.name || "Valued Partner";
    const ticketId = data.ticketId || "N/A";
    const message = data.message || "";
    const originalQuery = data.originalQuery || "";

    const content = `
      <h1>Support Desk Response</h1>
      <p>Namaste <strong>${name}</strong>,</p>
      <p>Our DEVSETU administrator has replied to your open support ticket <strong>${ticketId}</strong>.</p>
      
      <div style="background-color:#f5f5f5; border-left:4px solid #d4af37; padding:15px; margin:20px 0; border-radius:4px; font-size:14px; color:#333;">
        <strong>Administrator Response:</strong><br>
        ${message}
      </div>
      
      ${originalQuery ? `
      <div style="font-size:12px; color:#8c7365; margin-top:20px; border-top:1px solid #eee; paddingTop:10px;">
        <strong>Your Original Ticket Details:</strong><br>
        "${originalQuery}"
      </div>
      ` : ''}
      
      <p>You can also log in to the DEVSETU Mobile App to view this support conversation or reply directly in the chat.</p>
    `;
    const text = `Namaste ${name},\n\nAn administrator has replied to your support ticket ${ticketId}.\n\nReply: ${message}`;
    return this.sendMailDirect(to, `Support Ticket ${ticketId} Update`, this.getBaseHtmlTemplate(title, content), text, 'support_reply');
  }

  async sendGenericNotification(to, subject, body) {
    const content = `
      <h1>Devsetu Alert Notification</h1>
      <p>Namaste,</p>
      <div style="line-height:1.6; font-size:15px;">
        ${body}
      </div>
    `;
    return this.sendMailDirect(to, subject, this.getBaseHtmlTemplate(subject, content), body, 'generic');
  }
}

export const EmailService = new EmailServiceClass();
