const ApiError = require('../../utils/apiError');
const Coupon = require('./coupon.model');

async function resolveCouponDiscount({ code, subtotal }) {
  if (!code) return { couponCode: '', discountAmount: 0, couponId: null };

  const coupon = await Coupon.findOne({ code: String(code).toUpperCase().trim(), isActive: true });
  if (!coupon) throw new ApiError(400, 'Coupon not found or inactive');

  const now = new Date();
  if (coupon.startAt > now || coupon.endAt < now) {
    throw new ApiError(400, 'Coupon is not in valid date range');
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'Coupon usage limit reached');
  }

  if (subtotal < Number(coupon.minOrderValue || 0)) {
    throw new ApiError(400, 'Subtotal does not meet coupon minimum value');
  }

  let discountAmount = 0;
  if (coupon.discountType === 'PERCENT') {
    discountAmount = Math.round((subtotal * Number(coupon.discountValue)) / 100);
  } else {
    discountAmount = Number(coupon.discountValue);
  }

  if (coupon.maxDiscountValue > 0) {
    discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountValue));
  }

  discountAmount = Math.max(0, Math.min(discountAmount, subtotal));

  return {
    couponId: coupon._id,
    couponCode: coupon.code,
    discountAmount
  };
}

async function consumeCoupon(couponId) {
  if (!couponId) return;
  await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
}

module.exports = {
  resolveCouponDiscount,
  consumeCoupon
};
