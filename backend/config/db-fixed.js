import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/creator-analytics';
  try {
    // Mongoose 7+ doesn't require useNewUrlParser/useUnifiedTopology
    await mongoose.connect(uri);
    console.log('✓ MongoDB connected');
  } catch (err) {
    console.error('✗ MongoDB connection error', err.message);
    console.error('Ensure MongoDB is running or check MONGODB_URI');
    process.exit(1);
  }
};

export default connectDB;
