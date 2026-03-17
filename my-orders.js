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
    try {
      localStorage.setItem(USER_PHONE_KEY, String(phone || '').trim());
    } catch {
      // ignore
    }
  }

  function loadOrders() {
    return window.OrderDB ? window.OrderDB.loadOrders() : [];
  }

  function hasUserOrders(orders, phone) {
    return orders.some(order => String(order.phone || '').trim() === phone);
  }

  function renderMyOrders() {
    const container = document.getElementById('myOrdersList');
    if (!container) return;

    const phone = getUserPhone();
    const allOrders = loadOrders();
    const myOrders = phone ? allOrders.filter(order => String(order.phone || '').trim() === phone) : [];

    if (!phone) {
      container.innerHTML = `
        <div class="my-orders-empty">
          <p>📱 Vui lòng đặt hàng trước để xem đơn của bạn.</p>
          <p><a href="#cart-checkout">Đi đến giỏ hàng</a></p>
        </div>
      `;
      return;
    }

    if (!myOrders.length) {
      container.innerHTML = `
        <div class="my-orders-empty">
          <p>📦 Chưa có đơn hàng nào với số ${escapeHtml(phone)}.</p>
          <p><a href="#cart-checkout">Đặt hàng mới</a></p>
        </div>
      `;
      return;
    }

    container.innerHTML = myOrders.map(order => {
      const items = Array.isArray(order.items) ? order.items.map(item => `${escapeHtml(item.name)} x${item.quantity}`).join(', ') : '';
      const statusMap = {
        'PENDING_CONFIRMATION': '⏳ Chờ xác nhận',
        'CONFIRMED': '✅ Hoàn thành',
        'CANCELLED': '❌ Đã hủy'
      };
      const paymentMap = {
        'PAID': '✅ Đã thanh toán',
        'UNPAID': '⏳ Chưa thanh toán',
        'WAITING_TRANSFER': '⏳ Chờ chuyển khoản'
      };
      const createdTime = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '';
      const statusDisplay = statusMap[order.status] || order.status;
      const paymentDisplay = paymentMap[order.paymentStatus] || order.paymentStatus;

      return `
        <article class="my-order-item">
          <div class="my-order-header">
            <h4>${escapeHtml(order.orderCode)}</h4>
            <span class="my-order-date">${createdTime}</span>
          </div>
          <p class="my-order-meta">Tổng: <strong>${currency.format(Number(order.total) || 0)}</strong> | ${statusDisplay} | ${paymentDisplay}</p>
          <p class="my-order-items">${items || 'Không có dữ liệu'}</p>
          <details class="my-order-details">
            <summary>Xem chi tiết</summary>
            <div>
              <p><strong>Khách hàng:</strong> ${escapeHtml(order.customerName)}</p>
              <p><strong>Điện thoại:</strong> ${escapeHtml(order.phone)}</p>
              <p><strong>Địa chỉ:</strong> ${escapeHtml(order.address)}</p>
              <p><strong>Ghi chú:</strong> ${escapeHtml(order.note || 'Không có')}</p>
              <p><strong>Thanh toán:</strong> ${escapeHtml(order.paymentMethod)}</p>
            </div>
          </details>
        </article>
      `;
    }).join('');

    container.setAttribute('aria-live', 'polite');
  }

  function bindMyOrders() {
    const phoneInput = document.getElementById('myOrdersPhoneInput');
    if (phoneInput) {
      phoneInput.value = getUserPhone();
      phoneInput.addEventListener('change', (e) => {
        const newPhone = e.target.value.trim();
        if (newPhone) {
          setUserPhone(newPhone);
          renderMyOrders();
        }
      });
    }

    // Auto refresh on OrderDB changes
    const observer = new MutationObserver(renderMyOrders);
    const orderKey = window.OrderDB?.ORDERS_KEY;
    if (orderKey) {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['localStorage']
      });
    }

    renderMyOrders();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindMyOrders);
  } else {
    bindMyOrders();
  }
})();

