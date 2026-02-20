import express from 'express';
import User from '../models/User.js';
import Creator from '../models/Creator.js'; // 👈 missing import added
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Admin: list all users with their creator counts
router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const usersWithCounts = await Promise.all(users.map(async (user) => {
      const creatorCount = await Creator.countDocuments({ user: user._id });
      return {
        ...user.toObject(),
        creatorCount
      };
    }));
    res.json({ users: usersWithCounts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: disable/enable user
router.patch('/:id/disable', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.disabled = !!req.body.disabled;
    await user.save();
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        disabled: user.disabled 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;