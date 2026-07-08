import express from 'express';
import { getUsers, updateUserStatus, updateUserProfile, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUsers);
router.put('/:email/status', updateUserStatus);
router.put('/:email', updateUserProfile);
router.delete('/:email', deleteUser);

export default router;
