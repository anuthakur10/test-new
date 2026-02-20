import express from 'express';
import Creator from '../models/Creator.js';
import Analytics from '../models/Analytics.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { generateAnalyticsSnapshot, generateHistorical } from '../utils/analyticsGenerator.js';

const router = express.Router();

// Create creator
router.post('/', requireAuth, async (req, res) => {
  const { name, platform, username, profileImageUrl } = req.body;
  if (!name || !platform || !username) return res.status(400).json({ message: 'Missing required fields: name, platform, username' });
  // basic platform validation
  const allowed = ['Instagram', 'YouTube', 'X'];
  if (!allowed.includes(platform)) return res.status(400).json({ message: 'Invalid platform' });
  try {
    const exists = await Creator.findOne({ user: req.user._id, username });
    if (exists) return res.status(409).json({ message: 'Creator username exists' });
    const creator = await Creator.create({ user: req.user._id, name, platform, username, profileImageUrl });
    // generate analytics
    const snap = generateAnalyticsSnapshot();
    const historical = generateHistorical(30);
    await Analytics.create({ creator: creator._id, followers: snap.followers, engagementRate: snap.engagementRate, avgLikes: snap.avgLikes, avgComments: snap.avgComments, historical, lastUpdated: new Date() });
    res.status(201).json({ creator });
  } catch (err) {
    console.error('Create creator error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List creators (user's or all for admin)
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const skip = (page - 1) * limit;
    
    let query = {};
    // If user is not admin, only show their own creators
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    } else if (req.query.userId) {
      // Admin can filter by specific user
      query.user = req.query.userId;
    }

    const total = await Creator.countDocuments(query);
    const creators = await Creator.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    res.json({ creators, total, page, limit });
  } catch (err) {
    console.error('List creators error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single creator (with analytics)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const creator = await Creator.findById(req.params.id).populate('user', 'name email');
    if (!creator) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && creator.user._id.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    const analytics = await Analytics.findOne({ creator: creator._id });
    res.json({ creator, analytics });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update creator (identity only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const creator = await Creator.findById(req.params.id);
    if (!creator) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && creator.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    const { name, platform, username, profileImageUrl } = req.body;
    if (name) creator.name = name;
    if (platform) creator.platform = platform;
    if (username) creator.username = username;
    if (profileImageUrl) creator.profileImageUrl = profileImageUrl;
    await creator.save();
    res.json({ creator });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete creator
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const creator = await Creator.findById(req.params.id);
    if (!creator) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && creator.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    await Analytics.deleteOne({ creator: creator._id });
    await creator.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
