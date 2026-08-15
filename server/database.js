import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { hashPassword } from './utils/crypto.js';
import { supabaseAdmin, isSupabaseConfigured } from './config/supabase.js';

// Load directory configurations
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables specifically from the server/.env file
dotenv.config({ path: path.resolve(__dirname, '.env') });
const dbPath = path.join(__dirname, 'database.json');
const serviceAccountPath = path.join(__dirname, 'service-account.json');

let firestoreDb = null;
let useFirebase = false;

// Attempt to connect to Google Cloud Firestore (Firebase) if not using Supabase
if (!isSupabaseConfigured() && fs.existsSync(serviceAccountPath) && process.env.USE_LOCAL_DB !== 'true') {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    const initOptions = {
      credential: admin.cert(serviceAccount)
    };
    initOptions.databaseURL = process.env.FIREBASE_DATABASE_URL || "https://devsetu-c9cae-default-rtdb.firebaseio.com";

    admin.initializeApp(initOptions);
    firestoreDb = getFirestore();
    firestoreDb.settings({ ignoreUndefinedProperties: true });
    useFirebase = true;
    console.log('[Database] Connected successfully to Cloud Firestore (Firebase).');
  } catch (err) {
    console.error('[Database] Failed to initialize Firebase connection. Using JSON fallback.', err);
  }
} else if (isSupabaseConfigured()) {
  console.log('[Database] Connected successfully to Supabase PostgreSQL & Storage.');
} else {
  console.log('[Database] Running in local file database mode (database.json).');
}

const adminEmail = process.env.ADMIN_EMAIL || "devsetuconnect@gmail.com";
const adminPassword = process.env.ADMIN_PASSWORD || "AdminP@ss123!";
const astroPin = process.env.DEFAULT_ASTRO_PIN || "000000";

// Hash admin credentials
const { salt: adminSalt, hash: adminHash } = hashPassword(adminPassword);
const { salt: astro1Salt, hash: astro1Hash } = hashPassword(astroPin);
const { salt: astro2Salt, hash: astro2Hash } = hashPassword(astroPin);

const defaultData = {
  users: [
    {
      adminId: "ADM00001",
      profileId: "DEV-ADM-00001",
      name: "System Administrator",
      email: adminEmail,
      phone: "9763147067",
      mobile: "9763147067",
      password: adminHash,
      salt: adminSalt,
      accountStatus: "approved",
      role: "admin",
      sessionVersion: 1
    },
    {
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
    }
  ],
  bookings: [],
  chats: [],
  tickets: [],
  notifications: [],
  otps: [],
  audit_logs: [],
  pin_reset_requests: [],
  email_logs: [],
  settings: [
    { id: 'email_settings', enabled: true }
  ]
};

// Map collection names to Supabase tables
const collectionToTable = {
  users: 'profiles',
  bookings: 'bookings',
  tickets: 'support_tickets',
  chats: 'support_chats',
  notifications: 'notifications',
  pin_reset_requests: 'pin_reset_requests',
  audit_logs: 'audit_logs',
  email_logs: 'email_logs',
  otps: 'otps',
  settings: 'app_settings'
};

// Convert snake_case object from Supabase to camelCase
function toCamelCase(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    newObj[camelKey] = value;
  }
  // Alias mapping for frontend compatibility
  if (newObj.passwordHash) newObj.password = newObj.passwordHash;
  if (newObj.passwordSalt) newObj.salt = newObj.passwordSalt;
  if (newObj.phone && !newObj.mobile) newObj.mobile = newObj.phone;
  if (newObj.screenshotUrl && !newObj.screenshot) newObj.screenshot = newObj.screenshotUrl;
  if (newObj.paymentReference) {
    newObj.paymentTxnId = newObj.paymentReference;
    newObj.txnId = newObj.paymentReference;
  }
  if (newObj.lastUpdateText && !newObj.lastUpdate) newObj.lastUpdate = newObj.lastUpdateText;
  if (newObj.userIdentifier && !newObj.user) newObj.user = newObj.userIdentifier;
  return newObj;
}

