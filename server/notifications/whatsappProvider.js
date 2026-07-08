export class WhatsappProvider {
  async sendWhatsapp(to, templateName, components) {
    // future integration logic to send WhatsApp message via Meta API
    console.log(`\n================== [WHATSAPP DISPATCH STUB] ==================`);
    console.log(`[WHATSAPP SENDING] To: ${to}`);
    console.log(`Template: ${templateName}`);
    console.log(`Components:`, components);
    console.log(`==============================================================\n`);
    return true;
  }
}
