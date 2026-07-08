import express from 'express';
import { getTickets, createTicket, resolveTicket, getChats, postChat } from '../controllers/supportController.js';

const router = express.Router();

router.get('/tickets', getTickets);
router.post('/tickets', createTicket);
router.put('/tickets/:id/resolve', resolveTicket);
router.get('/chats', getChats);
router.post('/chats', postChat);

export default router;