const validColumnsByTable = {
  profiles: new Set([
    'id', 'auth_user_id', 'profile_id', 'admin_id', 'name', 'email', 'phone', 
    'password_hash', 'password_salt', 'role', 'account_status', 'state', 
    'district', 'city', 'experience', 'specialization', 'avatar_url', 
    'device_token', 'notification_preferences', 'session_version', 'created_at', 'updated_at'
  ]),
  bookings: new Set([
    'id', 'astrologer_id', 'astrologer_profile_id', 'astrologer_name', 'service_id', 
    'package_name', 'amount', 'astro_fee', 'client_name', 'client_mobile', 
    'yajmaan_dob', 'pooja_place', 'city', 'date', 'status', 'payment_reference', 
    'payment_method', 'screenshot_url', 'notes', 'submitted_at', 'approved_at', 
    'completed_at', 'created_at', 'updated_at'
  ]),
  support_tickets: new Set([
    'id', 'user_id', 'profile_id', 'category', 'subject', 'status', 'priority', 
    'last_update_text', 'resolved_at', 'created_at', 'updated_at'
  ]),
  support_chats: new Set([
    'id', 'ticket_id', 'sender_id', 'sender_role', 'sender_name', 'text', 
    'attachment_url', 'category', 'read', 'created_at'
  ]),
  notifications: new Set([
    'id', 'user_id', 'user_email', 'user_phone', 'title', 'body', 'type', 
    'priority', 'related_booking_id', 'related_profile_id', 'read', 'created_at'
  ]),
  pin_reset_requests: new Set([
    'id', 'profile_id', 'name', 'email', 'phone', 'status', 'reason', 
    'temp_pin', 'reset_completed_at', 'created_at', 'updated_at'
  ]),
  audit_logs: new Set([
    'id', 'user_identifier', 'action', 'ip_address', 'metadata', 'timestamp'
  ]),
  otps: new Set([
    'id', 'identity', 'code', 'attempts', 'expires_at', 'created_at'
  ]),
  app_settings: new Set([
    'key', 'value', 'updated_at'
  ])
};

// Convert camelCase object to snake_case for Supabase
function toSnakeCase(obj, collectionKey) {
  if (!obj || typeof obj !== 'object') return obj;
  const tableName = collectionToTable[collectionKey] || collectionKey;
  const validColumns = validColumnsByTable[tableName];
  const newObj = {};

  // Custom field mappings before snake_case conversion
  const mappedObj = { ...obj };
  const nowIso = new Date().toISOString();

  if (collectionKey === 'users') {
    if (!mappedObj.id) mappedObj.id = crypto.randomUUID();
    if (!mappedObj.profileId && !mappedObj.profile_id) {
      mappedObj.profileId = 'DEV-AST-' + Math.floor(100000 + Math.random() * 900000);
    }
    if (!mappedObj.role) mappedObj.role = 'astrologer';
    if (!mappedObj.accountStatus) mappedObj.accountStatus = 'approved';
    if (!mappedObj.sessionVersion && !mappedObj.session_version) mappedObj.session_version = 1;
    if (mappedObj.password) mappedObj.passwordHash = mappedObj.password;
    if (mappedObj.salt) mappedObj.passwordSalt = mappedObj.salt;
    if (mappedObj.mobile && !mappedObj.phone) mappedObj.phone = mappedObj.mobile;
    if (mappedObj.email === "") mappedObj.email = null;
  }
  if (collectionKey === 'bookings') {
    if (mappedObj.screenshot) mappedObj.screenshotUrl = mappedObj.screenshot;
    if ((mappedObj.paymentTxnId || mappedObj.txnId) && !mappedObj.paymentReference) {
      mappedObj.paymentReference = mappedObj.paymentTxnId || mappedObj.txnId;
    }
    if (!mappedObj.status) mappedObj.status = 'created';
  }
  if (collectionKey === 'tickets') {
    if (mappedObj.lastUpdate) mappedObj.lastUpdateText = mappedObj.lastUpdate;
  }
  if (collectionKey === 'audit_logs') {
    if (mappedObj.user && !mappedObj.userIdentifier) mappedObj.userIdentifier = mappedObj.user;
    if (typeof mappedObj.id === 'string') delete mappedObj.id; // Allow BIGINT auto-increment
  }
  if (collectionKey === 'notifications') {
    if (mappedObj.userId && typeof mappedObj.userId === 'string') {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mappedObj.userId);
      if (!isUuid) {
        if (mappedObj.userId.includes('@')) {
          if (!mappedObj.userEmail) mappedObj.userEmail = mappedObj.userId;
        } else {
          if (!mappedObj.userPhone) mappedObj.userPhone = mappedObj.userId;
        }
        delete mappedObj.userId;
      }
    }
  }
  if (collectionKey === 'otps') {
    if (!mappedObj.id) mappedObj.id = crypto.randomUUID();
    if (mappedObj.email && !mappedObj.identity) mappedObj.identity = mappedObj.email;
    if (mappedObj.phone && !mappedObj.identity) mappedObj.identity = mappedObj.phone;
  }

  // Ensure timestamps are always present for PostgreSQL NOT NULL constraints
  if (!mappedObj.createdAt && !mappedObj.created_at) mappedObj.created_at = nowIso;
  if (!mappedObj.updatedAt && !mappedObj.updated_at && validColumns && validColumns.has('updated_at')) mappedObj.updated_at = nowIso;

  for (const [key, value] of Object.entries(mappedObj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    // If table column whitelist exists, only keep valid columns
    if (!validColumns || validColumns.has(snakeKey)) {
      if (value === undefined) continue;
      newObj[snakeKey] = value === "" ? null : value;
    }
  }

  return newObj;
}

