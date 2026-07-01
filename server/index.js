import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { database } from './database.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Twilio client if keys exist in environment
let twilioClient = null;
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
  try {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.log('[SMS Gateway] Twilio client initialized successfully.');
  } catch (err) {
    console.error('[SMS Gateway] Failed to initialize Twilio client:', err.message);
  }
} else {
  console.log('[SMS Gateway] Twilio credentials missing in env. SMS will be logged to mock outbox.');
}

// Initialize Nodemailer SMTP transporter if config exists in environment
let emailTransporter = null;
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM) {
  try {
    emailTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: parseInt(SMTP_PORT, 10) === 465, // true for port 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
    console.log('[Email Gateway] Nodemailer SMTP transporter initialized successfully.');
  } catch (err) {
    console.error('[Email Gateway] Failed to initialize SMTP transporter:', err.message);
  }
} else {
  console.log('[Email Gateway] SMTP credentials missing in env. Emails will be logged to mock outbox.');
}

// Enable CORS for frontend requests
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Support base64 image uploads

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Password Hashing Helpers
function hashPassword(password, salt) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, storedPassword, storedSalt) {
  if (!storedSalt) {
    // Plaintext fallback for legacy/seeded database items
    return password === storedPassword;
  }
  const hash = crypto.pbkdf2Sync(password, storedSalt, 1000, 64, 'sha512').toString('hex');
  return hash === storedPassword;
}

// Audit Logger Helper
async function logAuditEvent(userId, event) {
  try {
    const audit_logs = await database.getCollection('audit_logs');
    const newLog = {
      id: "AUD-" + Math.floor(100000 + Math.random() * 900000),
      userId,
      event,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      timestamp: new Date().toISOString()
    };
    audit_logs.unshift(newLog);
    await database.saveCollection('audit_logs', audit_logs);
    console.log(`[AUDIT LOG] ${event} recorded for ${userId}`);
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

// Password Validation
function isValidPassword(password) {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]).{8,}$/;
  return re.test(password);
}

// Real SMS Delivery helper (Twilio)
async function sendRealSMS(to, body) {
  if (!twilioClient) {
    console.log(`[SMS Gateway] Twilio client not configured. SMS to ${to} bypassed.`);
    return false;
  }
  try {
    // Standardize to E.164 if simple digits are passed
    let formattedTo = to.trim();
    if (!formattedTo.startsWith('+')) {
      // Default to India (+91) if it is a 10-digit number
      if (formattedTo.length === 10) {
        formattedTo = '+91' + formattedTo;
      } else {
        formattedTo = '+' + formattedTo;
      }
    }
    const message = await twilioClient.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER,
      to: formattedTo
    });
    console.log(`[SMS Gateway] SMS successfully sent via Twilio to ${formattedTo}. SID: ${message.sid}`);
    return true;
  } catch (err) {
    console.error(`[SMS Gateway] Failed to send SMS via Twilio to ${to}:`, err.message);
    return false;
  }
}

