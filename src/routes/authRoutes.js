import express from 'express';
const router = express.Router();
import { register, login, forgotPassword, resetPassword, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/me', protect, getMe);

export default router;

