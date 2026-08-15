import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { supabaseAdmin, isSupabaseConfigured } from './config/supabase.js';
import { StorageService } from './services/storageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server/.env
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function runMigration() {
  console.log("===============================================================");
  console.log("       DEVSETU CONNECT -> SUPABASE DATA MIGRATION ENGINE       ");
  console.log("===============================================================\n");

  if (!isSupabaseConfigured()) {
    console.error("❌ ERROR: Supabase is not configured in server/.env.");
    console.error("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running migration.");
    process.exit(1);
  }

  const dbJsonPath = path.join(__dirname, 'database.json');
  if (!fs.existsSync(dbJsonPath)) {
    console.error(`❌ ERROR: database.json not found at: ${dbJsonPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(dbJsonPath, 'utf-8');
  const dbData = JSON.parse(rawData);

  console.log(`[1/7] Migrating Users & Syncing with Supabase auth.users (${dbData.users?.length || 0} records)...`);
  if (dbData.users && dbData.users.length > 0) {
    for (const u of dbData.users) {
      let authUserId = null;

      // 1. Create or fetch Supabase Auth user in auth.users
      if (u.email) {
        try {
          const formattedPhone = (u.phone || u.mobile) ? ((u.phone || u.mobile).startsWith('+') ? (u.phone || u.mobile) : `+91${u.phone || u.mobile}`) : undefined;
          const defaultPassword = u.role === 'admin' ? (process.env.ADMIN_PASSWORD || "AdminP@ss123!") : (process.env.DEFAULT_ASTRO_PIN || "000000");
          
          const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: u.email,
            password: defaultPassword,
            phone: formattedPhone,
            email_confirm: true,
            phone_confirm: true,
            user_metadata: {
              role: u.role || 'astrologer',
              profile_id: u.profileId,
              admin_id: u.adminId || null,
              name: u.name,
              phone: u.phone || u.mobile,
              account_status: u.accountStatus || 'approved'
            }
          });

          if (!authError && authUser?.user) {
            authUserId = authUser.user.id;
            console.log(`  -> Synced user ${u.email} to Supabase auth.users (ID: ${authUserId})`);
          } else if (authError && authError.message.includes('already registered')) {
            // Find existing user ID
            const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
            const existing = listData?.users?.find(usr => usr.email?.toLowerCase() === u.email?.toLowerCase());
            if (existing) authUserId = existing.id;
          }
        } catch (err) {
          console.warn(`  ⚠️ Could not create auth.users entry for ${u.email}:`, err.message);
        }
      }

      // 2. Upsert into public.profiles
      const profileRow = {
        auth_user_id: authUserId,
        profile_id: u.profileId || `DEV-AST-${Date.now()}`,
        admin_id: u.adminId || null,
        name: u.name || 'User',
        email: u.email || null,
        phone: u.phone || u.mobile || '0000000000',
        password_hash: u.password || null,
        password_salt: u.salt || null,
        role: u.role || 'astrologer',
        account_status: u.accountStatus || 'pending',
        state: u.state || 'Maharashtra',
        district: u.district || null,
        city: u.city || 'Pune',
        experience: u.experience || '1 Year',
        specialization: u.specialization || null,
        session_version: u.sessionVersion || 1,
        created_at: u.createdAt || new Date().toISOString()
      };

      const { error } = await supabaseAdmin.from('profiles').upsert(profileRow, { onConflict: 'phone' });
      if (error) {
        console.warn(`⚠️ Warning: Failed to upsert profile for ${u.email || u.phone}:`, error.message);
      }
    }
    console.log("✅ Profiles & auth.users synchronized successfully.");
  }

  console.log(`\n[2/7] Migrating Bookings & Uploading Base64 Receipts (${dbData.bookings?.length || 0} records)...`);
  if (dbData.bookings && dbData.bookings.length > 0) {
    for (const b of dbData.bookings) {
      let screenshotUrl = b.screenshotUrl || null;

      // Check if booking has raw base64 image data
      if (b.screenshot && b.screenshot.startsWith('data:image')) {
        console.log(`  -> Uploading receipt image for booking ${b.id} to Supabase Storage...`);
        screenshotUrl = await StorageService.uploadBase64(b.screenshot, 'booking-receipts', `receipt_${b.id}`);
      }

      const bookingRow = {
        id: b.id,
        astrologer_name: b.astrologerName || 'Astrologer',
        astrologer_profile_id: b.astrologerProfileId || null,
        service_id: b.serviceId || 'pooja',
        package_name: b.packageName || 'Standard Package',
        amount: b.amount || 0,
        astro_fee: b.astroFee || 0,
        client_name: b.clientName || 'Client',
        client_mobile: b.clientMobile || '0000000000',
        yajmaan_dob: b.yajmaanDob || null,
        pooja_place: b.poojaPlace || b.city || null,
        city: b.city || null,
        date: b.date || new Date().toISOString().split('T')[0],
        status: b.status || 'created',
        payment_reference: b.paymentReference || b.txnId || null,
        payment_method: b.paymentMethod || 'UPI',
        screenshot_url: screenshotUrl,
        notes: b.notes || null,
        submitted_at: b.submittedAt || null,
        created_at: b.createdAt || new Date().toISOString()
      };

      const { error } = await supabaseAdmin.from('bookings').upsert(bookingRow, { onConflict: 'id' });
      if (error) {
        console.warn(`⚠️ Warning: Failed to upsert booking ${b.id}:`, error.message);
      }
    }
    console.log("✅ Bookings migrated successfully with storage receipts.");
  }

  console.log(`\n[3/7] Migrating Support Tickets (${dbData.tickets?.length || 0} records)...`);
  if (dbData.tickets && dbData.tickets.length > 0) {
    for (const t of dbData.tickets) {
      const ticketRow = {
        id: t.id,
        category: t.category || 'General Queries',
        subject: t.subject || 'Support Query',
        status: t.status || 'Open',
        last_update_text: t.lastUpdate || 'Just now',
        created_at: t.createdAt || new Date().toISOString()
      };
      await supabaseAdmin.from('support_tickets').upsert(ticketRow, { onConflict: 'id' });
    }
    console.log("✅ Support tickets migrated successfully.");
  }

  console.log(`\n[4/7] Migrating Support Chats (${dbData.chats?.length || 0} records)...`);
  if (dbData.chats && dbData.chats.length > 0) {
    for (const c of dbData.chats) {
      let attachmentUrl = c.attachmentUrl || null;
      if (c.attachment && c.attachment.startsWith('data:')) {
        attachmentUrl = await StorageService.uploadBase64(c.attachment, 'support-attachments', `chat_${c.id}`);
      }

      const chatRow = {
        ticket_id: c.ticketId || 'TK-1000',
        sender_role: c.sender === 'admin' ? 'admin' : 'astrologer',
        sender_name: c.sender || 'User',
        text: c.text || '',
        attachment_url: attachmentUrl,
        category: c.category || 'General Queries',
        read: !!c.read,
        created_at: c.createdAt || new Date().toISOString()
      };
      await supabaseAdmin.from('support_chats').insert(chatRow);
    }
    console.log("✅ Support chats migrated successfully.");
  }

  console.log(`\n[5/7] Migrating Notifications (${dbData.notifications?.length || 0} records)...`);
  if (dbData.notifications && dbData.notifications.length > 0) {
    for (const n of dbData.notifications) {
      const notifRow = {
        id: n.id || `NT-${Date.now()}`,
        user_email: n.userEmail || null,
        title: n.title || 'Notification',
        body: n.body || n.message || '',
        type: n.type || 'info',
        related_booking_id: n.relatedBookingId || null,
        related_profile_id: n.relatedProfileId || null,
        read: !!n.read,
        created_at: n.createdAt || new Date().toISOString()
      };
      await supabaseAdmin.from('notifications').upsert(notifRow, { onConflict: 'id' });
    }
    console.log("✅ Notifications migrated successfully.");
  }

  console.log(`\n[6/7] Migrating PIN Reset Requests (${dbData.pin_reset_requests?.length || 0} records)...`);
  if (dbData.pin_reset_requests && dbData.pin_reset_requests.length > 0) {
    for (const p of dbData.pin_reset_requests) {
      const pinRow = {
        id: p.id || `PR-${Date.now()}`,
        profile_id: p.profileId,
        name: p.name || 'User',
        email: p.email || null,
        phone: p.phone || '0000000000',
        status: p.status || 'pending',
        temp_pin: p.tempPin || null,
        created_at: p.createdAt || new Date().toISOString()
      };
      await supabaseAdmin.from('pin_reset_requests').upsert(pinRow, { onConflict: 'id' });
    }
    console.log("✅ PIN Reset Requests migrated successfully.");
  }

  console.log(`\n[7/7] Migrating Audit Logs (${dbData.audit_logs?.length || 0} records)...`);
  if (dbData.audit_logs && dbData.audit_logs.length > 0) {
    for (const a of dbData.audit_logs) {
      const auditRow = {
        user_identifier: a.user || a.userIdentifier || 'system',
        action: a.action || 'Event Logged',
        timestamp: a.timestamp || new Date().toISOString()
      };
      await supabaseAdmin.from('audit_logs').insert(auditRow);
    }
    console.log("✅ Audit logs migrated successfully.");
  }

  console.log("\n===============================================================");
  console.log("   🎉 SUPABASE DATA & AUTH MIGRATION COMPLETED SUCCESSFULLY!   ");
  console.log("===============================================================\n");
}

runMigration().catch(err => {
  console.error("Migration failed with error:", err);
  process.exit(1);
});
