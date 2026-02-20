import mongoose from 'mongoose';

const historicalSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  followers: { type: Number, required: true },
  engagementRate: { type: Number, required: true },
});

const analyticsSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true, unique: true },
  followers: { type: Number, required: true },
  engagementRate: { type: Number, required: true },
  avgLikes: { type: Number, required: true },
  avgComments: { type: Number, required: true },
  historical: [historicalSchema],
  lastUpdated: { type: Date, default: Date.now },
});

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
