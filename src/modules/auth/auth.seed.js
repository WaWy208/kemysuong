/**
 * API endpoint tạm thời để tạo admin với fixed token
 * LƯU Ý: Sau khi tạo admin thành công, nên XÓA file này!
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const Order = require('../orders/order.model');
const StoreOrder = require('../storeOrders/storeOrder.model');
const { ROLES } = require('../../constants/enums');
const env = require('../../config/env');

const router = express.Router();

// Fixed admin token từ environment variable
// Đặt ADMIN_FIXED_TOKEN trong env để sử dụng
const FIXED_ADMIN_TOKEN = process.env.ADMIN_FIXED_TOKEN || '';

// Tạo token với thời hạn tùy chọn
function createToken(user, expiresIn = '15m') {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    env.accessSecret,
    { expiresIn }
  );
}

// Lấy đơn hàng gần nhất từ cả hai hệ thống (Order và StoreOrder)
async function getLatestOrder() {
  try {
    // Lấy đơn hàng online mới nhất
    const latestOnlineOrder = await Order.findOne().sort({ createdAt: -1 }).lean();
    
    // Lấy đơn hàng store mới nhất
    const latestStoreOrder = await StoreOrder.findOne().sort({ createdAt: -1 }).lean();
    
    // So sánh và lấy đơn hàng mới nhất
    let latestOrder = null;
    
    if (latestOnlineOrder && latestStoreOrder) {
      const onlineDate = new Date(latestOnlineOrder.createdAt);
      const storeDate = new Date(latestStoreOrder.createdAt);
      latestOrder = onlineDate > storeDate ? latestOnlineOrder : latestStoreOrder;
    } else if (latestOnlineOrder) {
      latestOrder = latestOnlineOrder;
    } else if (latestStoreOrder) {
      latestOrder = latestStoreOrder;
    }
    
    if (!latestOrder) return null;
    
    // Xác định loại đơn hàng
    const isStoreOrder = latestStoreOrder && 
      (latestOrder._id.toString() === latestStoreOrder._id.toString());
    
    // Format thông tin đơn hàng
    return {
      id: latestOrder._id,
      orderCode: latestOrder.orderCode || latestOrder._id.toString(),
      type: isStoreOrder ? 'STORE' : 'ONLINE',
      totalAmount: latestOrder.totalAmount || latestOrder.total,
      status: latestOrder.status,
      paymentStatus: latestOrder.paymentStatus,
      createdAt: latestOrder.createdAt,
      customerName: latestOrder.customerName || (latestOrder.userId ? 'Khách online' : ''),
      phone: latestOrder.phoneNumber || latestOrder.phone || ''
    };
  } catch (error) {
    console.error('Error getting latest order:', error);
    return null;
  }
}

router.post('/seed-admin', async (req, res) => {
  try {
    const { secret, email, password, name, tokenExpires } = req.body;

    // Nếu có fixed token thì dùng fixed token
    let tokenSecret = secret;
    if (FIXED_ADMIN_TOKEN && !secret) {
      tokenSecret = FIXED_ADMIN_TOKEN;
    }

    // Kiểm tra secret key
    if (tokenSecret !== FIXED_ADMIN_TOKEN && tokenSecret !== 'kem-y-suong-admin-seed-2024') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }

    const adminEmail = email || 'admin@kemysuong.com';
    const adminPassword = password || 'admin123456';
    const adminName = name || 'Admin';
    // Token mặc định 1 năm nếu không có yêu cầu khác
    const tokenExpiry = tokenExpires || '365d';

    // Tìm hoặc tạo user admin
    let user = await User.findOne({ email: adminEmail });

    if (user) {
      // Cập nhật user hiện tại thành admin
      user.role = ROLES.ADMIN;
      user.isActive = true;
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      user.passwordHash = passwordHash;
      await user.save();
    } else {
      // Tạo mới user admin
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      user = new User({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: ROLES.ADMIN,
        isActive: true
      });
      await user.save();
    }

    // Tạo tokens với thời hạn tùy chỉnh
    const accessToken = createToken(user, tokenExpiry);
    const refreshToken = createToken(user, '365d');

    res.json({
      success: true,
      message: 'Admin created/updated successfully',
      credentials: {
        email: adminEmail,
        password: adminPassword
      },
      tokens: {
        accessToken,
        refreshToken
      },
      expiresIn: tokenExpiry
    });
  } catch (error) {
    console.error('Seed admin error:', error);
    res.status(500).json({ error: 'Failed to create admin: ' + error.message });
  }
});

// Endpoint để lấy fixed token (nếu đã có admin)
router.get('/get-admin-token', async (req, res) => {
  try {
    const { secret, expiresIn } = req.query;
    
    // Xác thực secret
    if (secret !== FIXED_ADMIN_TOKEN && secret !== 'kem-y-suong-admin-seed-2024') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }

    const adminEmail = 'admin@kemysuong.com';
    const user = await User.findOne({ email: adminEmail, role: ROLES.ADMIN });

    if (!user) {
      return res.status(404).json({ error: 'Admin not found. Please create admin first.' });
    }

    // Tạo token với thời hạn tùy chỉnh (mặc định 1 năm)
    const tokenExpiry = expiresIn || '365d';
    const accessToken = createToken(user, tokenExpiry);

    // Lấy đơn hàng gần nhất
    const latestOrder = await getLatestOrder();

    res.json({
      accessToken,
      expiresIn: tokenExpiry,
      latestOrder
    });
  } catch (error) {
    console.error('Get admin token error:', error);
    res.status(500).json({ error: 'Failed to get token: ' + error.message });
  }
});

module.exports = router;

