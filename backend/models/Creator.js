import mongoose from 'mongoose';

const creatorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  platform: { type: String, enum: ['Instagram', 'YouTube', 'X'], required: true },
  username: { type: String, required: true },
  profileImageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

creatorSchema.index({ user: 1, username: 1 }, { unique: true });

const Creator = mongoose.model('Creator', creatorSchema);
export default Creator;
