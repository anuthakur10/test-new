import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not set — skipping database connection.');
    console.warn('Set MONGODB_URI environment variable to connect to MongoDB.');
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err.message);
    console.error('Ensure MongoDB is running or check MONGODB_URI');
  }
};

export default connectDB;
