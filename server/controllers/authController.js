import { dbService } from '../services/dbService.js';
import { notificationService } from '../notifications/notificationService.js';
import { logAuditEvent } from '../services/auditService.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';
import { isValidPin } from '../utils/validators.js';

export async function signup(req, res) {
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

  console.log("[DEBUG SIGNUP] 1: Received params", { name, email, phone });
  try {
    console.log("[DEBUG SIGNUP] 2: Fetching users collection");
    const users = await dbService.getCollection('users') || [];
    console.log("[DEBUG SIGNUP] 3: Fetched users successfully, size:", users.length);
    const exists = users.some(u => {
      const emailMatch = email && u.email && u.email.toLowerCase() === email.toLowerCase();
      const phoneMatch = u.phone === phone || u.mobile === phone;
      return emailMatch || phoneMatch;
    });
    if (exists) {
      return res.status(400).json({ error: "Account already exists with this email or mobile number." });
    }

    if (!isValidPin(password)) {
      return res.status(400).json({ error: "PIN must contain exactly 6 digits. Numeric only." });
    }

    // Generate unique profileId sequentially (format: DEV-AST-XXXXXX)
    let maxId = 0;
    users.forEach(u => {
      if (u.profileId && u.profileId.startsWith('DEV-AST-')) {
        const num = parseInt(u.profileId.replace('DEV-AST-', ''), 10);
        if (!isNaN(num) && num > maxId) {
          maxId = num;
        }
      }
    });
    const nextId = String(maxId + 1).padStart(6, '0');
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
    await dbService.saveCollection('users', users);
    
    await logAuditEvent(email || phone, "Registration Submitted");

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
}

export async function login(req, res) {
  const { loginFormType = 'email', email, phone, password, role } = req.body;
  const targetVal = loginFormType === 'email' ? email : phone;
  
  if (!targetVal || !password) {
    return res.status(400).json({ error: "Credentials and PIN are required." });
  }

  try {
    const users = await dbService.getCollection('users') || [];
    const user = users.find(u => {
      if (u.role === 'admin') {
        const checkEmail = u.email && u.email.trim().toLowerCase() === targetVal.trim().toLowerCase();
        const checkPhone = (u.phone || u.mobile || "").trim() === targetVal.trim();
        return checkEmail || checkPhone;
      } else if (u.role === 'astrologer') {
        // Astrologer login is strictly mobile number only. No email login.
        if (loginFormType === 'email') return false;
        const checkPhone = (u.phone || u.mobile || "").trim() === targetVal.trim();
        return checkPhone;
      }
      return false;
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

      await logAuditEvent(user.email || user.phone, "Login Success");

      res.json({
        user: {
          profileId: user.profileId,
          adminId: user.adminId,
          role: user.role,
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
      res.status(401).json({ error: "Invalid credentials or PIN." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to login user." });
  }
}

export async function requestLoginOtp(req, res) {
  const { email, phone } = req.body;
  if (!email && !phone) {
    return res.status(400).json({ error: "Email or mobile number is required." });
  }

  try {
    const users = await dbService.getCollection('users') || [];
    const user = users.find(u => {
      if (email) return u.email && u.email.toLowerCase() === email.toLowerCase();
      if (phone) return u.phone === phone || u.mobile === phone;
      return false;
    });

    if (!user) {
      return res.status(404).json({ error: "No account registered with this identity." });
    }

    // Generate secure 6-digit verification code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const targetKey = (user.email || user.phone || user.mobile).toLowerCase();

    const otps = await dbService.getCollection('otps') || [];
    const filteredOtps = otps.filter(o => o.email && o.email.toLowerCase() !== targetKey);
    filteredOtps.push({
      email: targetKey,
      code,
      expiresAt,
      attempts: 0
    });
    await dbService.saveCollection('otps', filteredOtps);

    const userEmailForAudit = user.email || user.phone;
    await logAuditEvent(userEmailForAudit, "Login OTP Request");

    await notificationService.sendNotification({
      userId: user.email || user.phone,
      event: "Password Reset", 
      title: "DEVSETU CONNECT Login Verification Code",
      body: `Dear User,\n\nYour login verification code is:\n\n${code}\n\nThis code is valid for 10 minutes.`,
      relatedProfileId: user.profileId
    });

    res.json({ success: true, email: userEmailForAudit, message: "Verification code sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process login OTP request." });
  }
}

export async function verifyLoginOtp(req, res) {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Email and verification code are required." });
  }

  try {
    const users = await dbService.getCollection('users') || [];
    const userIndex = users.findIndex(u => (u.email && u.email.toLowerCase() === email.toLowerCase()) || u.phone === email || u.mobile === email);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = users[userIndex];
    const identity = (user.email || user.phone || user.mobile).toLowerCase();

    const otps = await dbService.getCollection('otps') || [];
    const otpIndex = otps.findIndex(o => o.email && o.email.toLowerCase() === identity);
    if (otpIndex === -1) {
      return res.status(400).json({ error: "No active verification code request found." });
    }

    const otp = otps[otpIndex];
    if (new Date(otp.expiresAt) < new Date()) {
      otps.splice(otpIndex, 1);
      await dbService.saveCollection('otps', otps);
      return res.status(400).json({ error: "Verification code has expired." });
    }

    if (otp.code === code) {
      const previousStatus = user.accountStatus;
      user.accountStatus = "approved";
      user.status = "Approved";
      user.approved = true;
      
      users[userIndex] = user;
      await dbService.saveCollection('users', users);

      otps.splice(otpIndex, 1);
      await dbService.saveCollection('otps', otps);

      await logAuditEvent(email, "Login OTP Verification Success");

      if (previousStatus !== "approved") {
        await notificationService.sendNotification({
          userId: email,
          event: "Registration Approved",
          title: "Account Approved",
          body: `Your account (${user.profileId}) has been auto-approved via OTP verification. You can now log in.`,
          relatedProfileId: user.profileId
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
      otp.attempts += 1;
      await logAuditEvent(email, "Failed Login OTP Verification Attempt");

      if (otp.attempts >= 5) {
        otps.splice(otpIndex, 1);
        await dbService.saveCollection('otps', otps);
        return res.status(400).json({ error: "Verification code expired due to too many failed attempts." });
      } else {
        otps[otpIndex] = otp;
        await dbService.saveCollection('otps', otps);
        return res.status(400).json({ error: `Invalid verification code. Remaining attempts: ${5 - otp.attempts}` });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to verify login OTP." });
  }
}

export async function changePassword(req, res) {
  const { email, currentPassword, newPassword } = req.body;
  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "Missing required PIN change parameters." });
  }

  try {
    const users = await dbService.getCollection('users') || [];
    const userIndex = users.findIndex(u => (u.email && u.email.toLowerCase() === email.toLowerCase()) || u.phone === email || u.mobile === email);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = users[userIndex];
    if (!verifyPassword(currentPassword, user.password, user.salt)) {
      return res.status(401).json({ error: "Incorrect current PIN." });
    }

    if (!isValidPin(newPassword)) {
      return res.status(400).json({ error: "PIN must contain exactly 6 digits. Numeric only." });
    }

    const { salt, hash } = hashPassword(newPassword);
    user.password = hash;
    user.salt = salt;
    user.sessionVersion = (user.sessionVersion || 1) + 1;

    users[userIndex] = user;
    await dbService.saveCollection('users', users);

    await logAuditEvent(email, "Password Change");

    await notificationService.sendNotification({
      userId: email,
      event: "Password Changed",
      title: "Login PIN Changed Successfully",
      body: "Your login PIN has been changed successfully.",
      relatedProfileId: user.profileId
    });

    res.json({ success: true, user: { profileId: user.profileId, email: user.email, name: user.name, sessionVersion: user.sessionVersion } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change login PIN." });
  }
}

export async function requestForgotPasswordOtp(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email or mobile number is required." });
  }

  try {
    const users = await dbService.getCollection('users') || [];
    const user = users.find(u => (u.email && u.email.toLowerCase() === email.toLowerCase()) || (u.phone === email || u.mobile === email));
    if (!user) {
      return res.status(404).json({ error: "No account registered with this identity." });
    }

    if (user.role !== 'admin' && !user.email) {
      return res.json({ 
        success: false, 
        hasEmail: false, 
        message: "No email is registered with this account. Please contact DEVSETU Administrator to reset your password." 
      });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const targetKey = (user.email || user.phone || user.mobile).toLowerCase();

    const otps = await dbService.getCollection('otps') || [];
    const filteredOtps = otps.filter(o => o.email && o.email.toLowerCase() !== targetKey);
    filteredOtps.push({
      email: targetKey,
      code,
      expiresAt,
      attempts: 0
    });
    await dbService.saveCollection('otps', filteredOtps);

    const userEmailForAudit = user.email || user.phone;
    await logAuditEvent(userEmailForAudit, "Password Reset Request");

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
}

export async function verifyForgotPasswordOtp(req, res) {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: "Email/Mobile and verification code are required." });
  }

  try {
    const users = await dbService.getCollection('users') || [];
    const user = users.find(u => (u.email && u.email.toLowerCase() === email.toLowerCase()) || (u.phone === email || u.mobile === email));
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const identity = (user.email || user.phone || user.mobile).toLowerCase();

    const otps = await dbService.getCollection('otps') || [];
    const otpIndex = otps.findIndex(o => o.email.toLowerCase() === identity);
    if (otpIndex === -1) {
      return res.status(400).json({ error: "No active verification code request found. Please request a new code." });
    }

    const otp = otps[otpIndex];
    
    if (new Date(otp.expiresAt) < new Date()) {
      otps.splice(otpIndex, 1);
      await dbService.saveCollection('otps', otps);
      return res.status(400).json({ error: "Verification code has expired. Please request a new code." });
    }

    if (otp.code === code) {
      res.json({ success: true, message: "Code verified successfully." });
    } else {
      otp.attempts += 1;
      await logAuditEvent(email, "Failed Verification Attempt");
      
      if (otp.attempts >= 5) {
        otps.splice(otpIndex, 1);
        await dbService.saveCollection('otps', otps);
        return res.status(400).json({ error: "Verification code expired due to too many failed attempts. Please request a new code." });
      } else {
        otps[otpIndex] = otp;
        await dbService.saveCollection('otps', otps);
        return res.status(400).json({ error: `Invalid verification code. Remaining attempts: ${5 - otp.attempts}` });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to verify code." });
  }
}

export async function resetForgotPasswordPin(req, res) {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "Missing required password reset parameters." });
  }

  try {
    const users = await dbService.getCollection('users') || [];
    const userIndex = users.findIndex(u => (u.email && u.email.toLowerCase() === email.toLowerCase()) || (u.phone === email || u.mobile === email));
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = users[userIndex];
    const identity = (user.email || user.phone || user.mobile).toLowerCase();

    const otps = await dbService.getCollection('otps') || [];
    const otpIndex = otps.findIndex(o => o.email && o.email.toLowerCase() === identity && o.code === code);
    if (otpIndex === -1) {
      return res.status(400).json({ error: "Invalid request. Verification code mismatch or expired." });
    }

    const otp = otps[otpIndex];
    if (new Date(otp.expiresAt) < new Date()) {
      otps.splice(otpIndex, 1);
      await dbService.saveCollection('otps', otps);
      return res.status(400).json({ error: "Verification code has expired." });
    }

    if (!isValidPin(newPassword)) {
      return res.status(400).json({ error: "PIN must contain exactly 6 digits. Numeric only." });
    }

    const { salt, hash } = hashPassword(newPassword);
    user.password = hash;
    user.salt = salt;
    user.sessionVersion = (user.sessionVersion || 1) + 1;
    user.accountStatus = "approved";
    user.status = "Approved";
    user.approved = true;

    users[userIndex] = user;
    await dbService.saveCollection('users', users);

    otps.splice(otpIndex, 1);
    await dbService.saveCollection('otps', otps);

    await logAuditEvent(email, "Password Reset Success");

    await notificationService.sendNotification({
      userId: user.email || user.phone,
      event: "Password Reset",
      title: "PIN Reset Successful",
      body: "Your DEVSETU CONNECT login PIN has been reset successfully.",
      relatedProfileId: user.profileId
    });

    res.json({ success: true, message: "PIN reset completed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset PIN." });
  }
}

export async function requestForgotPin(req, res) {
  const { profileId, mobile } = req.body;
  if (!profileId || !mobile) {
    return res.status(400).json({ error: "Profile ID and mobile number are required." });
  }

  try {
    const users = await dbService.getCollection('users') || [];
    const user = users.find(u => u.profileId === profileId && (u.phone === mobile || u.mobile === mobile));
    if (!user) {
      return res.status(404).json({ error: "No astrologer account matches the provided Profile ID and mobile number." });
    }

    const pin_reset_requests = await dbService.getCollection('pin_reset_requests') || [];
    const existingRequest = pin_reset_requests.find(r => r.profileId === profileId && r.status === 'pending');
    if (existingRequest) {
      return res.status(400).json({ error: "A PIN reset request is already pending for this profile." });
    }

    const requestId = "PRR-" + Math.floor(100000 + Math.random() * 900000);
    const newRequest = {
      id: requestId,
      name: user.name,
      profileId: user.profileId,
      phone: user.phone || user.mobile,
      registrationDate: user.createdAt || new Date().toISOString(),
      requestDate: new Date().toISOString(),
      status: "pending", 
      accountStatus: user.accountStatus || "pending"
    };

    pin_reset_requests.unshift(newRequest);
    await dbService.saveCollection('pin_reset_requests', pin_reset_requests);

    await logAuditEvent(user.email || user.phone, "PIN Reset Request Submitted");

    const adminMsg = `Hello Admin,\n\nI am ${user.name}\nProfile ID: ${user.profileId}\nRegistered Mobile Number:\n${user.phone || user.mobile}\n\nI have forgotten my Login PIN.\nKindly reset my PIN.`;

    await notificationService.sendNotification({
      userId: "devsetuconnect@gmail.com",
      event: "PIN Reset Request",
      title: "PIN Reset Request",
      body: adminMsg,
      relatedProfileId: user.profileId
    });

    res.status(201).json({ success: true, message: "PIN reset request generated successfully.", request: newRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit PIN reset request." });
  }
}

export async function sessionStatus(req, res) {
  const { email, sessionVersion } = req.query;
  if (!email || !sessionVersion) {
    return res.status(400).json({ error: "Email and sessionVersion parameters are required." });
  }

  try {
    const users = await dbService.getCollection('users') || [];
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
    res.status(500).json({ error: "Failed to check session status." });
  }
}
