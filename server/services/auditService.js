import { dbService } from './dbService.js';

export async function logAuditEvent(userId, event) {
  try {
    const audit_logs = await dbService.getCollection('audit_logs') || [];
    
    let eventDetails = {};
    if (typeof event === 'string') {
      eventDetails.event = event;
    } else {
      eventDetails = event;
    }

    const newLog = {
      id: "AUD-" + Math.floor(100000 + Math.random() * 900000),
      userId,
      ...eventDetails,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      timestamp: new Date().toISOString()
    };
    audit_logs.unshift(newLog);
    await dbService.saveCollection('audit_logs', audit_logs);
    console.log(`[AUDIT LOG] ${newLog.event || newLog.action || 'Action'} recorded for ${userId}`);
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
