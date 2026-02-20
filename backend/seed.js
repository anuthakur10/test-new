import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import connectDB from './config/db.js';

await connectDB();

try {
  // Clear existing test users
  await User.deleteMany({ email: { $in: ['user@test.com', 'admin@test.com'] } });

  // Create test user
  const userPassword = await bcrypt.hash('password123', 10);
  const testUser = await User.create({
    name: 'Test User',
    email: 'user@test.com',
    password: userPassword,
    role: 'user'
  });
  console.log('✓ Test User created: user@test.com / password123');

  // Create test admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const testAdmin = await User.create({
    name: 'Test Admin',
    email: 'admin@test.com',
    password: adminPassword,
    role: 'admin'
  });
  console.log('✓ Test Admin created: admin@test.com / admin123');

  console.log('\nTest credentials ready!');
  process.exit(0);
} catch (err) {
  console.error('Error seeding database:', err.message);
  process.exit(1);
}
