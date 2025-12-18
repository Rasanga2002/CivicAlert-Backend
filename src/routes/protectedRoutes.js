import express from 'express';
import { protect } from '../middleware/auth.js';
import authorizeRole from '../middleware/roles.js';

const router = express.Router();


// route for any logged in user
router.get('/user/profile', protect, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// route only for policeman
router.get('/police/dashboard', protect, authorizeRole('policeman'), (req, res) => {
  res.json({ success: true, message: 'Welcome policeman — this is your dashboard' });
});

export default router;
