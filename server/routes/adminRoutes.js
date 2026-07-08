import express from 'express';
import { getPinResets, updatePinResetStatus, resetPin, getAuditLogs } from '../controllers/pinResetController.js';

const router = express.Router();

router.get('/pin-resets', getPinResets);
router.put('/pin-resets/:id/status', updatePinResetStatus);
router.post('/pin-resets/:id/reset', resetPin);
router.get('/audit-logs', getAuditLogs);

export default router;