// Real Email Delivery helper (Nodemailer SMTP)
async function sendRealEmail(to, subject, text) {
  if (!emailTransporter) {
    console.log(`[Email Gateway] SMTP transporter not configured. Email to ${to} bypassed.`);
    return false;
  }
  try {
    const info = await emailTransporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      text
    });
    console.log(`[Email Gateway] Email successfully sent via SMTP to ${to}. MessageID: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`[Email Gateway] Failed to send Email via SMTP to ${to}:`, err.message);
    return false;
  }
}

// Outbox Helper to store mock SMS and Email dispatches for real-time client consumption
async function sendMockMessage(type, recipient, subject, message) {
  try {
    const outbox = await database.getCollection('mock_outbox') || [];
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
    // Keep outbox size reasonable (last 50 messages)
    if (outbox.length > 50) {
      outbox.pop();
    }
    await database.saveCollection('mock_outbox', outbox);
    console.log(`[OUTBOX STORED] Mock ${type} to ${recipient}`);

    // Trigger real deliveries asynchronously in the background (non-blocking)
    if (type === 'sms') {
      sendRealSMS(recipient, message).catch(err => console.error("Async SMS send error:", err));
    } else if (type === 'email') {
      sendRealEmail(recipient, subject, message).catch(err => console.error("Async Email send error:", err));
    }
  } catch (err) {
    console.error("Failed to save mock message to outbox:", err);
  }
}


// Authentication Routes
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, phone, password, state, city, experience } = req.body;
  if (!name || !email || !phone || !password || !state || !city || !experience) {
    return res.status(400).json({ error: "Missing required registration parameters." });
  }

  try {
    const users = await database.getCollection('users');
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase() || u.phone === phone);
    if (exists) {
      return res.status(400).json({ error: "Account already exists with this email or mobile number." });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character." });
    }

    // Generate unique profileId sequentially (format: DEV-AST-XXXXX)
    let maxId = 0;
    users.forEach(u => {
      if (u.profileId && u.profileId.startsWith('DEV-AST-')) {
        const num = parseInt(u.profileId.replace('DEV-AST-', ''), 10);
        if (!isNaN(num) && num > maxId) {
          maxId = num;
        }
      }
    });
    const nextId = String(maxId + 1).padStart(5, '0');
    const profileId = `DEV-AST-${nextId}`;

    const { salt, hash } = hashPassword(password);

    const newUser = { 
      profileId, 
      name, 
      email, 
      phone, 
      password: hash, 
      salt,
      state, 
      city, 
      experience,
      accountStatus: "pending",
      sessionVersion: 1,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    await database.saveCollection('users', users);
    
    // Log SMS and Email dispatch for Registration
    console.log(`\n================== [NOTIFICATION OUTBOX] ==================`);
    console.log(`[SMS SENDING] To ${phone}:\nDEVSETU CONNECT\n\nRegistration received.\n\nProfile ID:\n${profileId}\n\nStatus:\nPending Verification\n\nYou will be notified after approval.`);
    console.log(`[EMAIL SENDING] To ${email}`);
    console.log(`Subject: Welcome to DEVSETU CONNECT`);
    console.log(`Message:\nDear ${name},\n\nThank you for registering with DEVSETU CONNECT.\n\nYour registration request has been received.\n\nYour Profile ID:\n\n${profileId}\n\nCurrent Status:\nPending Verification\n\nYou will receive another notification once your account is approved.\n\nRegards,\nDEVSETU CONNECT Team`);
    console.log(`===========================================================\n`);

    await sendMockMessage('sms', phone, 'Registration Received', `DEVSETU CONNECT\n\nRegistration received.\n\nProfile ID:\n${profileId}\n\nStatus:\nPending Verification\n\nYou will be notified after approval.`);
    await sendMockMessage('email', email, 'Welcome to DEVSETU CONNECT', `Dear ${name},\n\nThank you for registering with DEVSETU CONNECT.\n\nYour registration request has been received.\n\nYour Profile ID:\n\n${profileId}\n\nCurrent Status:\nPending Verification\n\nYou will receive another notification once your account is approved.\n\nRegards,\nDEVSETU CONNECT Team`);

    // Add registration welcome notification
    const notifications = await database.getCollection('notifications');
    const newNotif = {
      id: "NT-" + Math.floor(10000 + Math.random() * 90000),
      userEmail: email,
      title: "Welcome to DEVSETU CONNECT",
      body: `Welcome ${name}. Your registration request has been received under Profile ID: ${profileId}. Status: Pending Verification.`,
      type: "info",
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    await database.saveCollection('notifications', notifications);

    res.status(201).json({ user: { profileId, name, email, phone, state, city, experience, accountStatus: "pending", sessionVersion: 1 } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to sign up user." });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { loginFormType, email, phone, password } = req.body;
  const targetVal = loginFormType === 'email' ? email : phone;
  
  if (!targetVal || !password) {
    return res.status(400).json({ error: "Credentials and password are required." });
  }

  try {
    const users = await database.getCollection('users');
    const user = users.find(u => {
      const checkVal = loginFormType === 'email' ? u.email : u.phone;
      return checkVal.trim().toLowerCase() === targetVal.trim().toLowerCase();
    });

    if (user && verifyPassword(password, user.password, user.salt)) {
      if (user.accountStatus !== "approved") {
        return res.status(403).json({ 
          error: "Your account is under verification.",
          profileId: user.profileId || "PENDING",
          accountStatus: user.accountStatus || "pending"
        });
      }
      res.json({
        user: {
          profileId: user.profileId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          state: user.state || "Maharashtra",
          city: user.city || "Pune",
          experience: user.experience || "5 Years",
          accountStatus: user.accountStatus,
          sessionVersion: user.sessionVersion || 1
        }
      });
    } else {
      res.status(401).json({ error: "Invalid username or password credentials." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to login user." });
  }
});

// Request OTP for Login (Auto-authentication/verification flow)
app.post('/api/auth/login-otp/request', async (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) {
    return res.status(400).json({ error: "Email or mobile number is required." });
  }

  try {
    const users = await database.getCollection('users');
    const user = users.find(u => {
      if (email) return u.email.toLowerCase() === email.toLowerCase();
      if (phone) return u.phone === phone;
      return false;
    });

    if (!user) {
      return res.status(404).json({ error: "No account registered with this identity." });
    }

    const targetEmail = user.email;
    const targetPhone = user.phone;

    // Generate secure 6-digit verification code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes valid

    const otps = await database.getCollection('otps');
    const filteredOtps = otps.filter(o => o.email.toLowerCase() !== targetEmail.toLowerCase());
    filteredOtps.push({
      email: targetEmail.toLowerCase(),
      code,
      expiresAt,
      attempts: 0
    });
    await database.saveCollection('otps', filteredOtps);

    await logAuditEvent(targetEmail, "Login OTP Request");

    // Send mock notifications (Email & SMS)
    console.log(`\n================== [NOTIFICATION OUTBOX] ==================`);
    console.log(`[SMS SENDING] To ${targetPhone}:\nDEVSETU CONNECT\n\nYour login verification OTP is:\n\n${code}\n\nValid for 10 minutes.`);
    console.log(`[EMAIL SENDING] To ${targetEmail}`);
    console.log(`Subject: DEVSETU CONNECT Login Verification Code`);
    console.log(`Message:\nDear User,\n\nYour login verification OTP is:\n\n${code}\n\nValid for 10 minutes.\n\nRegards,\nDEVSETU CONNECT Team`);
    console.log(`===========================================================\n`);

    await sendMockMessage('sms', targetPhone, 'Login OTP Code', `DEVSETU CONNECT\n\nYour login verification OTP is:\n\n${code}\n\nValid for 10 minutes.`);
    await sendMockMessage('email', targetEmail, 'DEVSETU CONNECT Login Verification Code', `Dear User,\n\nYour login verification OTP is:\n\n${code}\n\nValid for 10 minutes.\n\nRegards,\nDEVSETU CONNECT Team`);

    res.json({ success: true, email: targetEmail, message: "Verification code sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process login OTP request." });
  }
});

// Verify OTP for Login (Auto-authentication/verification flow)
app.post('/api/auth/login-otp/verify', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Email and verification code are required." });
  }

  try {
    const otps = await database.getCollection('otps');
    const otpIndex = otps.findIndex(o => o.email.toLowerCase() === email.toLowerCase());
    if (otpIndex === -1) {
      return res.status(400).json({ error: "No active verification code request found." });
    }

    const otp = otps[otpIndex];
    if (new Date(otp.expiresAt) < new Date()) {
      otps.splice(otpIndex, 1);
      await database.saveCollection('otps', otps);
      return res.status(400).json({ error: "Verification code has expired." });
    }

    if (otp.code === code) {
      // Correct code! Update account status to approved
      const users = await database.getCollection('users');
      const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex === -1) {
        return res.status(404).json({ error: "User not found." });
      }

      const user = users[userIndex];
      const previousStatus = user.accountStatus;
      user.accountStatus = "approved"; // Auto-approve
      
      users[userIndex] = user;
      await database.saveCollection('users', users);

      // Delete verified OTP
      otps.splice(otpIndex, 1);
      await database.saveCollection('otps', otps);

      await logAuditEvent(email, "Login OTP Verification Success");

      // In-App & Email/SMS Notifications for status transition
      if (previousStatus !== "approved") {
        const notifications = await database.getCollection('notifications');
        const newNotif = {
          id: "NT-" + Math.floor(10000 + Math.random() * 90000),
          userEmail: email,
          title: "Account Approved",
          body: `Your account (${user.profileId}) has been auto-approved via OTP verification. You can now log in.`,
          type: "success",
          read: false,
          createdAt: new Date().toISOString()
        };
        notifications.unshift(newNotif);
        await database.saveCollection('notifications', notifications);

        console.log(`\n================== [NOTIFICATION OUTBOX] ==================`);
        console.log(`[SMS SENDING] To ${user.phone}:\nDEVSETU CONNECT\n\nYour account has been auto-approved via OTP.\n\nProfile ID:\n${user.profileId}`);
        console.log(`[EMAIL SENDING] To ${email}`);
        console.log(`Subject: Account Auto-Approved via OTP`);
        console.log(`Message:\nDear Astrologer,\n\nYour account has been auto-approved via OTP verification.\n\nProfile ID:\n${user.profileId}\n\nRegards,\nDEVSETU Team`);
        console.log(`===========================================================\n`);

        await sendMockMessage('sms', user.phone, 'Account Auto-Approved', `DEVSETU CONNECT\n\nYour account has been auto-approved via OTP.\n\nProfile ID:\n${user.profileId}`);
        await sendMockMessage('email', email, 'Account Auto-Approved via OTP', `Dear Astrologer,\n\nYour account has been auto-approved via OTP verification.\n\nProfile ID:\n${user.profileId}\n\nRegards,\nDEVSETU Team`);
      }

      // Return logged in user object
      res.json({
        user: {
          profileId: user.profileId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          state: user.state || "Maharashtra",
          city: user.city || "Pune",
          experience: user.experience || "5 Years",
          accountStatus: user.accountStatus,
          sessionVersion: user.sessionVersion || 1
        }
      });
    } else {
      otp.attempts += 1;
      await logAuditEvent(email, "Failed Login OTP Verification Attempt");

      if (otp.attempts >= 5) {
        otps.splice(otpIndex, 1);
        await database.saveCollection('otps', otps);
        return res.status(400).json({ error: "Verification code expired due to too many failed attempts." });
      } else {
        otps[otpIndex] = otp;
        await database.saveCollection('otps', otps);
        return res.status(400).json({ error: `Invalid verification code. Remaining attempts: ${5 - otp.attempts}` });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to verify login OTP." });
  }
});

// Change Password Endpoint
app.post('/api/auth/change-password', async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "Missing required password change parameters." });
  }

  try {
    const users = await database.getCollection('users');
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = users[userIndex];
    if (!verifyPassword(currentPassword, user.password, user.salt)) {
      return res.status(401).json({ error: "Incorrect current password." });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ error: "New password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character." });
    }

    const { salt, hash } = hashPassword(newPassword);
    user.password = hash;
    user.salt = salt;
    user.sessionVersion = (user.sessionVersion || 1) + 1; // Increment sessionVersion to force logout other sessions

    users[userIndex] = user;
    await database.saveCollection('users', users);

    await logAuditEvent(email, "Password Change");

    // Send In-App Notification
    const notifications = await database.getCollection('notifications');
    const newNotif = {
      id: "NT-" + Math.floor(10000 + Math.random() * 90000),
      userEmail: email,
      title: "Password Changed",
      body: "Your password has been changed successfully.",
      type: "info",
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    await database.saveCollection('notifications', notifications);

    // Send mock Email notification
    console.log(`\n================== [NOTIFICATION OUTBOX] ==================`);
    console.log(`[EMAIL SENDING] To ${email}`);
    console.log(`Subject: Password Changed Successfully`);
    console.log(`Message:\nDear User,\n\nYour password has been changed successfully.\n\nRegards,\nDEVSETU CONNECT Team`);
    console.log(`===========================================================\n`);

    res.json({ success: true, user: { profileId: user.profileId, email: user.email, name: user.name, sessionVersion: user.sessionVersion } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change password." });
  }
});

// Forgot Password - Step 1: Request OTP
app.post('/api/auth/forgot-password/request', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    const users = await database.getCollection('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: "No account registered with this email address." });
    }

    // Generate secure 6-digit verification code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

    const otps = await database.getCollection('otps');
    // Remove any existing OTP for this email
    const filteredOtps = otps.filter(o => o.email.toLowerCase() !== email.toLowerCase());
    filteredOtps.push({
      email: email.toLowerCase(),
      code,
      expiresAt,
      attempts: 0
    });
    await database.saveCollection('otps', filteredOtps);

    await logAuditEvent(email, "Password Reset Request");

    // Send mock Email verification
    console.log(`\n================== [NOTIFICATION OUTBOX] ==================`);
    console.log(`[EMAIL SENDING] To ${email}`);
    console.log(`Subject: DEVSETU CONNECT Password Reset Verification`);
    console.log(`Message:\nDear User,\n\nYour verification code is:\n\n${code}\n\nThis code is valid for 10 minutes.\n\nIf you did not request a password reset, please ignore this email.\n\nRegards,\nDEVSETU CONNECT Team`);
    console.log(`===========================================================\n`);

    await sendMockMessage('email', email, 'DEVSETU CONNECT Password Reset Verification', `Dear User,\n\nYour verification code is:\n\n${code}\n\nThis code is valid for 10 minutes.\n\nIf you did not request a password reset, please ignore this email.\n\nRegards,\nDEVSETU CONNECT Team`);

    res.json({ success: true, message: "Verification code sent to registered email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process password reset request." });
  }
});

// Forgot Password - Step 2: Verify OTP
app.post('/api/auth/forgot-password/verify', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Email and verification code are required." });
  }

  try {
    const otps = await database.getCollection('otps');
    const otpIndex = otps.findIndex(o => o.email.toLowerCase() === email.toLowerCase());
    if (otpIndex === -1) {
      return res.status(400).json({ error: "No active verification code request found. Please request a new code." });
    }

    const otp = otps[otpIndex];
    
    // Check expiry
    if (new Date(otp.expiresAt) < new Date()) {
      otps.splice(otpIndex, 1);
      await database.saveCollection('otps', otps);
      return res.status(400).json({ error: "Verification code has expired. Please request a new code." });
    }

    if (otp.code === code) {
      res.json({ success: true, message: "Code verified successfully." });
    } else {
      otp.attempts += 1;
      await logAuditEvent(email, "Failed Verification Attempt");
      
      if (otp.attempts >= 5) {
        otps.splice(otpIndex, 1);
        await database.saveCollection('otps', otps);
        return res.status(400).json({ error: "Verification code expired due to too many failed attempts. Please request a new code." });
      } else {
        otps[otpIndex] = otp;
        await database.saveCollection('otps', otps);
        return res.status(400).json({ error: `Invalid verification code. Remaining attempts: ${5 - otp.attempts}` });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to verify code." });
  }
});

// Forgot Password - Step 3: Reset Password
app.post('/api/auth/forgot-password/reset', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "Missing required password reset parameters." });
  }

  try {
    const otps = await database.getCollection('otps');
    const otpIndex = otps.findIndex(o => o.email.toLowerCase() === email.toLowerCase() && o.code === code);
    if (otpIndex === -1) {
      return res.status(400).json({ error: "Invalid request. Verification code mismatch or expired." });
    }

    const otp = otps[otpIndex];
    if (new Date(otp.expiresAt) < new Date()) {
      otps.splice(otpIndex, 1);
      await database.saveCollection('otps', otps);
      return res.status(400).json({ error: "Verification code has expired." });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ error: "New password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character." });
    }

    const users = await database.getCollection('users');
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = users[userIndex];
    const { salt, hash } = hashPassword(newPassword);
    user.password = hash;
    user.salt = salt;
    user.sessionVersion = (user.sessionVersion || 1) + 1; // force logout on other devices
    user.accountStatus = "approved"; // auto-approve account upon successful password reset verification

    users[userIndex] = user;
    await database.saveCollection('users', users);

    // Delete verified OTP
    otps.splice(otpIndex, 1);
    await database.saveCollection('otps', otps);

    await logAuditEvent(email, "Password Reset Success");

    // In-App Notification
    const notifications = await database.getCollection('notifications');
    const newNotif = {
      id: "NT-" + Math.floor(10000 + Math.random() * 90000),
      userEmail: email,
      title: "Password Reset Successful",
      body: "Password updated successfully.",
      type: "success",
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    await database.saveCollection('notifications', notifications);

    // Send confirmation email
    console.log(`\n================== [NOTIFICATION OUTBOX] ==================`);
    console.log(`[EMAIL SENDING] To ${email}`);
    console.log(`Subject: Password Reset Successful`);
    console.log(`Message:\nYour DEVSETU CONNECT password has been reset successfully.\n\nIf this was not performed by you, contact support immediately.`);
    console.log(`===========================================================\n`);

    res.json({ success: true, message: "Password reset completed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset password." });
  }
});

// Session status validation endpoint
app.get('/api/auth/session-status', async (req, res) => {
  const { email, sessionVersion } = req.query;
  if (!email || !sessionVersion) {
    return res.status(400).json({ error: "Email and sessionVersion parameters are required." });
  }

  try {
    const users = await database.getCollection('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.json({ active: false });
    }

    const currentVer = user.sessionVersion || 1;
    const clientVer = parseInt(sessionVersion, 10);
    
    if (currentVer !== clientVer) {
      return res.json({ active: false });
    }
    
    res.json({ active: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to validate session status." });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await database.getCollection('users');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve users." });
  }
});

app.put('/api/users/:email/status', async (req, res) => {
  const { email } = req.params;
  const { accountStatus } = req.body; // 'approved' or 'rejected'
  
  if (!accountStatus || !['approved', 'rejected'].includes(accountStatus)) {
    return res.status(400).json({ error: "Invalid account status parameter." });
  }

  try {
    const users = await database.getCollection('users');
    let updatedUser = null;
    const updatedUsers = users.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        updatedUser = { ...u, accountStatus };
        return updatedUser;
      }
      return u;
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    await database.saveCollection('users', updatedUsers);

    const { name, phone, profileId } = updatedUser;

    // Log SMS and Email dispatch for Status Change
    console.log(`\n================== [NOTIFICATION OUTBOX] ==================`);
    if (accountStatus === 'approved') {
      console.log(`[SMS SENDING] To ${phone}:\nDEVSETU CONNECT\n\nYour account has been approved.\n\nProfile ID:\n${profileId}\n\nYou can now login to the application.`);
      console.log(`[EMAIL SENDING] To ${email}`);
      console.log(`Subject: Account Approved`);
      console.log(`Message:\nDear Astrologer,\n\nYour account has been verified and approved.\n\nProfile ID:\n${profileId}\n\nYou can now access all DEVSETU CONNECT services.\n\nRegards,\nDEVSETU Team`);

      await sendMockMessage('sms', phone, 'Account Approved', `DEVSETU CONNECT\n\nYour account has been approved.\n\nProfile ID:\n${profileId}\n\nYou can now login to the application.`);
      await sendMockMessage('email', email, 'Account Approved', `Dear Astrologer,\n\nYour account has been verified and approved.\n\nProfile ID:\n${profileId}\n\nYou can now access all DEVSETU CONNECT services.\n\nRegards,\nDEVSETU Team`);
    } else {
      console.log(`[SMS SENDING] To ${phone}:\nDEVSETU CONNECT\n\nYour registration could not be approved.\n\nProfile ID:\n${profileId}\n\nPlease contact support.`);
      console.log(`[EMAIL SENDING] To ${email}`);
      console.log(`Subject: Registration Update`);
      console.log(`Message:\nDear Astrologer,\n\nYour registration request could not be approved.\n\nProfile ID:\n${profileId}\n\nFor assistance please contact DEVSETU Support.\n\nRegards,\nDEVSETU Team`);

      await sendMockMessage('sms', phone, 'Registration Rejected', `DEVSETU CONNECT\n\nYour registration could not be approved.\n\nProfile ID:\n${profileId}\n\nPlease contact support.`);
      await sendMockMessage('email', email, 'Registration Update', `Dear Astrologer,\n\nYour registration request could not be approved.\n\nProfile ID:\n${profileId}\n\nFor assistance please contact DEVSETU Support.\n\nRegards,\nDEVSETU Team`);
    }
    console.log(`===========================================================\n`);

    // Add notification to user's feed
    const notifications = await database.getCollection('notifications');
    const newNotif = {
      id: "NT-" + Math.floor(10000 + Math.random() * 90000),
      userEmail: email,
      title: accountStatus === 'approved' ? "Account Approved" : "Registration Rejected",
      body: accountStatus === 'approved' 
        ? `Your account (${profileId}) has been approved. You can now log in.`
        : `Your registration request for account (${profileId}) has been rejected. Please contact support.`,
      type: accountStatus === 'approved' ? "success" : "danger",
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    await database.saveCollection('notifications', notifications);

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user status." });
  }
});

// Bookings Routes
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await database.getCollection('bookings');
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve bookings." });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { id, astrologerName, astrologerProfileId, serviceId, packageName, amount, astroFee, clientName, clientMobile, city, date, notes } = req.body;
  if (!clientName || !clientMobile || !date) {
    return res.status(400).json({ error: "Missing required booking details." });
  }

  try {
    const bookings = await database.getCollection('bookings');
    
    // Generate sequential Booking ID: DEV-BKG-YYYY-XXXXX
    const year = new Date().getFullYear();
    const prefix = `DEV-BKG-${year}-`;
    let maxNum = 0;
    
    bookings.forEach(b => {
      if (b.id && b.id.startsWith(prefix)) {
        const parts = b.id.split('-');
        const numStr = parts[parts.length - 1];
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNum = String(maxNum + 1).padStart(5, '0');
    const bookingId = id || `${prefix}${nextNum}`;

    const newBooking = {
      id: bookingId,
      astrologerName,
      astrologerProfileId: astrologerProfileId || "DEV-AST-00001",
      serviceId,
      packageName,
      amount,
      astroFee,
      clientName,
      clientMobile,
      city,
      date,
      status: "created",
      notes,
      createdAt: new Date().toISOString()
    };

    bookings.unshift(newBooking);
    await database.saveCollection('bookings', bookings);

    // Retrieve users to find the email and phone of the astrologer
    const users = await database.getCollection('users');
    const astroUser = users.find(u => u.name === astrologerName || u.profileId === astrologerProfileId) || {
      email: 'shaunakmulay19@gmail.com',
      phone: '8698378379'
    };

    // Log SMS and Email dispatch
    console.log(`\n================== [NOTIFICATION OUTBOX] ==================`);
    console.log(`[SMS SENDING] To ${astroUser.phone}:\nDEVSETU CONNECT\n\nBooking Created Successfully.\n\nBooking ID:\n${bookingId}\n\nComplete payment to continue.`);
    console.log(`[EMAIL SENDING] To ${astroUser.email}`);
    console.log(`Subject: Booking Created Successfully`);
    console.log(`Message:\nDear Astrologer,\n\nYour booking has been created successfully.\n\nProfile ID:\n${astrologerProfileId || 'DEV-AST-00001'}\n\nBooking ID:\n${bookingId}\n\nCurrent Status:\nPayment Pending\n\nRegards,\nDEVSETU CONNECT Team`);
    console.log(`===========================================================\n`);

    await sendMockMessage('sms', astroUser.phone, 'Booking Created', `DEVSETU CONNECT\n\nBooking Created Successfully.\n\nBooking ID:\n${bookingId}\n\nComplete payment to continue.`);
    await sendMockMessage('email', astroUser.email, 'Booking Created Successfully', `Dear Astrologer,\n\nYour booking has been created successfully.\n\nProfile ID:\n${astrologerProfileId || 'DEV-AST-00001'}\n\nBooking ID:\n${bookingId}\n\nCurrent Status:\nPayment Pending\n\nRegards,\nDEVSETU CONNECT Team`);

    res.status(201).json(newBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking." });
  }
});

app.post('/api/bookings/:id/payment', async (req, res) => {
  const { id } = req.params;
  const { txnId, screenshot } = req.body;

  if (!txnId) {
    return res.status(400).json({ error: "Transaction ID reference is required." });
  }

  try {
    const bookings = await database.getCollection('bookings');
    let updatedBooking = null;

    const nextBookings = bookings.map(b => {
      if (b.id === id) {
        updatedBooking = {
          ...b,
          status: "submitted",
          txnId,
          screenshot: screenshot
        };
        return updatedBooking;
      }
      return b;
    });

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    await database.saveCollection('bookings', nextBookings);
    res.json(updatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit payment details." });
  }
});

app.put('/api/bookings/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const bookings = await database.getCollection('bookings');
    let updatedBooking = null;

    const nextBookings = bookings.map(b => {
      if (b.id === id) {
        updatedBooking = { ...b, status };
        return updatedBooking;
      }
      return b;
    });

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    await database.saveCollection('bookings', nextBookings);

    // Retrieve users to find the email and phone of the astrologer
    const users = await database.getCollection('users');
    const astroUser = users.find(u => u.name === updatedBooking.astrologerName) || {
      email: 'shaunakmulay19@gmail.com',
      phone: '8698378379'
    };

    // Create and add status notifications
    const notifications = await database.getCollection('notifications');
    let title = "";
    let body = "";
    let type = "info";

    if (status === "approved") {
      title = "Booking Approved";
      body = `Your booking request for ${updatedBooking.packageName} has been approved. Booking ID: ${updatedBooking.id}. Please check the DEVSETU app for further details.`;
      type = "success";
      
      // Log SMS and Email dispatch
      console.log(`\n================== [NOTIFICATION OUTBOX] ==================`);
      console.log(`[SMS SENDING] To ${astroUser.phone}:\nDEVSETU CONNECT\n\nBooking Approved.\n\nBooking ID:\n${updatedBooking.id}\n\nPlease login for details.`);
      console.log(`[EMAIL SENDING] To ${astroUser.email}`);
      console.log(`Subject: Booking Approved`);
      console.log(`Message:\nDear Astrologer,\n\nYour booking has been approved.\n\nProfile ID:\n${updatedBooking.astrologerProfileId || 'DEV-AST-00001'}\n\nBooking ID:\n${updatedBooking.id}\n\nStatus:\nApproved\n\nRegards,\nDEVSETU CONNECT Team`);
      console.log(`===========================================================\n`);

      await sendMockMessage('sms', astroUser.phone, 'Booking Approved', `DEVSETU CONNECT\n\nBooking Approved.\n\nBooking ID:\n${updatedBooking.id}\n\nPlease login for details.`);
      await sendMockMessage('email', astroUser.email, 'Booking Approved', `Dear Astrologer,\n\nYour booking has been approved.\n\nProfile ID:\n${updatedBooking.astrologerProfileId || 'DEV-AST-00001'}\n\nBooking ID:\n${updatedBooking.id}\n\nStatus:\nApproved\n\nRegards,\nDEVSETU CONNECT Team`);
    } else if (status === "cancelled") {
      title = "Booking Rejected";
      body = `Your booking request for ${updatedBooking.packageName} could not be approved. Reason: Payment could not be verified. Please contact support.`;
      type = "danger";
      
      // Log SMS and Email dispatch
      console.log(`\n================== [NOTIFICATION OUTBOX] ==================`);
      console.log(`[SMS SENDING] To ${astroUser.phone}:\nDEVSETU CONNECT\n\nBooking Rejected.\n\nBooking ID:\n${updatedBooking.id}\n\nPlease contact support.`);
      console.log(`[EMAIL SENDING] To ${astroUser.email}`);
      console.log(`Subject: Booking Rejected`);
      console.log(`Message:\nDear Astrologer,\n\nYour booking request for ${updatedBooking.packageName} could not be approved.\nReason: Payment could not be verified.\n\nProfile ID:\n${updatedBooking.astrologerProfileId || 'DEV-AST-00001'}\n\nBooking ID:\n${updatedBooking.id}\n\nStatus:\nRejected\n\nRegards,\nDEVSETU CONNECT Team`);
      console.log(`===========================================================\n`);

      await sendMockMessage('sms', astroUser.phone, 'Booking Rejected', `DEVSETU CONNECT\n\nBooking Rejected.\n\nBooking ID:\n${updatedBooking.id}\n\nPlease contact support.`);
      await sendMockMessage('email', astroUser.email, 'Booking Rejected', `Dear Astrologer,\n\nYour booking request for ${updatedBooking.packageName} could not be approved.\nReason: Payment could not be verified.\n\nProfile ID:\n${updatedBooking.astrologerProfileId || 'DEV-AST-00001'}\n\nBooking ID:\n${updatedBooking.id}\n\nStatus:\nRejected\n\nRegards,\nDEVSETU CONNECT Team`);
    }

    if (title) {
      const newNotif = {
        id: "NT-" + Math.floor(10000 + Math.random() * 90000),
        userEmail: astroUser.email,
        title,
        body,
        type,
        read: false,
        createdAt: new Date().toISOString()
      };
      notifications.unshift(newNotif);
      await database.saveCollection('notifications', notifications);
    }

    res.json(updatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update booking status." });
  }
});

// Tickets Routes
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await database.getCollection('tickets');
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve tickets." });
  }
});

app.post('/api/tickets', async (req, res) => {
  const { category, subject } = req.body;
  if (!subject) {
    return res.status(400).json({ error: "Subject is required." });
  }

  try {
    const tickets = await database.getCollection('tickets');
    const newTicket = {
      id: "TK-" + Math.floor(1000 + Math.random() * 9000),
      category,
      status: "Open",
      subject,
      lastUpdate: "Just now"
    };

    tickets.unshift(newTicket);
    await database.saveCollection('tickets', tickets);
    res.status(201).json(newTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create support ticket." });
  }
});

app.put('/api/tickets/:id/resolve', async (req, res) => {
  const { id } = req.params;
  
  try {
    const tickets = await database.getCollection('tickets');
    let updatedTicket = null;

    const nextTickets = tickets.map(t => {
      if (t.id === id) {
        updatedTicket = { ...t, status: "Resolved", lastUpdate: "Just now" };
        return updatedTicket;
      }
      return t;
    });

    if (!updatedTicket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    await database.saveCollection('tickets', nextTickets);
    res.json(updatedTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to resolve support ticket." });
  }
});

// Chats Routes
app.get('/api/chats', async (req, res) => {
  try {
    const chats = await database.getCollection('chats');
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve support chats." });
  }
});

app.post('/api/chats', async (req, res) => {
  const { ticketId, sender, text, category, attachment } = req.body;
  if (!text && !attachment) {
    return res.status(400).json({ error: "Message text or attachment is required." });
  }

  try {
    const chats = await database.getCollection('chats');
    const newChat = {
      id: Date.now(),
      ticketId: ticketId || "TK-9402",
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: category || "General Queries",
      read: false,
      attachment
    };

    chats.push(newChat);
    await database.saveCollection('chats', chats);

    // Update lastUpdate on matching ticket
    const tickets = await database.getCollection('tickets');
    const nextTickets = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, lastUpdate: "Just now" };
      }
      return t;
    });
    await database.saveCollection('tickets', nextTickets);

    res.status(201).json(newChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to post support chat message." });
  }
});

// Notifications Routes
app.get('/api/notifications', async (req, res) => {
  const { email } = req.query;
  try {
    const notifications = await database.getCollection('notifications');
    if (email) {
      const filtered = notifications.filter(n => n.userEmail.toLowerCase() === email.toLowerCase());
      res.json(filtered);
    } else {
      res.json(notifications);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve notifications." });
  }
});

app.post('/api/notifications/clear', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    const notifications = await database.getCollection('notifications');
    const updated = notifications.map(n => {
      if (n.userEmail.toLowerCase() === email.toLowerCase()) {
        return { ...n, read: true };
      }
      return n;
    });
    await database.saveCollection('notifications', updated);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to clear notifications." });
  }
});

// Debug Outbox APIs for real-time frontend notifications
app.get('/api/debug/outbox', async (req, res) => {
  try {
    const outbox = await database.getCollection('mock_outbox') || [];
    res.json(outbox);
  } catch (err) {
    console.error("Failed to read mock outbox:", err);
    res.status(500).json({ error: "Failed to read mock outbox." });
  }
});

app.post('/api/debug/outbox/clear', async (req, res) => {
  try {
    await database.saveCollection('mock_outbox', []);
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to clear mock outbox:", err);
    res.status(500).json({ error: "Failed to clear mock outbox." });
  }
});

// Server Listen
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server successfully running on http://0.0.0.0:${PORT}`);
  console.log(`Accessible locally at http://localhost:${PORT}`);
});
