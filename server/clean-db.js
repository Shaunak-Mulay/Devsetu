import { database } from './database.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Password Hashing Helper (same as server/database.js)
function hashPassword(password, salt) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

async function cleanDatabase() {
  console.log("\n==================================================");
  console.log("       DEVSETU PRODUCTION DATABASE CLEANUP        ");
  console.log("==================================================\n");

  try {
    // Clear all booking records
    console.log("[1/7] Wiping bookings collection...");
    await database.saveCollection('bookings', []);

    // Clear all chats
    console.log("[2/7] Wiping chats collection...");
    await database.saveCollection('chats', []);

    // Clear all tickets
    console.log("[3/7] Wiping tickets collection...");
    await database.saveCollection('tickets', []);

    // Clear all notifications and seed defaults
    console.log("[4/7] Wiping notifications and seeding defaults...");
    const defaultNotifs = [
      {
        id: "NT-87961",
        userEmail: "verifyastro@gmail.com",
        title: "Booking Approved",
        body: "Your booking request for Ekam Shanti (1 Pandit) has been approved. Booking ID: BK-4411. Please check the DEVSETU app for further details.",
        type: "success",
        read: false,
        createdAt: "2026-06-20T00:07:35.848Z"
      },
      {
        id: "NT-INIT01",
        userEmail: "shaunakmulay19@gmail.com",
        title: "Welcome to DEVSETU",
        body: "Welcome Shaunak Mulay. Your astrologer account has been successfully created. Explore categories and start booking pooja services.",
        type: "info",
        read: false,
        createdAt: "2026-06-19T22:00:00Z"
      }
    ];
    await database.saveCollection('notifications', defaultNotifs);

    // Clear all OTP records
    console.log("[5/7] Wiping otps collection...");
    await database.saveCollection('otps', []);

    // Clear all audit logs
    console.log("[6/7] Wiping audit_logs collection...");
    await database.saveCollection('audit_logs', []);

    // Reset users collection and seed the Admin account
    console.log("[7/7] Resetting users to Admin account...");
    const adminEmail = process.env.ADMIN_EMAIL || "devsetuconnect@gmail.com";
    const adminPin = process.env.ADMIN_PIN || "123456";
    const { salt: adminSalt, hash: adminHash } = hashPassword(adminPin);

    const adminUser = {
      adminId: "ADM00001",
      profileId: "DEV-ADM-00001",
      name: "System Administrator",
      email: adminEmail,
      phone: "9999999999",
      mobile: "9999999999",
      password: adminHash,
      salt: adminSalt,
      accountStatus: "approved",
      role: "admin",
      sessionVersion: 1
    };

    const { salt: astro1Salt, hash: astro1Hash } = hashPassword("123456");
    const defaultAstro1 = {
      profileId: "DEV-AST-000001",
      name: "Shaunak Mulay",
      email: "shaunakmulay19@gmail.com",
      phone: "8698378379",
      mobile: "8698378379",
      password: astro1Hash,
      salt: astro1Salt,
      accountStatus: "approved",
      role: "astrologer",
      sessionVersion: 1
    };

    const { salt: astro2Salt, hash: astro2Hash } = hashPassword("123456");
    const defaultAstro2 = {
      profileId: "DEV-AST-000002",
      name: "Verification Astro",
      email: "verifyastro@gmail.com",
      phone: "9876543210",
      mobile: "9876543210",
      password: astro2Hash,
      salt: astro2Salt,
      accountStatus: "approved",
      role: "astrologer",
      sessionVersion: 1
    };

    await database.saveCollection('users', [adminUser, defaultAstro1, defaultAstro2]);
    await database.saveCollection('pin_reset_requests', []);

    console.log("\n[SUCCESS] Database cleanup and Admin seeding finished successfully!");
    process.exit(0);
  } catch (err) {
    console.error("\n[ERROR] Database cleanup failed:", err);
    process.exit(1);
  }
}

cleanDatabase();