// Initialize database schemas / seedings
const initDb = async () => {
  if (isSupabaseConfigured()) {
    // Skip heavy background sync loops on Vercel serverless cold starts
    if (process.env.VERCEL || process.env.VERCEL === '1') {
      return;
    }
    console.log('[Database] Supabase is active. Synchronizing auth.users with public.profiles...');
    try {
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
      if (authData?.users && authData.users.length > 0) {
        for (const au of authData.users) {
          const email = au.email;
          const phone = au.phone || au.user_metadata?.phone || null;
          const isAdmin = email && (email.toLowerCase() === 'devsetuconnect@gmail.com' || au.user_metadata?.role === 'admin');
          
          await supabaseAdmin.from('profiles').upsert({
            auth_user_id: au.id,
            profile_id: au.user_metadata?.profile_id || (isAdmin ? 'DEV-ADM-00001' : ('DEV-AST-' + Math.floor(100000 + Math.random() * 900000))),
            admin_id: isAdmin ? (au.user_metadata?.admin_id || 'ADM00001') : null,
            name: au.user_metadata?.name || (email ? email.split('@')[0] : 'User'),
            email: email || null,
            phone: phone,
            role: isAdmin ? 'admin' : (au.user_metadata?.role || 'astrologer'),
            account_status: 'approved',
            session_version: 1
          }, { onConflict: 'auth_user_id' });
        }
        console.log(`[Database] Synchronized ${authData.users.length} auth.users with public.profiles.`);
      }
    } catch (e) {
      console.warn('[Database] Sync auth users notice:', e.message);
    }
    return;
  }

  if (useFirebase && firestoreDb) {
    try {
      const usersSnap = await firestoreDb.collection('users').limit(1).get();
      if (usersSnap.empty) {
        console.log('[Database] Cloud Firestore initialized with collections.');
      }
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
    }
  }
};

export const dbInitialized = initDb();

