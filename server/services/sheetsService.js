export const sheetsService = {
  syncBooking: async (booking) => {
    // future integration logic to sync booking to Google Sheets
    console.log(`[Google Sheets Service] Stub syncBooking triggered for ${booking.id}`);
    return true;
  },
  syncPayment: async (payment) => {
    // future integration logic to sync payment verification to Google Sheets
    console.log(`[Google Sheets Service] Stub syncPayment triggered`);
    return true;
  },
  syncAstrologer: async (astrologer) => {
    // future integration logic to sync astrologer details to Google Sheets
    console.log(`[Google Sheets Service] Stub syncAstrologer triggered for ${astrologer.profileId}`);
    return true;
  }
};
