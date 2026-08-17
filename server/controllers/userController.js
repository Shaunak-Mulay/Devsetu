import { dbService } from '../services/dbService.js';
import { notificationService } from '../notifications/notificationService.js';
import { logAuditEvent } from '../services/auditService.js';
import { sheetsService } from '../services/sheetsService.js';
import { sanitizeUser, sanitizeUsers } from '../utils/serializers.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

export async function getUsers(req, res) {
  try {
    const users = await dbService.getCollection('users') || [];
    res.json(sanitizeUsers(users));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve users." });
  }
}

export async function updateUserStatus(req, res) {
  const { email } = req.params;
  const { accountStatus } = req.body; // 'approved', 'rejected', 'suspended', 'blocked'
  
  if (!accountStatus || !['approved', 'rejected', 'suspended', 'blocked'].includes(accountStatus)) {
    return res.status(400).json({ error: "Invalid account status parameter." });
  }

  try {
    const users = await dbService.getCollection('users') || [];
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
          status: accountStatus.charAt(0).toUpperCase() + accountStatus.slice(1), 
          approved: isApproved 
        };
        return updatedUser;
      }
      return u;
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    await dbService.saveCollection('users', updatedUsers);

    await logAuditEvent(updatedUser.email || updatedUser.phone, `Account Status Updated to ${accountStatus} by Admin`);

    const { profileId } = updatedUser;

    if (accountStatus === 'approved' || accountStatus === 'rejected') {
      await notificationService.sendNotification({
        userId: updatedUser.email || updatedUser.phone,
        event: accountStatus === 'approved' ? "Registration Approved" : "Registration Rejected",
        title: accountStatus === 'approved' ? "Account Approved" : "Registration Rejected",
        body: accountStatus === 'approved'
          ? `Your account (${profileId}) has been approved. You can now log in.`
          : `Your registration request for account (${profileId}) has been rejected. Please contact support.`,
        relatedProfileId: profileId
      });
    } else if (accountStatus === 'suspended' || accountStatus === 'blocked') {
      await notificationService.sendNotification({
        userId: updatedUser.email || updatedUser.phone,
        event: "Registration Rejected", 
        title: "Account Suspended",
        body: `Your account (${profileId}) has been suspended by the administrator.`,
        relatedProfileId: profileId
      });
    }

    // Trigger future Google Sheets sync
    await sheetsService.syncAstrologer(updatedUser);

    res.json(sanitizeUser(updatedUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user status." });
  }
}