export const database = {
  getCollection: async (key) => {
    // 1. Supabase Mode
    if (isSupabaseConfigured()) {
      const tableName = collectionToTable[key] || key;
      try {
        let query = supabaseAdmin.from(tableName).select('*');
        
        // Sorting
        if (key === 'bookings' || key === 'notifications' || key === 'tickets') {
          query = query.order('created_at', { ascending: false });
        } else if (key === 'chats') {
          query = query.order('created_at', { ascending: true });
        } else if (key === 'audit_logs') {
          query = query.order('timestamp', { ascending: false });
        }

        const { data, error } = await query;
        if (error) {
          console.error(`[Database] Supabase error fetching ${tableName}:`, error.message);
          return defaultData[key] || [];
        }
        return (data || []).map(toCamelCase);
      } catch (err) {
        console.error(`[Database] Exception fetching ${tableName} from Supabase:`, err.message);
        return defaultData[key] || [];
      }
    }

    // 2. Firebase Mode
    if (useFirebase && firestoreDb) {
      try {
        const snapshot = await firestoreDb.collection(key).get();
        const list = snapshot.docs.map(doc => doc.data());
        if (key === 'bookings' || key === 'notifications') {
          return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (key === 'chats') {
          return list.sort((a, b) => Number(a.id) - Number(b.id));
        }
        return list;
      } catch (err) {
        console.error(`[Database] Error getting collection ${key} from Cloud Firestore`, err);
        return [];
      }
    }

    // 3. Fallback Local JSON Mode
    try {
      const data = fs.readFileSync(dbPath, 'utf-8');
      const dbJson = JSON.parse(data);
      return dbJson[key] || defaultData[key] || [];
    } catch (e) {
      console.error("Error reading database file", e);
      return defaultData[key] || [];
    }
  },

  saveCollection: async (key, collection) => {
    // 1. Supabase Mode
    if (isSupabaseConfigured()) {
      const tableName = collectionToTable[key] || key;
      try {
        const rows = collection.map(item => toSnakeCase(item, key));
        if (rows.length === 0) {
          // Truncate/delete all rows if array is empty (e.g. during clean-db)
          await supabaseAdmin.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');
          return true;
        }
        
        // Upsert rows into Supabase with deduplication by conflict key
        const conflictColumn = key === 'users' ? 'profile_id' : (key === 'settings' ? 'key' : (key === 'otps' ? 'identity' : 'id'));
        const uniqueMap = new Map();
        rows.forEach(r => {
          if (r[conflictColumn]) {
            uniqueMap.set(r[conflictColumn], r);
          }
        });
        const dedupedRows = uniqueMap.size > 0 ? Array.from(uniqueMap.values()) : rows;

        const { error } = await supabaseAdmin.from(tableName).upsert(dedupedRows, {
          onConflict: conflictColumn
        });

        if (error) {
          console.error(`[Database] Supabase upsert error on ${tableName}:`, error.message);
          return false;
        }

        // Sync deletions for users and bookings
        if (key === 'users') {
          const currentProfileIds = rows.map(r => r.profile_id).filter(Boolean);
          if (currentProfileIds.length > 0) {
            const filterIds = `(${currentProfileIds.map(p => `"${p}"`).join(',')})`;
            await supabaseAdmin.from('profiles').delete().not('profile_id', 'in', filterIds);
          }
        } else if (key === 'bookings') {
          const currentBookingIds = rows.map(r => r.id).filter(Boolean);
          if (currentBookingIds.length > 0) {
            const filterIds = `(${currentBookingIds.map(p => `"${p}"`).join(',')})`;
            await supabaseAdmin.from('bookings').delete().not('id', 'in', filterIds);
          }
        }

        return true;
      } catch (err) {
        console.error(`[Database] Exception saving ${tableName} to Supabase:`, err.message);
        return false;
      }
    }

    // 2. Firebase Mode
    if (useFirebase && firestoreDb) {
      try {
        const snapshot = await firestoreDb.collection(key).get();
        const currentIds = new Set(snapshot.docs.map(doc => doc.id));
        const nextIds = new Set();
        const promises = [];

        collection.forEach(item => {
          const docId = (key === 'users')
            ? (item.email || item.phone || item.profileId)
            : (key === 'otps' ? (item.email || item.phone) : (key === 'chats' ? String(item.id) : item.id));
          if (!docId) return;
          const ref = firestoreDb.collection(key).doc(docId);
          promises.push(ref.set(item));
          nextIds.add(docId);
        });

        currentIds.forEach(id => {
          if (!nextIds.has(id)) {
            promises.push(firestoreDb.collection(key).doc(id).delete());
          }
        });

        await Promise.all(promises);
        return true;
      } catch (err) {
        console.error(`[Database] Error saving collection ${key} to Cloud Firestore`, err);
        return false;
      }
    }

    // 3. Fallback Local JSON Mode
    try {
      let dbJson = {};
      if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, 'utf-8');
        dbJson = JSON.parse(data);
      }
      dbJson[key] = collection;
      fs.writeFileSync(dbPath, JSON.stringify(dbJson, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error("Error writing database file", e);
      return false;
    }
  }
};
