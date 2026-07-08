import { config } from '../config/env.js';
import { saveToMockOutbox } from './emailProvider.js';

export class PushProvider {
  async sendPush(token, payload) {
    throw new Error("Method 'sendPush' must be implemented.");
  }
}

/**
 * FCM Push Notification Provider Stub & Implementation
 */
export class FcmPushProvider extends PushProvider {
  constructor() {
    super();
    this.fcmServerKey = config.fcm.serverKey;
    if (this.fcmServerKey) {
      console.log('[FcmPushProvider] FCM Server Key configured.');
    } else {
      console.log('[FcmPushProvider] FCM Server Key missing in env. Push notifications will be logged and bypassed.');
    }
  }

  async sendPush(token, payload) {
    const { title, body, type, relatedBookingId, relatedProfileId, deepLink } = payload;
    const timestamp = new Date().toISOString();

    console.log(`\n================== [FCM PUSH DISPATCH] ==================`);
    console.log(`[PUSH SENDING] To token: ${token}`);
    console.log(`Title: ${title}`);
    console.log(`Body: ${body}`);
    console.log(`Payload:`, { type, relatedBookingId, relatedProfileId, timestamp, deepLink });
    console.log(`==========================================================\n`);

    await saveToMockOutbox('push', token, title, JSON.stringify({ body, type, relatedBookingId, relatedProfileId, timestamp, deepLink }));

    if (!this.fcmServerKey) {
      console.log(`[FcmPushProvider] FCM not configured. Push to ${token.slice(0, 10)}... bypassed.`);
      return true;
    }

    try {
      const res = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Authorization": `key=${this.fcmServerKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: token,
          notification: {
            title,
            body,
            click_action: "FLUTTER_NOTIFICATION_CLICK"
          },
          data: {
            type,
            relatedBookingId,
            relatedProfileId,
            timestamp,
            deepLink
          }
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[FcmPushProvider] FCM Send API returned non-OK:`, errText);
        return false;
      }

      console.log(`[FcmPushProvider] Push successfully sent via FCM.`);
      return true;
    } catch (err) {
      console.error(`[FcmPushProvider] Failed to send FCM push:`, err.message);
      return false;
    }
  }
}
