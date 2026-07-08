import { dbService } from '../services/dbService.js';
import { notificationService } from '../notifications/notificationService.js';
import { logAuditEvent } from '../services/auditService.js';
import { sheetsService } from '../services/sheetsService.js';

export async function getBookings(req, res) {
  try {
    const bookings = await dbService.getCollection('bookings') || [];
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve bookings." });
  }
}

export async function createBooking(req, res) {
  const { id, astrologerName, astrologerProfileId, serviceId, packageName, amount, astroFee, clientName, clientMobile, city, date, notes } = req.body;
  if (!clientName || !clientMobile || !date) {
    return res.status(400).json({ error: "Missing required booking details." });
  }

  try {
    const bookings = await dbService.getCollection('bookings') || [];
    
    // Generate sequential Booking ID: DEV-BKG-XXXXXX
    const prefix = "DEV-BKG-";
    let maxNum = 0;
    
    bookings.forEach(b => {
      if (b.id && b.id.startsWith(prefix)) {
        const parts = b.id.split('-');
        const lastPart = parts[parts.length - 1];
        const num = parseInt(lastPart, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNum = String(maxNum + 1).padStart(6, '0');
    const bookingId = id || `${prefix}${nextNum}`;

    const newBooking = {
      id: bookingId,
      astrologerName,
      astrologerProfileId: astrologerProfileId || "DEV-AST-000001",
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
    await dbService.saveCollection('bookings', bookings);

    // Retrieve users to find the email and phone of the astrologer
    const users = await dbService.getCollection('users') || [];
    const astroUser = users.find(u => u.name === astrologerName || u.profileId === astrologerProfileId) || {
      email: 'shaunakmulay19@gmail.com',
      phone: '8698378379'
    };

    await logAuditEvent(astroUser.email || astroUser.phone, `Pooja Booking Created: ${bookingId}`);

    await notificationService.sendNotification({
      userId: astroUser.email || astroUser.phone,
      event: "Booking Submitted",
      title: "Booking Created Successfully",
      body: `Your booking has been created successfully. Booking ID: ${bookingId}. Complete payment to verify.`,
      relatedBookingId: bookingId,
      relatedProfileId: astrologerProfileId || "DEV-AST-000001"
    });

    // Trigger future Google Sheets sync
    await sheetsService.syncBooking(newBooking);

    res.status(201).json(newBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking." });
  }
}

export async function submitPayment(req, res) {
  const { id } = req.params;
  const { txnId, screenshot } = req.body;

  if (!txnId) {
    return res.status(400).json({ error: "Transaction ID reference is required." });
  }

  try {
    const bookings = await dbService.getCollection('bookings') || [];
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

    await dbService.saveCollection('bookings', nextBookings);
    
    // Retrieve user details to log correctly
    const users = await dbService.getCollection('users') || [];
    const astroUser = users.find(u => u.name === updatedBooking.astrologerName || u.profileId === updatedBooking.astrologerProfileId);
    const userIdForAudit = astroUser ? (astroUser.email || astroUser.phone) : (updatedBooking.astrologerName || "astrologer");
    
    await logAuditEvent(userIdForAudit, `Payment Submitted for Booking ${id} - UTR: ${txnId}`);

    // Notify Admin of Payment Verification Pending
    await notificationService.sendNotification({
      userId: "devsetuconnect@gmail.com",
      event: "Booking Submitted",
      title: "Payment Verification Pending",
      body: `Payment submitted for Booking ID: ${id}. UTR/TxnID: ${txnId}. Verification is required.`,
      relatedBookingId: id,
      relatedProfileId: updatedBooking.astrologerProfileId
    });

    // Trigger future Google Sheets sync for payment
    await sheetsService.syncPayment({ bookingId: id, txnId, amount: updatedBooking.amount });

    res.json(updatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit payment details." });
  }
}

export async function updateBookingStatus(req, res) {
  const { id } = req.params;
  const { status, astrologerName, astrologerProfileId } = req.body;

  try {
    const bookings = await dbService.getCollection('bookings') || [];
    let updatedBooking = null;

    const nextBookings = bookings.map(b => {
      if (b.id === id) {
        updatedBooking = { ...b };
        if (status) updatedBooking.status = status;
        if (astrologerName) updatedBooking.astrologerName = astrologerName;
        if (astrologerProfileId) updatedBooking.astrologerProfileId = astrologerProfileId;
        return updatedBooking;
      }
      return b;
    });

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    await dbService.saveCollection('bookings', nextBookings);

    // Retrieve users to find the email and phone of the astrologer
    const users = await dbService.getCollection('users') || [];
    const astroUser = (updatedBooking.astrologerName ? users.find(u => u.name === updatedBooking.astrologerName) : null) || 
                      users.find(u => u.profileId === updatedBooking.astrologerProfileId) || {
      email: 'shaunakmulay19@gmail.com',
      phone: '8698378379'
    };

    await logAuditEvent("admin", `Booking ${id} Status Updated to ${status}`);

    // Create and add status notifications
    const targetStatus = status.toLowerCase();
    if (["approved", "cancelled", "rejected", "payment_verified", "submitted", "created"].includes(targetStatus)) {
      const eventName = targetStatus === "approved" ? "Booking Approved" : (targetStatus === "payment_verified" ? "Booking Submitted" : "Booking Rejected");
      const notifTitle = targetStatus === "approved" ? "Booking Confirmed" : (targetStatus === "payment_verified" ? "Payment Verified" : (targetStatus === "cancelled" ? "Booking Cancelled" : "Booking Rejected"));
      const notifBody = targetStatus === "approved" 
        ? `Your booking request for ${updatedBooking.packageName} has been confirmed. Booking ID: ${updatedBooking.id}.`
        : (targetStatus === "payment_verified"
          ? `Your payment for booking ${updatedBooking.id} has been verified.`
          : (targetStatus === "cancelled"
            ? `Your booking ${updatedBooking.id} has been cancelled.`
            : `Your booking request for ${updatedBooking.packageName} could not be approved. Reason: Payment could not be verified.`));

      await notificationService.sendNotification({
        userId: astroUser.email || astroUser.phone,
        event: eventName,
        title: notifTitle,
        body: notifBody,
        relatedBookingId: updatedBooking.id,
        relatedProfileId: updatedBooking.astrologerProfileId
      });
    }

    // Trigger future Google Sheets sync
    await sheetsService.syncBooking(updatedBooking);

    res.json(updatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update booking status." });
  }
}

export async function deleteBooking(req, res) {
  const { id } = req.params;
  try {
    const bookings = await dbService.getCollection('bookings') || [];
    const bookingToDelete = bookings.find(b => b.id === id);
    if (!bookingToDelete) {
      return res.status(404).json({ error: "Booking not found." });
    }
    const filteredBookings = bookings.filter(b => b.id !== id);
    await dbService.saveCollection('bookings', filteredBookings);

    await logAuditEvent("admin", `Booking ${id} Deleted by Admin`);
    res.json({ success: true, message: "Booking deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete booking." });
  }
}
