require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kem-y-suong';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'CUSTOMER' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, collection: 'users' });

async function createAdmin() {
  const adminEmail = 'admin@kemysuong.com';
  const adminPassword = 'admin123456';
  const adminName = 'Admin';

  try {
    console.log('🔄 Đang kết nối MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('ℹ️  Admin đã tồn tại với email:', adminEmail);

      if (existingAdmin.role !== 'ADMIN') {
        existingAdmin.role = 'ADMIN';
        existingAdmin.isActive = true;
        await existingAdmin.save();
        console.log('✅ Đã cập nhật user thành ADMIN');
      }
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      const adminUser = new User({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        isActive: true
      });
      await adminUser.save();
      console.log('✅ Đã tạo tài khoản admin mới');
    }

    const user = await User.findOne({ email: adminEmail });
    const jwt = require('jsonwebtoken');
    
    const accessToken = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    console.log('\n========== THÔNG TIN ADMIN ==========');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    console.log('========================================\n');
    
    console.log('💡 Sử dụng Access Token trong admin panel để gọi API');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔄 Đã ngắt kết nối MongoDB');
  }
}

createAdmin();

