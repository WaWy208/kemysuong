const FlashSale = require('./flashSale.model');

async function getActiveFlashSales(productIds) {
  const now = new Date();
  const sales = await FlashSale.find({
    productId: { $in: productIds },
    isActive: true,
    startAt: { $lte: now },
    endAt: { $gte: now }
  }).lean();

  const map = new Map();
  sales.forEach((sale) => {
    map.set(String(sale.productId), sale);
  });

  return map;
}

function computeFlashPrice(productPrice, sale) {
  if (!sale) return Number(productPrice);
  if (Number(sale.flashPrice || 0) > 0) return Number(sale.flashPrice);
  const discountPercent = Number(sale.discountPercent || 0);
  return Math.max(0, Math.round(Number(productPrice) * (100 - discountPercent) / 100));
}

async function increaseSoldQuantity(saleId, qty) {
  if (!saleId || qty <= 0) return;
  await FlashSale.findByIdAndUpdate(saleId, { $inc: { soldQuantity: qty } });
}

module.exports = {
  getActiveFlashSales,
  computeFlashPrice,
  increaseSoldQuantity
};
