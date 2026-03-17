(function () {
  const ORDERS_KEY = 'kem-y-suong-mock-orders';
  const MAX_ORDERS = 200;

  function ensureOrderAddress(order) {
    if (!order) return;
    const addr = String(order.address || '').trim();
    if (addr) return;
    order.address = order.orderType === 'PICKUP' ? 'Nhận tại quầy' : 'Địa chỉ chưa cung cấp';
  }

  function loadOrders() {
    try {
      const raw = window.localStorage.getItem(ORDERS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : [];
      list.forEach(ensureOrderAddress);
      return list;
    } catch (_error) {
      return [];
    }
  }

  function saveOrders(orders) {
    try {
      window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (_error) {
      // ignore
    }
  }

  function seedOrders() {
    const now = Date.now();
    const sample = [
      {
        _id: 'ORD-001',
        orderCode: 'KYS-9F3K2LQ1',
        customerName: 'Nguyễn Hoàng Anh',
        phone: '0877123456',
        address: '22 Nguyễn Trung Trực, Hồng Dân',
        orderType: 'DELIVERY',
        paymentMethod: 'BANK_TRANSFER',
        paymentStatus: 'WAITING_TRANSFER',
        status: 'PENDING_CONFIRMATION',
        total: 125000,
        items: [
          { name: 'Kem Que Socola Giòn Tan', quantity: 5 },
          { name: 'Yaourt Truyền Thống', quantity: 10 }
        ],
        createdAt: new Date(now - 1000 * 60 * 35).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 35).toISOString()
      },
      {
        _id: 'ORD-002',
        orderCode: 'KYS-7G8H2P4Q',
        customerName: 'Trần Bích Thủy',
        phone: '0905123456',
        address: 'Nhận tại quầy',
        orderType: 'PICKUP',
        paymentMethod: 'CASH',
        paymentStatus: 'UNPAID',
        status: 'CONFIRMED',
        total: 45000,
        items: [
          { name: 'Kem Ly Dâu Cao Cấp', quantity: 3 },
          { name: 'Kem Que Sữa Dừa', quantity: 2 }
        ],
        createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 20).toISOString()
      },
      {
        _id: 'ORD-003',
        orderCode: 'KYS-4N2M5X8Z',
        customerName: 'Lê Quốc Huy',
        phone: '0988111222',
        address: 'Hồng Dân, Bạc Liêu',
        orderType: 'DELIVERY',
        paymentMethod: 'AUTO_GATEWAY',
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        total: 78000,
        items: [
          { name: 'Kem Ly Socola', quantity: 2 },
          { name: 'Kem Ly Vani', quantity: 3 }
        ],
        createdAt: new Date(now - 1000 * 60 * 180).toISOString(),
        updatedAt: new Date(now - 1000 * 60 * 160).toISOString()
      }
    ];
    saveOrders(sample);
    return sample;
  }

  function addOrder(order, cartItems = []) {
    const list = loadOrders();
    const mappedItems = Array.isArray(cartItems)
      ? cartItems.map((item) => ({ name: item.name, quantity: item.quantity }))
      : [];
    const record = {
      ...order,
      _id: order._id || order.orderCode || `ORD-${Date.now()}`,
      items: mappedItems,
      status: order.status || 'PENDING_CONFIRMATION'
    };
    ensureOrderAddress(record);
    list.unshift(record);
    saveOrders(list.slice(0, MAX_ORDERS));
    return record;
  }

  window.OrderDB = {
    loadOrders,
    saveOrders,
    seedOrders,
    addOrder,
    ensureOrderAddress,
    ORDERS_KEY
  };
})();
