import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Load directory configurations
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.json');
const serviceAccountPath = path.join(__dirname, 'service-account.json');

let db = null;
let useFirebase = false;

// Attempt to connect to Google Cloud Firestore (Firebase)
if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    const initOptions = {
      credential: admin.cert(serviceAccount)
    };
    
    // Support databaseURL configuration if provided in env or defaults to the user's DB URL
    initOptions.databaseURL = process.env.FIREBASE_DATABASE_URL || "https://devsetu-c9cae-default-rtdb.firebaseio.com";

    admin.initializeApp(initOptions);
    db = getFirestore();
    db.settings({ ignoreUndefinedProperties: true });
    useFirebase = true;
    console.log('[Database] Connected successfully to Cloud Firestore (Firebase).');
  } catch (err) {
    console.error('[Database] Failed to initialize Firebase connection. Using JSON fallback.', err);
  }
} else {
  console.log('[Database] Firebase credentials (service-account.json) not found. Falling back to local file database (database.json).');
}

// Password Hashing Helper
function hashPassword(password, salt) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

const adminEmail = process.env.ADMIN_EMAIL || "devsetuconnect@gmail.com";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
const { salt: adminSalt, hash: adminHash } = hashPassword(adminPassword);

const defaultData = {
  users: [
    {
      profileId: "DEV-ADM-00001",
      name: "System Administrator",
      email: adminEmail,
      phone: "9999999999",
      password: adminHash,
      salt: adminSalt,
      accountStatus: "approved",
      role: "admin",
      sessionVersion: 1
    },
    {
      profileId: "DEV-AST-00001",
      name: "Shaunak Mulay",
      email: "shaunakmulay19@gmail.com",
      phone: "8698378379",
      password: "password123",
      accountStatus: "approved",
      role: "astrologer",
      sessionVersion: 1
    },
    {
      profileId: "DEV-AST-00002",
      name: "Verification Astro",
      email: "verifyastro@gmail.com",
      phone: "9876543210",
      password: "password123",
      accountStatus: "approved",
      role: "astrologer",
      sessionVersion: 1
    }
  ],
  bookings: [],
  chats: [],
  tickets: [],
  notifications: [
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
  ],
  otps: [],
  audit_logs: []
};


// Initialize database schemas / seedings
const initDb = async () => {
  if (useFirebase) {
    try {
      // Seed Users if empty
      const usersSnap = await db.collection('users').limit(1).get();
      if (usersSnap.empty) {
        console.log('[Database] Seeding default users to Cloud Firestore...');
        for (const u of defaultData.users) {
          await db.collection('users').doc(u.email).set(u);
        }
      }

      // Seed Bookings if empty
      const bookingsSnap = await db.collection('bookings').limit(1).get();
      if (bookingsSnap.empty) {
        console.log('[Database] Seeding default bookings to Cloud Firestore...');
        for (const b of defaultData.bookings) {
          await db.collection('bookings').doc(b.id).set(b);
        }
      }

      // Seed Tickets if empty
      const ticketsSnap = await db.collection('tickets').limit(1).get();
      if (ticketsSnap.empty) {
        console.log('[Database] Seeding default tickets to Cloud Firestore...');
        for (const t of defaultData.tickets) {
          await db.collection('tickets').doc(t.id).set(t);
        }
      }

      // Seed Chats if empty
      const chatsSnap = await db.collection('chats').limit(1).get();
      if (chatsSnap.empty) {
        console.log('[Database] Seeding default chats to Cloud Firestore...');
        for (const c of defaultData.chats) {
          await db.collection('chats').doc(String(c.id)).set(c);
        }
      }

      // Seed Notifications if empty
      const notificationsSnap = await db.collection('notifications').limit(1).get();
      if (notificationsSnap.empty) {
        console.log('[Database] Seeding default notifications to Cloud Firestore...');
        for (const n of defaultData.notifications) {
          await db.collection('notifications').doc(n.id).set(n);
        }
      }
      console.log('[Database] Cloud Firestore initialized and seeded successfully.');
    } catch (err) {
      console.error('[Database] Failed to seed Cloud Firestore collections', err);
    }
  } else {
    // Local JSON initialization fallback
    if (!fs.existsSync(dbPath)) {
      try {
        fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2), 'utf-8');
        console.log('[Database] Local database.json created and seeded successfully.');
      } catch (err) {
        console.error('[Database] Failed to create local database.json file', err);
      }
    } else {
      // Ensure existing database.json has notifications key
      try {
        const data = fs.readFileSync(dbPath, 'utf-8');
        const dbJson = JSON.parse(data);
        if (!dbJson.notifications) {
          dbJson.notifications = defaultData.notifications;
          fs.writeFileSync(dbPath, JSON.stringify(dbJson, null, 2), 'utf-8');
        }
      } catch (err) {
        console.error('[Database] Failed to update local database.json key structure', err);
      }
    }
  }
};

// Run schema initialization asynchronously
initDb();

export const database = {
  getCollection: async (key) => {
    if (useFirebase) {
      try {
        const snapshot = await db.collection(key).get();
        const list = snapshot.docs.map(doc => doc.data());
        
        // Sort in memory to preserve presentation order
        if (key === 'bookings') {
          return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (key === 'chats') {
          return list.sort((a, b) => Number(a.id) - Number(b.id));
        } else if (key === 'notifications') {
          return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return list;
      } catch (err) {
        console.error(`[Database] Error getting collection ${key} from Cloud Firestore`, err);
        return [];
      }
    } else {
      // Fallback JSON mode
      try {
        const data = fs.readFileSync(dbPath, 'utf-8');
        const dbJson = JSON.parse(data);
        return dbJson[key] || [];
      } catch (e) {
        console.error("Error reading database file", e);
        return defaultData[key] || [];
      }
    }
  },

  saveCollection: async (key, collection) => {
    if (useFirebase) {
      try {
        const batch = db.batch();
        
        // Get all current document IDs in the remote Firestore collection
        const snapshot = await db.collection(key).get();
        const currentIds = new Set(snapshot.docs.map(doc => doc.id));
        
        // Track the document IDs we are saving/updating
        const nextIds = new Set();
        
        collection.forEach(item => {
          const docId = (key === 'users' || key === 'otps') 
            ? item.email 
            : (key === 'chats' ? String(item.id) : item.id);
          if (!docId) {
            console.warn(`[Database] Skipping save of item without identifier in collection ${key}:`, item);
            return;
          }
          const ref = db.collection(key).doc(docId);
          batch.set(ref, item);
          nextIds.add(docId);
        });
        
        // Delete documents that exist in Firestore but are not in the new collection list
        currentIds.forEach(id => {
          if (!nextIds.has(id)) {
            const ref = db.collection(key).doc(id);
            batch.delete(ref);
          }
        });
        
        await batch.commit();
        return true;
      } catch (err) {
        console.error(`[Database] Error saving collection ${key} to Cloud Firestore`, err);
        return false;
      }
    } else {
      // Fallback JSON mode
      try {
        const data = fs.readFileSync(dbPath, 'utf-8');
        const dbJson = JSON.parse(data);
        dbJson[key] = collection;
        fs.writeFileSync(dbPath, JSON.stringify(dbJson, null, 2), 'utf-8');
        return true;
      } catch (e) {
        console.error("Error writing database file", e);
        return false;
      }
    }
  }
};
