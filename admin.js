(function () {
const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const ADMIN_PASSWORD = 'buiquangquy25122007';
const MENU_OVERRIDE_KEY = 'kem-y-suong-menu-overrides';
const API_BASE_URL = 'http://localhost:4000/api/v1'; // Change for production

let pendingMenuChanges = new Map(); // Track unsaved changes
const MOCK_PAGE_SIZE = 8;
const MENU_TYPE_LABELS = {
  cream: 'Kem que',
  cup: 'Kem ly',
  'premium-cup': 'Ly cao cấp',
  yogurt: 'Yaourt',
  'bean-dessert': 'Đá đậu'
};

let adminOrdersCache = [];
let adminCurrentPage = 1;
let adminTotalPages = 1;
let adminPanelBound = false;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setAdminMessage(text, type = '') {
  const msg = document.getElementById('adminMsg');
  if (!msg) return;
  msg.textContent = text;
  msg.className = `form-msg ${type}`.trim();
}

function setAdminMenuMessage(text, type = '') {
  const msg = document.getElementById('adminMenuMsg');
  if (!msg) return;
  msg.textContent = text;
  msg.className = `form-msg ${type}`.trim();
}

function getMenuItems() {
  const items = window.menuItems;
  return Array.isArray(items) ? items : [];
}

async function getMenuOverrides() {
  // Try server first, fallback localStorage
  try {
    const response = await fetch(`${API_BASE_URL}/menu/overrides`);
    if (response.ok) {
      const data = await response.json();
      const map = new Map(data.map(item => [String(item.productId), item]));
      localStorage.setItem(MENU_OVERRIDE_KEY, JSON.stringify(Object.fromEntries(map)));
      return Object.fromEntries(map);
    }
  } catch (error) {
    console.warn('Server overrides unavailable, using localStorage:', error);
  }
  
  // Fallback
  try {
    const raw = window.localStorage.getItem(MENU_OVERRIDE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMenuOverrides(overrides) {
  try {
    window.localStorage.setItem(MENU_OVERRIDE_KEY, JSON.stringify(overrides));
  } catch (_error) {
    // Ignore storage failures.
  }
}

const AUTO_SAVE_DELAY = 800;
let autoSaveTimer = null;

function normalizeStock(value) {
  const next = Number(value);
  if (!Number.isFinite(next) || next < 0) return 0;
  return Math.floor(next);
}

async function updateMenuOverride(itemId, patch) {
  pendingMenuChanges.set(itemId, { ...pendingMenuChanges.get(itemId), ...patch });
  updateSaveButtonState();
  
  // Still save locally as fallback
  const overrides = await getMenuOverrides();
  overrides[itemId] = { ...overrides[itemId], ...patch };
  saveMenuOverrides(overrides);
  window.dispatchEvent(new CustomEvent('menu:updated'));

  setAdminMenuMessage('Đã cập nhật tạm (chưa lưu server)', 'info');
  scheduleAutoSave();
}

function scheduleAutoSave() {
  if (pendingMenuChanges.size === 0) return;
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  autoSaveTimer = window.setTimeout(() => {
    saveMenuToServer().catch(() => {});
  }, AUTO_SAVE_DELAY);
}

function updateSaveButtonState() {
  const saveBtn = document.getElementById('adminMenuSaveBtn');
  if (saveBtn) {
    const hasChanges = pendingMenuChanges.size > 0;
    saveBtn.disabled = !hasChanges;
    saveBtn.textContent = hasChanges ? 'Lưu lên Server (' + pendingMenuChanges.size + ')' : 'Đã lưu server';
  }
}

async function saveMenuToServer() {
  if (pendingMenuChanges.size === 0) return;
  
  setAdminMenuMessage('Đang lưu lên server...', 'ok');
  
  try {
    const updates = Array.from(pendingMenuChanges.values());
    const response = await fetch(`${API_BASE_URL}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': ADMIN_PASSWORD
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Lưu thất bại');
    }
    
    const result = await response.json();
    pendingMenuChanges.clear();
    updateSaveButtonState();
    
    // Reload from server
    await getMenuOverrides();
    await renderAdminMenu();
    window.dispatchEvent(new CustomEvent('menu:updated'));
    
    setAdminMenuMessage(`Đã lưu thành công ${result.updated || updates.length} mục!`, 'ok');
  } catch (error) {
    setAdminMenuMessage('Lưu server thất bại: ' + error.message, 'err');
  }
}

async function renderAdminMenu() {
  const list = document.getElementById('adminMenuList');
  if (!list) return;

  const items = getMenuItems();
  if (!items.length) {
    list.innerHTML = '<p class="empty-result">Không có món nào để quản lý.</p>';
    return;
  }

  const overrides = await getMenuOverrides();

  list.innerHTML = items.map((item) => {
    const override = overrides[item.id] || {};
    const stockValue = normalizeStock(
      typeof override.inventoryCount === 'number' ? override.inventoryCount : item.stock
    );
    const paused = typeof override.isPaused === 'boolean' ? override.isPaused : Boolean(item.paused);
    const typeLabel = MENU_TYPE_LABELS[item.type] || item.type;

    return `
      <div class="admin-menu-item" data-id="${item.id}">
        <div class="admin-menu-info">
          <strong>${escapeHtml(item.name)}</strong>
          <span class="admin-menu-meta">Loại: ${escapeHtml(typeLabel)} • Giá: ${currency.format(item.price)}</span>
        </div>
        <div class="admin-menu-controls">
          <div class="admin-stock-stepper">
            <button type="button" class="btn btn-outline btn-sm" data-step="-1">-</button>
            <input type="number" min="0" step="1" value="${stockValue}" inputmode="numeric" />
            <button type="button" class="btn btn-outline btn-sm" data-step="1">+</button>
          </div>
          <label class="admin-pause-toggle">
            <input type="checkbox" ${paused ? 'checked' : ''} />
            <span>Tạm ngưng bán</span>
          </label>
        </div>
      </div>
    `;
  }).join('');
}
function updateAdminPaginationUi() {
  const pageInfo = document.getElementById('adminPageInfo');
  const prevBtn = document.getElementById('adminPrevPageBtn');
  const nextBtn = document.getElementById('adminNextPageBtn');
  if (pageInfo) pageInfo.textContent = `Trang ${adminCurrentPage} / ${adminTotalPages}`;
  if (prevBtn) prevBtn.disabled = adminCurrentPage <= 1;
  if (nextBtn) nextBtn.disabled = adminCurrentPage >= adminTotalPages;
}

function renderAdminOrders() {
  const root = document.getElementById('adminOrdersList');
  if (!root) return;

  if (!adminOrdersCache.length) {
    root.innerHTML = '<p class="empty-result">Chưa có dữ liệu đơn hàng để hiển thị.</p>';
    return;
  }

  const buckets = {
    unpaid: [],
    paid: [],
    finished: [],
    cancelled: []
  };

  adminOrdersCache.forEach((order) => {
    if (order.status === 'CANCELLED') {
      buckets.cancelled.push(order);
      return;
    }
    if (order.status === 'CONFIRMED') {
      buckets.finished.push(order);
      return;
    }
    if (order.paymentStatus === 'PAID') {
      buckets.paid.push(order);
      return;
    }
    buckets.unpaid.push(order);
  });

  const renderList = (orders) => orders.map((order) => {
    const items = Array.isArray(order.items)
      ? order.items.map((item) => `${escapeHtml(item.name)} x${Number(item.quantity)}`).join(', ')
      : '';
    const isCancelled = order.status === 'CANCELLED';
    const isFinished = order.status === 'CONFIRMED';
    const canConfirm = order.status === 'PENDING_CONFIRMATION';
    const canCancel = !isCancelled && (order.status === 'PENDING_CONFIRMATION' || order.status === 'CONFIRMED');
    const canMarkPaid = order.paymentStatus !== 'PAID' && !isCancelled;
    
    // Map trạng thái đơn hàng sang tiếng Việt
    const statusMap = {
      'PENDING_CONFIRMATION': '⏳ Chờ xác nhận',
      'CONFIRMED': '✅ Đã xác nhận',
      'CANCELLED': '❌ Đã hủy'
    };
    const statusDisplay = statusMap[order.status] || order.status;
    const statusClass = order.status === 'CONFIRMED' ? 'status-confirmed' : order.status === 'PENDING_CONFIRMATION' ? 'status-pending' : 'status-cancelled';
    
    // Map trạng thái thanh toán sang tiếng Việt
    const paymentStatusMap = {
      'PAID': 'Đã thanh toán',
      'UNPAID': 'Chưa thanh toán',
      'WAITING_TRANSFER': 'Chờ chuyển khoản',
      'PENDING': 'Đang xử lý'
    };
    const paymentStatusDisplay = paymentStatusMap[order.paymentStatus] || order.paymentStatus;
    
    // Hiển thị thời gian cập nhật nếu có
    const updatedTime = order.updatedAt ? new Date(order.updatedAt).toLocaleString('vi-VN') : '';
    const createdTime = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '';
    
    return `
      <article class="admin-order-item ${statusClass}" data-order-id="${order._id}">
        <div class="admin-order-header">
          <h4>${escapeHtml(order.orderCode)} • ${escapeHtml(order.customerName)}</h4>
          <button type="button" class="admin-order-toggle" data-toggle="${order._id}" aria-label="Xem chi tiết đơn hàng">
            <span class="toggle-icon">☰</span>
          </button>
        </div>
        <p class="admin-order-meta">SDT: ${escapeHtml(order.phone)} | Trạng thái: <strong>${statusDisplay}</strong> | Thanh toán: <strong>${paymentStatusDisplay}</strong></p>
        <p class="admin-order-meta">Địa chỉ: ${escapeHtml(order.address) || 'Không có'}</p>
        <p class="admin-order-meta">Tổng tiền: <strong>${currency.format(Number(order.total) || 0)}</strong> | Hình thức: ${escapeHtml(order.orderType)} | ${escapeHtml(order.paymentMethod)}</p>
        <p class="admin-order-meta">Thời gian tạo: ${createdTime}${updatedTime && order.status !== 'PENDING_CONFIRMATION' ? ` | Cập nhật: ${updatedTime}` : ''}</p>
        <p class="admin-order-items">Món: ${items || 'Không có dữ liệu'}</p>
        <div class="admin-order-details" id="details-${order._id}" hidden>
          <div class="admin-order-details-grid">
            <div class="detail-item">
              <strong>Mã đơn hàng:</strong>
              <span>${escapeHtml(order.orderCode)}</span>
            </div>
            <div class="detail-item">
              <strong>Trạng thái giao hàng:</strong>
              <span class="detail-status ${statusClass}">${statusDisplay}</span>
            </div>
            <div class="detail-item">
              <strong>Trạng thái thanh toán:</strong>
              <span>${paymentStatusDisplay}</span>
            </div>
            <div class="detail-item">
              <strong>Địa chỉ giao hàng:</strong>
              <span>${escapeHtml(order.address) || 'Không có'}</span>
            </div>
            <div class="detail-item">
              <strong>Hình thức nhận hàng:</strong>
              <span>${order.orderType === 'DELIVERY' ? 'Giao tận nơi' : 'Nhận tại quầy'}</span>
            </div>
            <div class="detail-item">
              <strong>Phương thức thanh toán:</strong>
              <span>${order.paymentMethod === 'CASH' ? 'Tiền mặt' : order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Cổng thanh toán'}</span>
            </div>
          </div>
        </div>
        <div class="admin-order-actions">
          <button type="button" class="btn btn-solid" data-admin-action="confirm" data-id="${order._id}" ${canConfirm ? '' : 'disabled'}>Xác nhận</button>
          <button type="button" class="btn btn-outline" data-admin-action="cancel" data-id="${order._id}" ${canCancel ? '' : 'disabled'}>Hủy đơn</button>
          <button type="button" class="btn btn-outline" data-admin-action="mark-paid" data-id="${order._id}" ${canMarkPaid ? '' : 'disabled'}>Xác nhận thanh toán</button>
        </div>
      </article>
    `;
  }).join('');

  root.innerHTML = `
    ${buckets.unpaid.length ? `<h4 class="admin-order-group">Đơn chưa thanh toán</h4>${renderList(buckets.unpaid)}` : ''}
    ${buckets.paid.length ? `<h4 class="admin-order-group">Đơn đã thanh toán</h4>${renderList(buckets.paid)}` : ''}
    ${buckets.finished.length ? `<h4 class="admin-order-group">Đơn đã hoàn thành</h4>${renderList(buckets.finished)}` : ''}
    ${buckets.cancelled.length ? `<h4 class="admin-order-group">Đơn đã hủy</h4>${renderList(buckets.cancelled)}` : ''}
  ` || '<p class="empty-result">Chưa có dữ liệu đơn hàng để hiển thị.</p>';
}

async function fetchAdminOrders(page = 1) {
  setAdminMessage('Đang tải đơn hàng...', 'ok');

  const OrderDB = window.OrderDB;
  if (!OrderDB) {
    setAdminMessage('Không khởi tạo được bộ lưu đơn hàng cục bộ.', 'err');
    return;
  }

const status = String(document.getElementById('adminStatusFilter')?.value || '').trim();
  const paymentStatus = String(document.getElementById('adminPaymentStatusFilter')?.value || '').trim();
  const groupFilter = String(document.getElementById('adminGroupFilter')?.value || '').trim();

  let allOrders = OrderDB.loadOrders();
  if (!allOrders.length) allOrders = OrderDB.seedOrders();
  allOrders.forEach(OrderDB.ensureOrderAddress);
  OrderDB.saveOrders(allOrders);

  const matchesPhone = true;
  const filtered = allOrders.filter((order) => {
    const matchesStatus = status ? order.status === status : true;
    const matchesPayment = paymentStatus ? order.paymentStatus === paymentStatus : true;
    const matchesGroup = (() => {
      if (groupFilter === 'UNPAID') return order.paymentStatus !== 'PAID' && order.status !== 'CANCELLED';
      if (groupFilter === 'PAID') return order.paymentStatus === 'PAID' && order.status !== 'CANCELLED';
      if (groupFilter === 'FINISHED') return order.status === 'CONFIRMED';
      if (groupFilter === 'CANCELLED') return order.status === 'CANCELLED';
      return true;
    })();
    return matchesPhone && matchesStatus && matchesPayment && matchesGroup;
  });

  adminTotalPages = Math.max(1, Math.ceil(filtered.length / MOCK_PAGE_SIZE));
  adminCurrentPage = Math.min(Math.max(1, Number(page) || 1), adminTotalPages);
  const start = (adminCurrentPage - 1) * MOCK_PAGE_SIZE;
  adminOrdersCache = filtered.slice(start, start + MOCK_PAGE_SIZE);

  renderAdminOrders();
  updateAdminPaginationUi();
  setAdminMessage(`Đã tải ${adminOrdersCache.length} đơn hàng (trang ${adminCurrentPage}/${adminTotalPages}).`, 'ok');
}

async function updateAdminOrderStatus(orderId, nextStatus) {
  const OrderDB = window.OrderDB;
  if (!OrderDB) throw new Error('Không khởi tạo được bộ lưu đơn hàng cục bộ.');

  const orders = OrderDB.loadOrders();
  const target = orders.find((order) => order._id === orderId);
  if (!target) throw new Error('Không tìm thấy đơn trong bộ dữ liệu hiện tại.');
  target.status = nextStatus;
  OrderDB.ensureOrderAddress(target);
  target.updatedAt = new Date().toISOString();
  OrderDB.saveOrders(orders);
  return target;
}

async function updateAdminPaymentStatus(orderId) {
  const OrderDB = window.OrderDB;
  if (!OrderDB) throw new Error('Không khởi tạo được bộ lưu đơn hàng cục bộ.');

  const orders = OrderDB.loadOrders();
  const target = orders.find((order) => order._id === orderId);
  if (!target) throw new Error('Không tìm thấy đơn trong bộ dữ liệu hiện tại.');
  target.paymentStatus = 'PAID';
  target.updatedAt = new Date().toISOString();
  OrderDB.saveOrders(orders);
  return target;
}

async function bindAdminPanel() {
  if (adminPanelBound) return;

  const fetchBtn = document.getElementById('adminFetchOrdersBtn');
  const clearBtn = document.getElementById('adminClearViewBtn');
  const prevPageBtn = document.getElementById('adminPrevPageBtn');
  const nextPageBtn = document.getElementById('adminNextPageBtn');
  const list = document.getElementById('adminOrdersList');
  const menuList = document.getElementById('adminMenuList');
  const menuResetBtn = document.getElementById('adminMenuResetBtn');
  if (!fetchBtn || !clearBtn || !list || !prevPageBtn || !nextPageBtn) return;

  adminPanelBound = true;

  fetchBtn.addEventListener('click', async () => {
    try {
      adminCurrentPage = 1;
      await fetchAdminOrders(adminCurrentPage);
    } catch (error) {
      setAdminMessage(error.message || 'Không thể tải đơn hàng.', 'err');
    }
  });

  prevPageBtn.addEventListener('click', async () => {
    if (adminCurrentPage <= 1) return;
    try {
      await fetchAdminOrders(adminCurrentPage - 1);
    } catch (error) {
      setAdminMessage(error.message || 'Không thể tải trang trước.', 'err');
    }
  });

  nextPageBtn.addEventListener('click', async () => {
    if (adminCurrentPage >= adminTotalPages) return;
    try {
      await fetchAdminOrders(adminCurrentPage + 1);
    } catch (error) {
      setAdminMessage(error.message || 'Không thể tải trang sau.', 'err');
    }
  });

  clearBtn.addEventListener('click', () => {
    adminOrdersCache = [];
    adminCurrentPage = 1;
    adminTotalPages = 1;
    renderAdminOrders();
    updateAdminPaginationUi();
    setAdminMessage('Đã xóa danh sách hiển thị.', 'ok');
  });

  list.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-admin-action][data-id]');
    if (!button) return;
    const { adminAction, id } = button.dataset;
    try {
      if (adminAction === 'mark-paid') {
        setAdminMessage('Đang xác nhận thanh toán...', 'ok');
        await updateAdminPaymentStatus(id);
        adminOrdersCache = adminOrdersCache.map((order) =>
          order._id === id ? { ...order, paymentStatus: 'PAID', updatedAt: new Date().toISOString() } : order
        );
        renderAdminOrders();
        setAdminMessage('Đã xác nhận thanh toán.', 'ok');
      } else {
        const nextStatus = adminAction === 'confirm' ? 'CONFIRMED' : 'CANCELLED';
        setAdminMessage('Đang cập nhật trạng thái đơn...', 'ok');
        await updateAdminOrderStatus(id, nextStatus);

        if (nextStatus === 'CANCELLED') {
          adminOrdersCache = adminOrdersCache.filter(order => order._id !== id);
          renderAdminOrders();
          updateAdminPaginationUi();
          setAdminMessage('Đã hủy đơn thành công. Đơn đã được xóa khỏi danh sách.', 'ok');
        } else {
          const updatedOrder = adminOrdersCache.find(order => order._id === id);
          if (updatedOrder) {
            updatedOrder.status = 'CONFIRMED';
            updatedOrder.updatedAt = new Date().toISOString();
          }
          renderAdminOrders();
          setAdminMessage('Đã xác nhận đơn thành công. Đơn hàng đang được xử lý.', 'ok');
        }
      }
    } catch (error) {
      setAdminMessage(error.message || 'Không thể cập nhật trạng thái.', 'err');
    }
  });

  renderAdminOrders();
  updateAdminPaginationUi();

  if (menuList) {
    menuList.addEventListener('click', (event) => {
      const stepBtn = event.target.closest('button[data-step]');
      if (!stepBtn) return;
      const itemEl = stepBtn.closest('.admin-menu-item');
      if (!itemEl) return;
      const step = Number(stepBtn.dataset.step);
      const input = itemEl.querySelector('input[type="number"]');
      if (!input) return;
      const current = normalizeStock(input.value);
      const next = normalizeStock(current + step);
      input.value = String(next);
      updateMenuOverride(itemEl.dataset.id, { stock: next });
      setAdminMenuMessage('Đã lưu thay đổi số lượng (lưu cục bộ).', 'ok');
    });

    menuList.addEventListener('change', (event) => {
      const itemEl = event.target.closest('.admin-menu-item');
      if (!itemEl) return;
      if (event.target.type === 'number') {
        const next = normalizeStock(event.target.value);
        event.target.value = String(next);
        updateMenuOverride(itemEl.dataset.id, { stock: next });
        setAdminMenuMessage('Đã lưu thay đổi số lượng (lưu cục bộ).', 'ok');
        return;
      }
      if (event.target.type === 'checkbox') {
        updateMenuOverride(itemEl.dataset.id, { paused: event.target.checked });
        setAdminMenuMessage('Đã cập nhật trạng thái bán (lưu cục bộ).', 'ok');
      }
    });

    if (menuResetBtn) {
      menuResetBtn.addEventListener('click', async () => {
        try {
          // Clear server too
          await fetch(`${API_BASE_URL}/menu`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-Admin-Password': ADMIN_PASSWORD
            },
            body: JSON.stringify([])
          });
          saveMenuOverrides({});
          pendingMenuChanges.clear();
          renderAdminMenu();
          window.dispatchEvent(new CustomEvent('menu:updated'));
          setAdminMenuMessage('Đã khôi phục mặc định (server + local).', 'ok');
        } catch (error) {
          setAdminMenuMessage('Reset local thành công (server offline).', 'ok');
          saveMenuOverrides({});
          pendingMenuChanges.clear();
          renderAdminMenu();
          window.dispatchEvent(new CustomEvent('menu:updated'));
        }
      });
    }

    const saveBtn = document.getElementById('adminMenuSaveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', saveMenuToServer);
    }

    updateSaveButtonState();
    await renderAdminMenu(); // Await for async overrides
  }
}

function setAdminAuthMessage(text, type = '') {
  const msg = document.getElementById('adminAuthMsg');
  if (!msg) return;
  msg.textContent = text;
  msg.className = `form-msg ${type}`.trim();
}

function bindAdminGate() {
  const authBox = document.getElementById('adminAuthBox');
  const panelWrap = document.getElementById('adminPanelWrap');
  const passwordInput = document.getElementById('adminPasswordInput');
  const unlockBtn = document.getElementById('adminUnlockBtn');

  if (!authBox || !panelWrap || !passwordInput || !unlockBtn) {
    bindAdminPanel();
    return;
  }

  const normalizePassword = (value) =>
    String(value || '')
      .normalize('NFKC')
      .replace(/\s+/g, '')
      .toLowerCase();

  const unlock = () => {
    const provided = normalizePassword(passwordInput.value);
    const expected = normalizePassword(ADMIN_PASSWORD);

    if (!provided) {
      setAdminAuthMessage('Vui lòng nhập mật khẩu admin.', 'err');
      return;
    }

    if (provided !== expected) {
      setAdminAuthMessage('Sai mật khẩu admin.', 'err');
      return;
    }

    panelWrap.hidden = false;
    authBox.hidden = true;
    setAdminAuthMessage('Mở khóa admin thành công.', 'ok');
    bindAdminPanel();
  };

  unlockBtn.addEventListener('click', unlock);
  passwordInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') unlock();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindAdminGate);
} else {
  bindAdminGate();
}
})();
