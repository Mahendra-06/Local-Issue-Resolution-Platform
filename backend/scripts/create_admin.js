import bcrypt from 'bcryptjs';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';

const createAdmin = async () => {
  const args = process.argv.slice(2);
  const name = args[0] || process.env.ADMIN_NAME || 'Platform Administrator';
  const email = (args[1] || process.env.ADMIN_EMAIL || 'admin@civicpulse.gov').toLowerCase().trim();
  const password = args[2] || process.env.ADMIN_PASSWORD || 'Admin123!';

  try {
    console.log('[Create Admin] Connecting to database...');
    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`[Create Admin] User with email "${email}" already exists (Role: ${existing.role}).`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const adminUser = await User.create({
      name,
      email,
      passwordHash,
      role: 'admin',
      isActive: true,
    });

    console.log('========================================================');
    console.log('✅ Administrator account provisioned successfully!');
    console.log(`Name:  ${adminUser.name}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role:  ${adminUser.role}`);
    console.log('========================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Create Admin Error]:', error.message);
    process.exit(1);
  }
};

createAdmin();
