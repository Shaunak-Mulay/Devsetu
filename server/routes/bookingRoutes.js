import express from 'express';
import { getBookings, createBooking, submitPayment, updateBookingStatus, deleteBooking } from '../controllers/bookingController.js';

const router = express.Router();

router.get('/', getBookings);
router.post('/', createBooking);
router.post('/:id/payment', submitPayment);
router.put('/:id/status', updateBookingStatus);
router.delete('/:id', deleteBooking);

export default router;
