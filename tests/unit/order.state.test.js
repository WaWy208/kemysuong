const { canTransition } = require('../../src/modules/orders/order.state');

describe('Order state transitions', () => {
  test('allows valid transitions', () => {
    expect(canTransition('PENDING', 'CONFIRMED')).toBe(true);
    expect(canTransition('CONFIRMED', 'PREPARING')).toBe(true);
    expect(canTransition('PREPARING', 'DELIVERED')).toBe(true);
    expect(canTransition('DELIVERED', 'COMPLETED')).toBe(true);
  });

  test('rejects invalid transitions', () => {
    expect(canTransition('PENDING', 'PREPARING')).toBe(false);
    expect(canTransition('DELIVERED', 'CONFIRMED')).toBe(false);
    expect(canTransition('COMPLETED', 'PENDING')).toBe(false);
  });
});
