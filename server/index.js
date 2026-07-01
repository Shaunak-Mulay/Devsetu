import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { database } from './database.js';
import { notificationService } from './notificationService.js';

const app = express();
const PORT = process.env.PORT || 5000;

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




// Authentication Routes
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, phone, password, state, city, experience, district, specialization } = req.body;
  if (!name || !phone || !password || !state || !city || !experience) {
    return res.status(400).json({ error: "Missing required registration parameters." });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: "Mobile number must be exactly 10 digits." });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address format." });
  }

  try {
    const users = await database.getCollection('users');
    const exists = users.some(u => {
      const emailMatch = email && u.email && u.email.toLowerCase() === email.toLowerCase();
      const phoneMatch = u.phone === phone || u.mobile === phone;
      return emailMatch || phoneMatch;
    });
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
      email: email || "", 
      phone, 
      mobile: phone,
      password: hash, 
      salt,
      state, 
      district: district || "",
      city, 
      experience,
      specialization: specialization || "",
      accountStatus: "pending",
      status: "Pending",
      approved: false,
      sessionVersion: 1,
      role: "astrologer",
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    await database.saveCollection('users', users);
    
    await notificationService.sendNotification({
      userId: email || phone,
      event: "Registration Submitted",
      title: "Welcome to DEVSETU CONNECT",
      body: `Welcome ${name}. Your registration request has been received under Profile ID: ${profileId}. Status: Pending Verification.`,
      relatedProfileId: profileId
    });

    res.status(201).json({ user: { profileId, name, email: email || "", phone, mobile: phone, state, city, experience, accountStatus: "pending", status: "Pending", approved: false, sessionVersion: 1 } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to sign up user." });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { loginFormType = 'email', email, phone, password, role } = req.body;
  const targetVal = loginFormType === 'email' ? email : phone;
  
  if (!targetVal || !password) {
    return res.status(400).json({ error: "Credentials and password are required." });
  }

  try {
    const users = await database.getCollection('users');
    const user = users.find(u => {
      const checkVal = loginFormType === 'email' ? (u.email || "") : (u.phone || u.mobile || "");
      return checkVal.trim().toLowerCase() === targetVal.trim().toLowerCase();
    });

    if (user && verifyPassword(password, user.password, user.salt)) {
      if (role === 'admin' && user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Admin privileges required." });
      }
      if (role === 'astrologer' && user.role === 'admin') {
        return res.status(403).json({ error: "Invalid astrologer credentials." });
      }

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
          adminId: user.adminId,
          name: user.name,
          email: user.email || "",
          phone: user.phone || user.mobile,
          mobile: user.mobile || user.phone,
          state: user.state || "Maharashtra",
          district: user.district || "",
          city: user.city || "Pune",
          experience: user.experience || "5 Years",
          specialization: user.specialization || "",
          accountStatus: user.accountStatus,
          status: user.status || "Approved",
          approved: user.approved !== undefined ? user.approved : (user.accountStatus === 'approved'),
          role: user.role,
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

    const targetEmail = user.email || user.phone;
    const targetPhone = user.phone;

    await logAuditEvent(targetEmail, "Login OTP Request");
    await notificationService.sendLoginOtpNotification(targetPhone, targetEmail);

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
    const users = await database.getCollection('users');
    const userIndex = users.findIndex(u => (u.email && u.email.toLowerCase() === email.toLowerCase()) || u.phone === email || u.mobile === email);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = users[userIndex];
    const identity = (user.email || user.phone || user.mobile).toLowerCase();

    const otps = await database.getCollection('otps');
    const otpIndex = otps.findIndex(o => o.email && o.email.toLowerCase() === identity);
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
      const previousStatus = user.accountStatus;
      user.accountStatus = "approved"; // Auto-approve
      user.status = "Approved";
      user.approved = true;
      
      users[userIndex] = user;
      await database.saveCollection('users', users);

      // Delete verified OTP
      otps.splice(otpIndex, 1);
      await database.saveCollection('otps', otps);

      await logAuditEvent(email, "Login OTP Verification Success");

      // In-App & Email/SMS Notifications for status transition
      if (previousStatus !== "approved") {
        await notificationService.sendNotification({
          userId: email,
          event: "Registration Approved",
          title: "Account Approved",
          body: `Your account (${user.profileId}) has been auto-approved via OTP verification. You can now log in.`,
          relatedProfileId: user.profileId
        });
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
    const userIndex = users.findIndex(u => (u.email && u.email.toLowerCase() === email.toLowerCase()) || u.phone === email || u.mobile === email);
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

    await notificationService.sendNotification({
      userId: email,
      event: "Password Changed",
      title: "Password Changed Successfully",
      body: "Your password has been changed successfully.",
      relatedProfileId: user.profileId
    });

    res.json({ success: true, user: { profileId: user.profileId, email: user.email, name: user.name, sessionVersion: user.sessionVersion } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change password." });
  }
});

// Forgot Password - Step 1: Request OTP
app.post('/api/auth/forgot-password/request', async (req, res) => {
  const { email } = req.body; // Can be email OR phone
  if (!email) {
    return res.status(400).json({ error: "Email or mobile number is required." });
  }

  try {
    const users = await database.getCollection('users');
    const user = users.find(u => (u.email && u.email.toLowerCase() === email.toLowerCase()) || (u.phone === email || u.mobile === email));
    if (!user) {
      return res.status(404).json({ error: "No account registered with this identity." });
    }

    // If it's an astrologer (not admin) and has no email:
    if (user.role !== 'admin' && !user.email) {
      return res.json({ 
        success: false, 
        hasEmail: false, 
        message: "No email is registered with this account. Please contact DEVSETU Administrator to reset your password." 
      });
    }

    // Generate secure 6-digit verification code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

    // We store the OTP key under user's email if they have one, else under their phone number
    const targetKey = (user.email || user.phone || user.mobile).toLowerCase();

    const otps = await database.getCollection('otps');
    // Remove any existing OTP for this target
    const filteredOtps = otps.filter(o => o.email && o.email.toLowerCase() !== targetKey);
    filteredOtps.push({
      email: targetKey,
      code,
      expiresAt,
      attempts: 0
    });
    await database.saveCollection('otps', filteredOtps);

    const userEmailForAudit = user.email || user.phone;
    await logAuditEvent(userEmailForAudit, "Password Reset Request");

    // Send code
    if (user.email) {
      await notificationService.sendNotification({
        userId: user.email,
        event: "Password Reset",
        title: "DEVSETU CONNECT Password Reset Verification",
        body: `Dear User,\n\nYour verification code is:\n\n${code}\n\nThis code is valid for 10 minutes.\n\nIf you did not request a password reset, please ignore this email.`,
        relatedProfileId: user.profileId
      });
      res.json({ success: true, hasEmail: true, message: "Verification code sent to registered email." });
    } else {
      // Send via SMS (Cost optimization/priority allows SMS here because Priority is HIGH)
      await notificationService.sendNotification({
        userId: user.phone || user.mobile,
        event: "Password Reset",
        title: "DEVSETU CONNECT Password Reset Verification",
        body: `Dear User,\n\nYour verification code is: ${code}. Valid for 10 minutes.`,
        relatedProfileId: user.profileId
      });
      console.log(`[BACKEND LOG - SECURE OTP] Password Reset OTP: ${code} for user ${user.phone}`);
      res.json({ success: true, hasEmail: false, isMockSmsSent: true, message: `Verification code sent to registered mobile number.` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process password reset request." });
  }
});

// Forgot Password - Step 2: Verify OTP
app.post('/api/auth/forgot-password/verify', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Email/Mobile and verification code are required." });
  }

  try {
    const users = await database.getCollection('users');
    const user = users.find(u => (u.email && u.email.toLowerCase() === email.toLowerCase()) || (u.phone === email || u.mobile === email));
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const identity = (user.email || user.phone || user.mobile).toLowerCase();

    const otps = await database.getCollection('otps');
    const otpIndex = otps.findIndex(o => o.email.toLowerCase() === identity);
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
    const users = await database.getCollection('users');
    const userIndex = users.findIndex(u => (u.email && u.email.toLowerCase() === email.toLowerCase()) || (u.phone === email || u.mobile === email));
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = users[userIndex];
    const identity = (user.email || user.phone || user.mobile).toLowerCase();

    const otps = await database.getCollection('otps');
    const otpIndex = otps.findIndex(o => o.email && o.email.toLowerCase() === identity && o.code === code);
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

    const { salt, hash } = hashPassword(newPassword);
    user.password = hash;
    user.salt = salt;
    user.sessionVersion = (user.sessionVersion || 1) + 1; // force logout on other devices
    user.accountStatus = "approved"; // auto-approve account upon successful password reset verification
    user.status = "Approved";
    user.approved = true;

    users[userIndex] = user;
    await database.saveCollection('users', users);

    // Delete verified OTP
    otps.splice(otpIndex, 1);
    await database.saveCollection('otps', otps);

    await logAuditEvent(email, "Password Reset Success");

    await notificationService.sendNotification({
      userId: user.email || user.phone,
      event: "Password Reset",
      title: "Password Reset Successful",
      body: "Your DEVSETU CONNECT password has been reset successfully.",
      relatedProfileId: user.profileId
    });

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
    const user = users.find(u => (u.email && u.email.toLowerCase() === email.toLowerCase()) || u.phone === email || u.mobile === email);
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
    const searchVal = email.toLowerCase();
    const updatedUsers = users.map(u => {
      const matchEmail = u.email && u.email.toLowerCase() === searchVal;
      const matchPhone = u.phone === email || u.mobile === email;
      const matchProfile = u.profileId && u.profileId.toLowerCase() === searchVal;
      if (matchEmail || matchPhone || matchProfile) {
        const isApproved = accountStatus === 'approved';
        updatedUser = { 
          ...u, 
          accountStatus, 
          status: isApproved ? "Approved" : "Rejected", 
          approved: isApproved 
        };
        return updatedUser;
      }
      return u;
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    await database.saveCollection('users', updatedUsers);

    const { name, phone, profileId } = updatedUser;

    await notificationService.sendNotification({
      userId: updatedUser.email || updatedUser.phone,
      event: accountStatus === 'approved' ? "Registration Approved" : "Registration Rejected",
      title: accountStatus === 'approved' ? "Account Approved" : "Registration Rejected",
      body: accountStatus === 'approved'
        ? `Your account (${profileId}) has been approved. You can now log in.`
        : `Your registration request for account (${profileId}) has been rejected. Please contact support.`,
      relatedProfileId: profileId
    });

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

    await notificationService.sendNotification({
      userId: astroUser.email || astroUser.phone,
      event: "Booking Submitted",
      title: "Booking Created Successfully",
      body: `Your booking has been created successfully. Booking ID: ${bookingId}. Complete payment to verify.`,
      relatedBookingId: bookingId,
      relatedProfileId: astrologerProfileId
    });

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
    if (status === "approved" || status === "cancelled") {
      const eventName = status === "approved" ? "Booking Approved" : "Booking Rejected";
      const notifTitle = status === "approved" ? "Booking Approved" : "Booking Rejected";
      const notifBody = status === "approved" 
        ? `Your booking request for ${updatedBooking.packageName} has been approved. Booking ID: ${updatedBooking.id}. Please check the DEVSETU app for further details.`
        : `Your booking request for ${updatedBooking.packageName} could not be approved. Reason: Payment could not be verified. Please contact support.`;

      await notificationService.sendNotification({
        userId: astroUser.email || astroUser.phone,
        event: eventName,
        title: notifTitle,
        body: notifBody,
        relatedBookingId: updatedBooking.id,
        relatedProfileId: updatedBooking.astrologerProfileId
      });
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

    // Trigger Admin Chat Message notification if sender is admin
    if (sender === "admin") {
      const userMessage = chats.find(c => c.ticketId === ticketId && c.sender !== "admin");
      if (userMessage) {
        await notificationService.sendNotification({
          userId: userMessage.sender,
          event: "Admin Chat Message",
          title: "New Support Message",
          body: `Support: ${text || "Attached a file."}`,
          relatedProfileId: ticketId
        });
      }
    }

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
});

app.post('/api/notifications/clear', async (req, res) => {
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
});

app.post('/api/notifications/mark-read', async (req, res) => {
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
});

app.delete('/api/notifications/:id', async (req, res) => {
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
});

app.post('/api/notifications/register-token', async (req, res) => {
  const { email, deviceToken } = req.body;
  if (!email || !deviceToken) {
    return res.status(400).json({ error: "Email/Mobile and deviceToken are required." });
  }
  try {
    const users = await database.getCollection('users');
    const userIndex = users.findIndex(u => (u.email && u.email.toLowerCase() === email.toLowerCase()) || u.phone === email || u.mobile === email || u.profileId === email);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found." });
    }
    users[userIndex].deviceToken = deviceToken;
    await database.saveCollection('users', users);
    console.log(`[Push Token Registered] for user ${email}: ${deviceToken}`);
    res.json({ success: true, message: "Device token registered successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register push token." });
  }
});

app.post('/api/users/notification-preferences', async (req, res) => {
  const { email, preferences } = req.body;
  if (!email || !preferences) {
    return res.status(400).json({ error: "Email/Mobile and preferences are required." });
  }
  try {
    const users = await database.getCollection('users');
    const userIndex = users.findIndex(u => (u.email && u.email.toLowerCase() === email.toLowerCase()) || u.phone === email || u.mobile === email || u.profileId === email);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found." });
    }
    users[userIndex].notificationPreferences = preferences;
    await database.saveCollection('users', users);
    console.log(`[Preferences Updated] for user ${email}:`, preferences);
    res.json({ success: true, preferences: users[userIndex].notificationPreferences });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update notification preferences." });
  }
});

app.post('/api/notifications/broadcast', async (req, res) => {
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
});

app.get('/api/notifications/admin-history', async (req, res) => {
  try {
    const history = await notificationService.getNotificationHistory('admin');
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve history." });
  }
});

app.post('/api/notifications/resend', async (req, res) => {
  const { notificationId } = req.body;
  if (!notificationId) {
    return res.status(400).json({ error: "notificationId is required." });
  }
  try {
    const notifications = await database.getCollection('notifications');
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