export async function updateUserProfile(req, res) {
  const { email } = req.params;
  const updateData = req.body;
  try {
    const users = await dbService.getCollection('users') || [];
    let updatedUser = null;
    const searchVal = email.toLowerCase();
    
    const nextUsers = users.map(u => {
      const matchEmail = u.email && u.email.toLowerCase() === searchVal;
      const matchPhone = u.phone === email || u.mobile === email;
      const matchProfile = u.profileId && u.profileId.toLowerCase() === searchVal;
      if (matchEmail || matchPhone || matchProfile) {
        updatedUser = {
          ...u,
          ...updateData,
          password: u.password,
          salt: u.salt,
          profileId: u.profileId,
          role: u.role
        };
        return updatedUser;
      }
      return u;
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    await dbService.saveCollection('users', nextUsers);
    await logAuditEvent(updatedUser.email || updatedUser.phone, "Profile Details Edited by Admin");
    
    // Trigger future Google Sheets sync
    await sheetsService.syncAstrologer(updatedUser);

    res.json(sanitizeUser(updatedUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user profile." });
  }
}

export async function deleteUser(req, res) {
  const { email } = req.params;
  try {
    const users = await dbService.getCollection('users') || [];
    const searchVal = email.toLowerCase();
    
    const userToDelete = users.find(u => 
      (u.email && u.email.toLowerCase() === searchVal) || 
      u.phone === email || 
      u.mobile === email || 
      (u.profileId && u.profileId.toLowerCase() === searchVal)
    );

    if (!userToDelete) {
      return res.status(404).json({ error: "User not found." });
    }

    // Delete user from Supabase Auth if Supabase is configured
    if (isSupabaseConfigured()) {
      try {
        let authUserId = userToDelete.authUserId || userToDelete.auth_user_id;

        // 1. If authUserId is not directly stored on user object, check public.profiles table
        if (!authUserId) {
          const targetEmail = userToDelete.email ? userToDelete.email.toLowerCase() : null;
          const targetPhone = userToDelete.phone || userToDelete.mobile;
          const targetProfileId = userToDelete.profileId ? userToDelete.profileId.toLowerCase() : null;

          const filterConditions = [];
          if (targetProfileId) filterConditions.push(`profile_id.ilike.${targetProfileId}`);
          if (targetEmail) filterConditions.push(`email.ilike.${targetEmail}`);
          if (targetPhone) filterConditions.push(`phone.eq.${targetPhone}`);

          if (filterConditions.length > 0) {
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('auth_user_id')
              .or(filterConditions.join(','))
              .maybeSingle();

            if (profile?.auth_user_id) {
              authUserId = profile.auth_user_id;
            }
          }
        }

        // 2. If still not found, search Supabase Auth listUsers by email or phone
        if (!authUserId) {
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          if (listData?.users?.length > 0) {
            const cleanPhone = (userToDelete.phone || userToDelete.mobile || '').replace(/[^0-9]/g, '');
            const userEmail = userToDelete.email ? userToDelete.email.toLowerCase() : null;

            const matchedAuthUser = listData.users.find(au => {
              const auEmail = au.email ? au.email.toLowerCase() : '';
              const auPhone = (au.phone || au.user_metadata?.phone || '').replace(/[^0-9]/g, '');
              const auProfileId = (au.user_metadata?.profile_id || '').toLowerCase();

              const emailMatch = userEmail && auEmail === userEmail;
              const phoneMatch = cleanPhone && auPhone.includes(cleanPhone);
              const profileMatch = userToDelete.profileId && auProfileId === userToDelete.profileId.toLowerCase();

              return emailMatch || phoneMatch || profileMatch;
            });

            if (matchedAuthUser) {
              authUserId = matchedAuthUser.id;
            }
          }
        }

        // 3. Delete from Supabase Auth admin API
        if (authUserId) {
          const { error: deleteAuthErr } = await supabaseAdmin.auth.admin.deleteUser(authUserId);
          if (deleteAuthErr) {
            console.warn('[Supabase Auth Delete Error]:', deleteAuthErr.message);
          } else {
            console.log(`[Supabase Auth Delete] Successfully deleted auth user ${authUserId} (${userToDelete.email || userToDelete.profileId})`);
          }
        } else {
          console.warn('[Supabase Auth Delete] No corresponding Auth user ID found for:', userToDelete.email || userToDelete.profileId);
        }
      } catch (authErr) {
        console.error('[Supabase Auth Delete Exception]:', authErr.message);
      }
    }

    const filteredUsers = users.filter(u => u !== userToDelete);
    await dbService.saveCollection('users', filteredUsers);

    await logAuditEvent(userToDelete.email || userToDelete.phone, "Account Deleted from Auth and Database by Admin");
    res.json({ success: true, message: "User deleted successfully from Auth and Database." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user." });
  }
}

export async function approveAllPendingUsers(req, res) {
  try {
    const users = await dbService.getCollection('users') || [];
    let count = 0;
    const updatedUsers = users.map(u => {
      if (u.role === 'astrologer' && u.accountStatus !== 'approved') {
        count++;
        return {
          ...u,
          accountStatus: 'approved',
          status: 'Approved',
          approved: true
        };
      }
      return u;
    });

    if (count > 0) {
      await dbService.saveCollection('users', updatedUsers);
      await logAuditEvent('Admin', `Bulk approved ${count} pending astrologers`);
    }

    res.json({ success: true, count, message: `Successfully approved ${count} pending astrologers.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve all users." });
  }
}
