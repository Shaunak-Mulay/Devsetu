import express from 'express';
import { signup, login, requestLoginOtp, verifyLoginOtp, changePassword, requestForgotPasswordOtp, verifyForgotPasswordOtp, resetForgotPasswordPin, requestForgotPin, sessionStatus } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/login-otp/request', requestLoginOtp);
router.post('/login-otp/verify', verifyLoginOtp);
router.post('/change-password', changePassword);
router.post('/forgot-password/request', requestForgotPasswordOtp);
router.post('/forgot-password/verify', verifyForgotPasswordOtp);
router.post('/forgot-password/reset', resetForgotPasswordPin);
router.post('/forgot-pin/request', requestForgotPin);
router.get('/session-status', sessionStatus);

export default router;
