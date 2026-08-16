// Reusable service to manage payment configuration and assets.

class PaymentService {
  constructor() {
    if (import.meta.env.VITE_API_BASE) {
      this.apiBase = import.meta.env.VITE_API_BASE.replace(/\/+$/, "");
      return;
    }
    const saved = localStorage.getItem("devsetu_api_base");
    if (saved && !saved.includes("onrender.com") && !saved.includes("localhost") && !saved.includes("127.0.0.1")) {
      this.apiBase = saved.replace(/\/+$/, "");
    } else {
      this.apiBase = "https://devsetu-eta.vercel.app";
    }
  }

  /**
   * Retrieves the configured Payment QR Code image URL.
   * @returns {Promise<string>} The QR Code URL.
   */
  async getPaymentQRCodeUrl() {
    try {
      const response = await fetch(`${this.apiBase}/api/payment/qr`);
      if (response.ok) {
        const data = await response.json();
        return data.qrUrl || "/payment_qr_placeholder.jpeg";
      }
    } catch (error) {
      console.warn("Using fallback QR asset:", error.message);
    }
    return "/payment_qr_placeholder.jpeg";
  }
}

export const paymentService = new PaymentService();
