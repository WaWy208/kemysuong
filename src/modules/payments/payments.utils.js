const crypto = require('crypto');

function normalizePaymentPayload(payload) {
  return {
    provider: String(payload.provider || '').trim().toLowerCase(),
    orderId: String(payload.orderId || '').trim(),
    status: String(payload.status || '').trim().toUpperCase(),
    amount: Number(payload.amount || 0),
    transactionId: String(payload.transactionId || '').trim(),
    timestamp: String(payload.timestamp || '').trim()
  };
}

function canonicalizePayload(payload) {
  const normalized = normalizePaymentPayload(payload);
  const keys = ['provider', 'orderId', 'status', 'amount', 'transactionId', 'timestamp'];
  return keys.map((key) => `${key}=${normalized[key]}`).join('&');
}

function signPaymentPayload(payload, secret) {
  const canonical = canonicalizePayload(payload);
  return crypto.createHmac('sha256', secret).update(canonical).digest('hex');
}

function verifyPaymentSignature(payload, signature, secret) {
  if (!signature || !secret) return false;
  const expected = signPaymentPayload(payload, secret);
  const providedBuffer = Buffer.from(String(signature), 'utf8');
  const expectedBuffer = Buffer.from(String(expected), 'utf8');
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

function sortObjectByKey(input) {
  return Object.keys(input)
    .sort()
    .reduce((acc, key) => {
      acc[key] = input[key];
      return acc;
    }, {});
}

function toQueryString(input) {
  return Object.keys(input)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(input[key])}`)
    .join('&');
}

function signVnpay(params, secret) {
  const sorted = sortObjectByKey(params);
  const signData = toQueryString(sorted);
  return crypto.createHmac('sha512', secret).update(signData).digest('hex');
}

function verifyVnpay(params, secureHash, secret) {
  const { vnp_SecureHash, vnp_SecureHashType, ...rest } = params;
  const expected = signVnpay(rest, secret);
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const providedBuffer = Buffer.from(String(secureHash || ''), 'utf8');
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

function signMomo(rawSignature, secret) {
  return crypto.createHmac('sha256', secret).update(rawSignature).digest('hex');
}

module.exports = {
  normalizePaymentPayload,
  signPaymentPayload,
  verifyPaymentSignature,
  signVnpay,
  verifyVnpay,
  signMomo,
  toQueryString,
  sortObjectByKey
};
