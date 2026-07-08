import express from 'express';
import { getOutbox, clearOutbox } from '../controllers/debugController.js';

const router = express.Router();

router.get('/outbox', getOutbox);
router.post('/outbox/clear', clearOutbox);

export default router;
