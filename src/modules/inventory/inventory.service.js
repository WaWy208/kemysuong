const env = require('../../config/env');
const InventoryAlert = require('./inventoryAlert.model');
const { sendMail } = require('../../services/mailer');

async function checkLowStockAndNotify(product) {
  const threshold = Number(env.lowStockThreshold || 10);
  if (Number(product.inventoryCount) > threshold) return;

  const existing = await InventoryAlert.findOne({ productId: product._id, resolved: false });
  if (!existing) {
    await InventoryAlert.create({
      productId: product._id,
      stock: product.inventoryCount,
      threshold,
      resolved: false
    });
  } else {
    await InventoryAlert.findByIdAndUpdate(existing._id, { stock: product.inventoryCount });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  try {
    await sendMail({
      to: adminEmail,
      subject: `[Low Stock] ${product.name}`,
      html: `<p>San pham <strong>${product.name}</strong> dang sap het hang.</p><p>Ton kho hien tai: ${product.inventoryCount}</p>`
    });
  } catch (error) {
    console.error('[inventory-alert-mail-failed]', error.message);
  }
}

module.exports = {
  checkLowStockAndNotify
};
