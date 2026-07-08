import express from 'express';
import { getPinResets, updatePinResetStatus, resetPin, getAuditLogs } from '../controllers/pinResetController.js';
import { getEmailLogs, resendEmailLog, getSmtpHealth, sendTestEmail, getSmtpSettings, updateSmtpSettings } from '../controllers/emailController.js';

const router = express.Router();

router.get('/pin-resets', getPinResets);
router.put('/pin-resets/:id/status', updatePinResetStatus);
router.post('/pin-resets/:id/reset', resetPin);
router.get('/audit-logs', getAuditLogs);

// SMTP Email Management
router.get('/email-logs', getEmailLogs);
router.post('/email-logs/:id/resend', resendEmailLog);
router.get('/smtp/health', getSmtpHealth);
router.post('/smtp/test', sendTestEmail);
router.get('/smtp/settings', getSmtpSettings);
router.post('/smtp/settings', updateSmtpSettings);

export default router;
