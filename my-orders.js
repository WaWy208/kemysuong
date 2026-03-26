(function () {
  const USER_PHONE_KEY = 'kem-y-suong-user-phone';
  const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getUserPhone() {
    try {
      return localStorage.getItem(USER_PHONE_KEY) || '';
    } catch {
      return '';
    }
  }

  function setUserPhone(phone) {
    const normalizedPhone = String(phone || '').trim();

    try {
      if (normalizedPhone) {
        localStorage.setItem(USER_PHONE_KEY, normalizedPhone);
      } else {
        localStorage.removeItem(USER_PHONE_KEY);
      }
    } catch {
      // ignore
    }

    window.dispatchEvent(new CustomEvent('user-phone:updated', {
      detail: { phone: normalizedPhone }
    }));
  }

  function loadOrders() {
    return window.OrderDB ? window.OrderDB.loadOrders() : [];
  }

  function renderMyOrders() {
    const container = document.getElementById('myOrdersList');
    if (!container) return;

    const phone = getUserPhone();
    const allOrders = loadOrders();
    const myOrders = phone
      ? allOrders.filter((order) => String(order.phone || '').trim() === phone)
      : [];

    if (!phone) {
      container.innerHTML = `
        <div class="my-orders-empty">
          <p>Nhap so dien thoai da dat hang de xem lich su don.</p>
          <p><a href="#cart-checkout">Di den gio hang</a></p>
        </div>
      `;
      return;
    }

    if (!myOrders.length) {
      container.innerHTML = `
        <div class="my-orders-empty">
          <p>Chua co don hang nao voi so ${escapeHtml(phone)}.</p>
          <p><a href="#cart-checkout">Dat hang moi</a></p>
        </div>
      `;
      return;
    }

    const statusMap = {
      PENDING_CONFIRMATION: 'Cho xac nhan',
      CONFIRMED: 'Hoan thanh',
      CANCELLED: 'Da huy'
    };
    const paymentMap = {
      PAID: 'Da thanh toan',
      UNPAID: 'Chua thanh toan',
      WAITING_TRANSFER: 'Cho chuyen khoan',
      PENDING: 'Dang xu ly'
    };

    container.innerHTML = myOrders.map((order) => {
      const items = Array.isArray(order.items)
        ? order.items.map((item) => `${escapeHtml(item.name)} x${Number(item.quantity)}`).join(', ')
        : '';
      const createdTime = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '';
      const statusDisplay = statusMap[order.status] || order.status;
      const paymentDisplay = paymentMap[order.paymentStatus] || order.paymentStatus;

      return `
        <article class="my-order-item">
          <div class="my-order-header">
            <h4>${escapeHtml(order.orderCode)}</h4>
            <span class="my-order-date">${createdTime}</span>
          </div>
          <p class="my-order-meta">Tong: <strong>${currency.format(Number(order.total) || 0)}</strong> | ${escapeHtml(statusDisplay)} | ${escapeHtml(paymentDisplay)}</p>
          <p class="my-order-items">${items || 'Khong co du lieu'}</p>
          <details class="my-order-details">
            <summary>Xem chi tiet</summary>
            <div>
              <p><strong>Khach hang:</strong> ${escapeHtml(order.customerName)}</p>
              <p><strong>Dien thoai:</strong> ${escapeHtml(order.phone)}</p>
              <p><strong>Dia chi:</strong> ${escapeHtml(order.address)}</p>
              <p><strong>Ghi chu:</strong> ${escapeHtml(order.note || 'Khong co')}</p>
              <p><strong>Thanh toan:</strong> ${escapeHtml(order.paymentMethod)}</p>
            </div>
          </details>
        </article>
      `;
    }).join('');

    container.setAttribute('aria-live', 'polite');
  }

  function bindMyOrders() {
    const phoneInput = document.getElementById('myOrdersPhoneInput');
    const syncView = () => {
      if (phoneInput) {
        phoneInput.value = getUserPhone();
      }
      renderMyOrders();
    };

    if (phoneInput) {
      phoneInput.value = getUserPhone();
      const handlePhoneChange = (event) => {
        setUserPhone(event.target.value);
      };
      phoneInput.addEventListener('input', handlePhoneChange);
      phoneInput.addEventListener('change', handlePhoneChange);
    }

    window.addEventListener('orders:updated', syncView);
    window.addEventListener('user-phone:updated', syncView);
    window.addEventListener('storage', (event) => {
      if (event.key === USER_PHONE_KEY || event.key === window.OrderDB?.ORDERS_KEY) {
        syncView();
      }
    });

    window.setUserPhone = setUserPhone;
    syncView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindMyOrders);
  } else {
    bindMyOrders();
  }
})();
