import express from 'express';
import { getNotifications, clearNotifications, markRead, deleteNotification, registerToken, broadcast, adminHistory, resendNotification } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotifications);
router.post('/clear', clearNotifications);
router.post('/mark-read', markRead);
router.delete('/:id', deleteNotification);
router.post('/register-token', registerToken);
router.post('/broadcast', broadcast);
router.get('/admin-history', adminHistory);
router.post('/resend', resendNotification);

export default router;
