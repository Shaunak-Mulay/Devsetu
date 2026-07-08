import { dbService } from '../services/dbService.js';
import { notificationService } from '../notifications/notificationService.js';
import { logAuditEvent } from '../services/auditService.js';
import { sheetsService } from '../services/sheetsService.js';

export async function getUsers(req, res) {
  try {
    const users = await dbService.getCollection('users') || [];
    res.json(users);
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

    res.json(updatedUser);
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

    res.json(updatedUser);
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

    const filteredUsers = users.filter(u => u !== userToDelete);
    await dbService.saveCollection('users', filteredUsers);

    await logAuditEvent(userToDelete.email || userToDelete.phone, "Account Deleted by Admin");
    res.json({ success: true, message: "User deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user." });
  }
}
