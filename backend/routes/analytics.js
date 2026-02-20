import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Creator from '../models/Creator.js';
import Analytics from '../models/Analytics.js';
import { generateAnalyticsSnapshot } from '../utils/analyticsGenerator.js';

const router = express.Router();

// Dashboard (summary)
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    let creators;
    if (req.user.role === 'admin') creators = await Creator.find();
    else creators = await Creator.find({ user: req.user._id });
    const creatorIds = creators.map(c => c._id);
    const analytics = await Analytics.find({ creator: { $in: creatorIds } });
    const totalCreators = creators.length;
    const totalFollowers = analytics.reduce((s, a) => s + (a.followers || 0), 0);
    const avgEngagement = analytics.length ? +(analytics.reduce((s, a) => s + (a.engagementRate || 0), 0) / analytics.length).toFixed(2) : 0;
    const totalPosts = analytics.reduce((s, a) => s + (a.posts || 0), 0);

    // Platform distribution
    const platformDistribution = creators.reduce((acc, c) => {
      acc[c.platform] = (acc[c.platform] || 0) + 1;
      return acc;
    }, {});

    // Top creators
    const topCreators = analytics
      .sort((a, b) => (b.followers * b.engagementRate) - (a.followers * a.engagementRate))
      .slice(0, 5)
      .map(a => {
        const c = creators.find(cr => cr._id.toString() === a.creator.toString());
        return {
          name: c?.name,
          username: c?.username,
          followers: a.followers,
          engagement: a.engagementRate
        };
      });

    // Mock growth data for charts based on timeframe
    const getTimeframeData = (baseValue, multiplier, count) => {
      const data = [];
      for (let i = 0; i < count; i++) {
        data.push(baseValue * (0.8 + Math.random() * 0.4) * multiplier);
      }
      return data;
    };

    const timeframe = req.query.timeframe || 'week';
    let dataPoints = 7;
    if (timeframe === 'day') dataPoints = 24;
    if (timeframe === 'month') dataPoints = 30;
    if (timeframe === 'year') dataPoints = 12;

    const followersGrowth = getTimeframeData(totalFollowers, 1, dataPoints);
    const engagementHistory = getTimeframeData(avgEngagement, 1, dataPoints);

    res.json({ 
      totalCreators, 
      totalFollowers, 
      avgEngagement, 
      totalPosts,
      platformDistribution,
      topCreators,
      followersGrowth,
      engagementHistory,
      creatorsChange: '+12%',
      followersChange: '+23%',
      engagementChange: '+5%',
      postsChange: '+18%'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get creator analytics
router.get('/creator/:creatorId', requireAuth, async (req, res) => {
  try {
    const creator = await Creator.findById(req.params.creatorId);
    if (!creator) return res.status(404).json({ message: 'Creator not found' });
    if (req.user.role !== 'admin' && creator.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    let analytics = await Analytics.findOne({ creator: creator._id });
    if (analytics) analytics = analytics.toObject();
    // include creator identity in response
    res.json({ analytics: analytics ? { ...analytics, creator: { id: creator._id, name: creator.name, platform: creator.platform, username: creator.username, profileImageUrl: creator.profileImageUrl } } : null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Refresh analytics
router.post('/refresh/:creatorId', requireAuth, async (req, res) => {
  try {
    const creator = await Creator.findById(req.params.creatorId);
    if (!creator) return res.status(404).json({ message: 'Creator not found' });
    if (req.user.role !== 'admin' && creator.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });
    const analytics = await Analytics.findOne({ creator: creator._id });
    const snap = generateAnalyticsSnapshot();
    if (analytics) {
      analytics.followers = snap.followers;
      analytics.engagementRate = snap.engagementRate;
      analytics.avgLikes = snap.avgLikes;
      analytics.avgComments = snap.avgComments;
      analytics.historical.push({ date: new Date(), followers: snap.followers, engagementRate: snap.engagementRate });
      analytics.lastUpdated = new Date();
      await analytics.save();
      const obj = analytics.toObject();
      return res.json({ analytics: { ...obj, creator: { id: creator._id, name: creator.name, platform: creator.platform, username: creator.username, profileImageUrl: creator.profileImageUrl } } });
    }
    // create if missing
    const newAnalytics = await Analytics.create({ creator: creator._id, followers: snap.followers, engagementRate: snap.engagementRate, avgLikes: snap.avgLikes, avgComments: snap.avgComments, historical: [{ date: new Date(), followers: snap.followers, engagementRate: snap.engagementRate }], lastUpdated: new Date() });
    const obj = newAnalytics.toObject();
    res.json({ analytics: { ...obj, creator: { id: creator._id, name: creator.name, platform: creator.platform, username: creator.username, profileImageUrl: creator.profileImageUrl } } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
