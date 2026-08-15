import { dbService } from '../services/dbService.js';
import { notificationService } from '../notifications/notificationService.js';
import { logAuditEvent } from '../services/auditService.js';
import { sheetsService } from '../services/sheetsService.js';
import { StorageService } from '../services/storageService.js';

export async function getBookings(req, res) {
  try {
    const bookings = await dbService.getCollection('bookings') || [];
    res.json(bookings);
  } catch (err) {
    console.error('[BookingController] getBookings error:', err);
    res.status(500).json({ error: "Failed to retrieve bookings." });
  }
}

export async function createBooking(req, res) {
  const { 
    id, 
    astrologerName, 
    astrologerProfileId, 
    serviceId, 
    packageName, 
    amount, 
    astroFee, 
    clientName, 
    yajmaanDob, 
    clientMobile, 
    poojaPlace, 
    city, 
    date, 
    paymentTxnId, 
    screenshot,
    notes 
  } = req.body;

  if (!clientName || !clientMobile || !date) {
    return res.status(400).json({ error: "Missing required booking details (Yajmaan Name, Mobile Number, or Pooja Performance Date)." });
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

    // Upload payment screenshot to Supabase Storage if present
    let screenshotUrl = screenshot || null;
    if (screenshot && screenshot.startsWith('data:image')) {
      screenshotUrl = await StorageService.uploadBase64(screenshot, 'booking-receipts', `receipt_${bookingId}`);
    }

    const initialStatus = (paymentTxnId || screenshotUrl) ? "submitted" : "created";

    const newBooking = {
      id: bookingId,
      astrologerName: astrologerName || "Astrologer",
      astrologerProfileId: astrologerProfileId || "DEV-AST-000001",
      serviceId: serviceId || "pooja",
      packageName: packageName || "Standard Pooja",
      amount: Number(amount) || 0,
      astroFee: Number(astroFee) || 0,
      clientName,
      yajmaanDob: yajmaanDob || "",
      clientMobile,
      poojaPlace: poojaPlace || city || "",
      city: city || "",
      date,
      status: initialStatus,
      paymentReference: paymentTxnId || "",
      paymentMethod: paymentTxnId ? "UPI" : "",
      screenshot: screenshotUrl,
      screenshotUrl: screenshotUrl,
      submittedAt: (paymentTxnId || screenshotUrl) ? new Date().toISOString() : null,
      notes: notes || "",
      createdAt: new Date().toISOString()
    };

    bookings.unshift(newBooking);
    await dbService.saveCollection('bookings', bookings);

    // Retrieve astrologer profile for notifications
    const users = await dbService.getCollection('users') || [];
    const astroUser = users.find(u => u.profileId === astrologerProfileId || u.name === astrologerName);
    const recipientContact = astroUser ? (astroUser.email || astroUser.phone) : (astrologerProfileId || "astrologer");

    await logAuditEvent(recipientContact, `Pooja Booking Created: ${bookingId}`);

    await notificationService.sendNotification({
      userId: recipientContact,
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
    console.error('[BookingController] createBooking error:', err);
    res.status(500).json({ error: "Failed to create booking." });
  }
}

export async function submitPayment(req, res) {
  const { id } = req.params;
  const { txnId, screenshot } = req.body;

  if (!txnId && !screenshot) {
    return res.status(400).json({ error: "Transaction ID reference or screenshot is required." });
  }

  try {
    const bookings = await dbService.getCollection('bookings') || [];
    const bookingIndex = bookings.findIndex(b => b.id === id);

    if (bookingIndex === -1) {
      return res.status(404).json({ error: "Booking not found." });
    }

    const booking = bookings[bookingIndex];

    // Upload receipt to Supabase Storage if base64
    let screenshotUrl = booking.screenshot;
    if (screenshot && screenshot.startsWith('data:image')) {
      screenshotUrl = await StorageService.uploadBase64(screenshot, 'booking-receipts', `receipt_${id}`);
    } else if (screenshot) {
      screenshotUrl = screenshot;
    }

    const updatedBooking = {
      ...booking,
      status: "submitted",
      txnId: txnId || booking.txnId,
      paymentReference: txnId || booking.paymentReference,
      screenshot: screenshotUrl,
      screenshotUrl: screenshotUrl,
      submittedAt: new Date().toISOString()
    };

    bookings[bookingIndex] = updatedBooking;
    await dbService.saveCollection('bookings', bookings);
    
    // Retrieve user details to log correctly
    const users = await dbService.getCollection('users') || [];
    const astroUser = users.find(u => u.profileId === updatedBooking.astrologerProfileId || u.name === updatedBooking.astrologerName);
    const userIdForAudit = astroUser ? (astroUser.email || astroUser.phone) : (updatedBooking.astrologerProfileId || "astrologer");
    
    await logAuditEvent(userIdForAudit, `Payment Submitted for Booking ${id} - UTR: ${txnId || 'Screenshot'}`);

    // Notify Admin of Payment Verification Pending
    await notificationService.sendNotification({
      userId: "admin",
      event: "Booking Submitted",
      title: "Payment Verification Pending",
      body: `Payment submitted for Booking ID: ${id}. UTR/TxnID: ${txnId || 'Image Attached'}. Verification is required.`,
      relatedBookingId: id,
      relatedProfileId: updatedBooking.astrologerProfileId
    });

    // Trigger future Google Sheets sync for payment
    await sheetsService.syncPayment({ bookingId: id, txnId, amount: updatedBooking.amount });

    res.json(updatedBooking);
  } catch (err) {
    console.error('[BookingController] submitPayment error:', err);
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
    const astroUser = users.find(u => u.profileId === updatedBooking.astrologerProfileId || u.name === updatedBooking.astrologerName);
    const recipientContact = astroUser ? (astroUser.email || astroUser.phone) : (updatedBooking.astrologerProfileId || "astrologer");

    await logAuditEvent("admin", `Booking ${id} Status Updated to ${status}`);

    // Create and add status notifications
    const targetStatus = (status || "").toLowerCase();
    if (["approved", "cancelled", "rejected", "payment_verified", "submitted", "created", "completed"].includes(targetStatus)) {
      const eventName = targetStatus === "approved" ? "Booking Approved" : (targetStatus === "payment_verified" ? "Booking Submitted" : (targetStatus === "completed" ? "Booking Completed" : "Booking Rejected"));
      const notifTitle = targetStatus === "approved" ? "Booking Confirmed" : (targetStatus === "payment_verified" ? "Payment Verified" : (targetStatus === "completed" ? "Booking Completed" : (targetStatus === "cancelled" ? "Booking Cancelled" : "Booking Rejected")));
      const notifBody = targetStatus === "approved" 
        ? `Your booking request for ${updatedBooking.packageName} has been confirmed. Booking ID: ${updatedBooking.id}.`
        : (targetStatus === "payment_verified"
          ? `Your payment for booking ${updatedBooking.id} has been verified.`
          : (targetStatus === "completed"
            ? `Your booking ${updatedBooking.id} for ${updatedBooking.packageName} has been completed successfully.`
            : (targetStatus === "cancelled"
              ? `Your booking ${updatedBooking.id} has been cancelled.`
              : `Your booking request for ${updatedBooking.packageName} could not be approved. Reason: Payment could not be verified.`)));

      await notificationService.sendNotification({
        userId: recipientContact,
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
    console.error('[BookingController] updateBookingStatus error:', err);
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

    // Delete screenshot from storage bucket if present
    if (bookingToDelete.screenshot && bookingToDelete.screenshot.includes('/storage/v1/object/public/')) {
      await StorageService.deleteFile(bookingToDelete.screenshot, 'booking-receipts');
    }

    const filteredBookings = bookings.filter(b => b.id !== id);
    await dbService.saveCollection('bookings', filteredBookings);

    await logAuditEvent("admin", `Booking ${id} Deleted by Admin`);
    res.json({ success: true, message: "Booking deleted successfully." });
  } catch (err) {
    console.error('[BookingController] deleteBooking error:', err);
    res.status(500).json({ error: "Failed to delete booking." });
  }
}
