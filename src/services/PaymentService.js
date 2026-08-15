// Reusable service to manage payment configuration and assets.
// Designed to easily transition from a local placeholder to a dynamic backend API in the future.

class PaymentService {
  constructor() {
    const saved = localStorage.getItem("devsetu_api_base");
    if (saved && !saved.includes("vercel.app")) {
      this.apiBase = saved.replace(/\/+$/, "");
    } else {
      this.apiBase = "https://devsetu-4wav.onrender.com";
    }
  }

  /**
   * Retrieves the configured Payment QR Code image URL.
   * Future implementation will perform a fetch to: GET /api/payment/qr
   * 
   * @returns {Promise<string>} The QR Code URL.
   */
  async getPaymentQRCodeUrl() {
    // Production Note:
    // This placeholder QR is only for repository safety.
    // The production QR may later be loaded dynamically
    // from the backend without changing the UI.
    
    // Future API integration structure (Architectural Layout Only):
    /*
    try {
      const response = await fetch(`${this.apiBase}/api/payment/qr`);
      if (response.ok) {
        const data = await response.json();
        return data.qrUrl; // Remote QR from Cloud Storage
      }
    } catch (error) {
      console.error("Failed to fetch production QR from API:", error);
    }
    */
    
    // Local placeholder fallback for repository safety.
    return "/payment_qr_placeholder.jpeg";
  }
}

export const paymentService = new PaymentService();
