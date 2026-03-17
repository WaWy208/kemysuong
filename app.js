const menuItems = [
  {
    id: 'kem-que-socola-gion-tan',
    name: 'Kem Que Socola Giòn Tan',
    type: 'cream',
    price: 5000,
    stock: 120,
    desc: 'Lớp socola phủ giòn, bên trong mịn béo.',
    image: 'img/socolagiontan3.jpg',
    alt: 'Kem que socola gion tan'
  },
  {
    id: 'kem-que-sua-dua',
    name: 'Kem Que Sữa Dừa',
    type: 'cream',
    price: 5000,
    stock: 90,
    desc: 'Thơm dừa tự nhiên, vị sữa dịu nhẹ.',
    image: 'img/kemsuadua.jpg',
    alt: 'Kem que sua dua'
  },
  {
    id: 'kem-que-bap',
    name: 'Kem Que Bắp',
    type: 'cream',
    price: 3000,
    stock: 80,
    desc: 'Mùi bắp non, hậu vị ngọt thanh.',
    image: 'img/kembap.jpg',
    alt: 'Kem que bap'
  },
  {
    id: 'kem-chuoi',
    name: 'Kem Chuối',
    type: 'cream',
    price: 4000,
    stock: 0,
    desc: 'Vị chuối chín thơm, ngọt dịu và mát lạnh,nước cốt béo ngậy.',
    image: 'img/kemchuoi.jpg',
    alt: 'Kem chuoi'
  },
  {
    id: 'kem-ly-vani',
    name: 'Kem Ly Vani',
    type: 'cup',
    price: 3000,
    stock: 65,
    desc: 'Vani cổ điển, mịn và thơm nhẹ.',
    image: 'img/kemlyvani.jpg',
    alt: 'Kem ly vani'
  },
  {
    id: 'kem-ly-sau-rieng',
    name: 'Kem Ly Sầu Riêng',
    type: 'cup',
    price: 3000,
    stock: 50,
    desc: 'Đậm mùi sầu riêng chín, béo mượt.',
    image: 'img/kemlysaurieng.jpg',
    alt: 'Kem ly sau rieng'
  },
  {
    id: 'kem-ly-socola',
    name: 'Kem Ly Socola',
    type: 'cup',
    price: 3000,
    stock: 70,
    desc: 'Socola đậm vị, cân bằng độ ngọt.',
    image: 'img/kemlysocola.jpg',
    alt: 'Kem ly socola'
  },
  {
    id: 'kem-ly-dau',
    name: 'Kem Ly Dâu',
    type: 'cup',
    price: 3000,
    stock: 55,
    desc: 'Vị dâu tươi, thơm và chua nhẹ.',
    image: 'img/kemlydauda.jpg',
    alt: 'Kem ly dau'
  },
  {
    id: 'kem-ly-socola-cao-cap',
    name: 'Kem Ly Socola Cao Cấp',
    type: 'premium-cup',
    price: 5000,
    stock: 40,
    desc: 'Blend cacao premium, đậm và mượt.',
    image: 'img/kemlysocoladacbiet.jpg',
    alt: 'Kem ly socola cao cap'
  },
  {
    id: 'kem-ly-dau-cao-cap',
    name: 'Kem Ly Dâu Cao Cấp',
    type: 'premium-cup',
    price: 5000,
    stock: 35,
    desc: 'Dâu nguyên quả xay lạnh, vị tươi rõ.',
    image: 'img/kemlydaudacbiet.jpg',
    alt: 'Kem ly dau cao cap'
  },
  {
    id: 'yaourt-truyen-thong',
    name: 'Yaourt Truyền Thống',
    type: 'yogurt',
    price: 3000,
    stock: 75,
    desc: 'Chua nhẹ, mịn, ăn mát và dễ chịu.',
    image: 'img/yaouourt.jpg',
    alt: 'Yaourt truyen thong'
  },
  {
    id: 'da-dau-truyen-thong',
    name: 'Đá Đậu Truyền Thống',
    type: 'bean-dessert',
    price: 3000,
    stock: 40,
    desc: 'Đậu mềm, nước cốt béo, mát lạnh.',
    image: 'img/dadau.jpg',
    alt: 'Da dau truyen thong'
  }
];

window.menuItems = menuItems;
const MENU_BASELINE = menuItems.reduce((acc, item) => {
  acc[item.id] = { stock: item.stock, paused: Boolean(item.paused) };
  return acc;
}, {});

const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;
const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ALLOW_EFFECTS = !IS_TOUCH && !PREFERS_REDUCED_MOTION;

const reviews = [
  {
    quote: 'Kem mịn cực kỳ, vị rõ và không ngấy. Mình quay lại gần như mỗi cuối tuần.',
    author: 'Linh Chi - Khách hàng thân thiết'
  },
  {
    quote: 'Đặt trên web nhanh, nhận hàng đúng giờ và đóng gói rất ổn.',
    author: 'Minh Kha - Nhân viên văn phòng'
  },
  {
    quote: 'Giá hợp lý, có mã giảm và ship nhanh. Trải nghiệm rất ổn.',
    author: 'Hoàng Nam - Khách hàng mới'
  }
];

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const THEME_KEY = 'kem-y-suong-theme';
const CART_KEY = 'kem-y-suong-cart';
const PROMO_KEY = 'kem-y-suong-promo';
const MENU_OVERRIDE_KEY = 'kem-y-suong-menu-overrides';
const SHIPPING_FEE_DELIVERY = 0;
const BANK_TRANSFER_INFO = {
  bankBin: '970422',
  bankName: 'MB Bank',
  accountNumber: '0877169913',
  accountName: 'BUI QUANG QUY'
};

const STORE_INFO = {
  address: 'Hồng Dân, Bạc Liêu (Giao hàng tận nơi)',
  hotline: '0877169913'
};

const PROMO_CODES = {
  FREESHIP: { type: 'ship', value: 100, label: 'Miễn phí giao hàng' },
};

let reviewIndex = 0;
let reviewTimer = null;
let cart = [];
let activeFilter = 'all';
let activePromo = null;
let previewTransferCode = 'KYS-TAMTINH';

function renderMenuSkeleton(count = 6) {
  const root = document.getElementById('menuGrid');
  if (!root) return;
  const items = Array.from({ length: Math.max(1, Number(count) || 6) });
  root.innerHTML = `
    <div class="skeleton-grid" aria-hidden="true">
      ${items.map(() => `
        <div class="skeleton-card">
          <div class="skeleton-thumb"></div>
          <div class="skeleton-body">
            <div class="skeleton-line w-70"></div>
            <div class="skeleton-line w-55"></div>
            <div class="skeleton-line w-40"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function loadMenuOverrides() {
  try {
    const raw = localStorage.getItem(MENU_OVERRIDE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_error) {
    return {};
  }
}

function applyMenuOverrides() {
  const overrides = loadMenuOverrides();
  menuItems.forEach((item) => {
    const base = MENU_BASELINE[item.id];
    if (base) {
      item.stock = base.stock;
      item.paused = base.paused;
    }
    const override = overrides[item.id];
    if (!override) return;
    if (typeof override.stock === 'number' && Number.isFinite(override.stock)) {
      item.stock = Math.max(0, Math.floor(override.stock));
    }
    if (typeof override.paused === 'boolean') {
      item.paused = override.paused;
    }
  });
}

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
  if (btn) {
    const nextLabel = theme === 'dark' ? 'sáng' : 'tối';
    btn.setAttribute('aria-label', `Chuyển sang giao diện ${nextLabel}`);
  }
}

function bindThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  applyTheme(getInitialTheme());

  btn.addEventListener('click', () => {
    btn.classList.remove('is-animating');
    void btn.offsetWidth;
    btn.classList.add('is-animating');

    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  btn.addEventListener('animationend', () => {
    btn.classList.remove('is-animating');
  });
}

function bindMobileMenu() {
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  if (!btn || !nav) return;

  const closeMenu = () => {
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Mở menu');
  };

  btn.addEventListener('click', (event) => {
    event.stopPropagation();
    const willOpen = !nav.classList.contains('open');
    nav.classList.toggle('open', willOpen);
    btn.setAttribute('aria-expanded', String(willOpen));
    btn.setAttribute('aria-label', willOpen ? 'Đóng menu' : 'Mở menu');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && !btn.contains(event.target)) closeMenu();
  });
}

function revealOnScroll() {
  if (!ALLOW_EFFECTS) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('show'));
    return;
  }
  const blocks = document.querySelectorAll('.reveal:not(.show)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  blocks.forEach((block) => observer.observe(block));
}

function countUp() {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const isFloat = String(el.dataset.count).includes('.');
    let current = 0;
    const step = target / 45;

    const tick = () => {
      current += step;
      if (current >= target) {
        el.textContent = isFloat ? target.toFixed(1) : Math.round(target).toString();
        return;
      }
      el.textContent = isFloat ? current.toFixed(1) : Math.round(current).toString();
      requestAnimationFrame(tick);
    };

    tick();
  });
}

function renderReview() {
  const root = document.getElementById('reviewCard');
  if (!root || !reviews.length) return;
  const current = reviews[reviewIndex];
  root.innerHTML = `<p>"${escapeHtml(current.quote)}"</p><span>${escapeHtml(current.author)}</span>`;
}

function goReview(step) {
  reviewIndex = (reviewIndex + step + reviews.length) % reviews.length;
  renderReview();
}

function bindReviewControls() {
  const prev = document.getElementById('prevReview');
  const next = document.getElementById('nextReview');
  if (!prev || !next || !reviews.length) return;
  prev.addEventListener('click', () => goReview(-1));
  next.addEventListener('click', () => goReview(1));
  if (reviewTimer) clearInterval(reviewTimer);
  reviewTimer = setInterval(() => goReview(1), 6000);
}

function bindMagneticButtons() {
  if (!ALLOW_EFFECTS) return;
  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.08}px, ${y * 0.1}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

function bind3dTilt() {
  if (!ALLOW_EFFECTS) return;
  if (!window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll('[data-tilt]').forEach((el) => {
    if (el.dataset.tiltBound === 'true') return;
    el.dataset.tiltBound = 'true';

    const maxTilt = Number(el.dataset.tilt) || 12;
    const depth = Number(el.dataset.tiltDepth) || 12;

    const reset = () => {
      el.style.setProperty('--tilt-rotate', 'rotateX(0deg) rotateY(0deg)');
      el.style.setProperty('--tilt-translate', 'translateZ(0)');
      el.classList.remove('is-tilting');
    };

    el.addEventListener('mousemove', (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const percentX = (x / rect.width - 0.5) * 2;
      const percentY = (y / rect.height - 0.5) * 2;
      const rotateY = -(percentX * maxTilt);
      const rotateX = percentY * maxTilt;

      el.style.setProperty('--tilt-rotate', `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
      el.style.setProperty('--tilt-translate', `translateZ(${depth}px)`);
      el.style.setProperty('--tilt-glow-x', `${(percentX + 0.5) * 100}%`);
      el.style.setProperty('--tilt-glow-y', `${(percentY + 0.5) * 100}%`);
      el.classList.add('is-tilting');
    });

    el.addEventListener('mouseleave', reset);
  });
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getProductById(id) {
  return menuItems.find((item) => item.id === id);
}

function normalizeCartItems(list = []) {
  const merged = new Map();

  list.forEach((entry) => {
    const product = getProductById(entry?.id);
    if (!product || product.paused || product.stock <= 0) return;

    const stockLimit = Number(product.stock) || Infinity;
    const incomingQty = Math.min(Math.max(Number(entry.quantity) || 0, 0), stockLimit);
    if (!incomingQty) return;

    const existing = merged.get(product.id);
    const nextQty = Math.min((existing?.quantity || 0) + incomingQty, stockLimit);

    merged.set(product.id, {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: nextQty
    });
  });

  return Array.from(merged.values());
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cart = Array.isArray(parsed) ? normalizeCartItems(parsed) : [];
  } catch (_err) {
    cart = [];
  }
}

function getCartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderType = document.getElementById('orderType')?.value || 'DELIVERY';
  const baseShipping = orderType === 'PICKUP' ? 0 : SHIPPING_FEE_DELIVERY;

  let discount = 0;
  let shipping = baseShipping;

  if (activePromo) {
    if (activePromo.type === 'percent') discount = Math.round((subtotal * activePromo.value) / 100);
    if (activePromo.type === 'fixed') discount = activePromo.value;
    if (activePromo.type === 'ship') shipping = 0;
  }

  discount = Math.min(discount, subtotal);
  const total = Math.max(0, subtotal - discount + shipping);

  return { subtotal, discount, shipping, total };
}

function updateCartCount() {
  // Badge hiển thị số dòng sản phẩm (không phải tổng số lượng)
  const count = cart.length;
  const el = document.getElementById('cartCount');
  const dockEl = document.getElementById('cartCountDock');
  if (el) el.textContent = String(count);
  if (dockEl) dockEl.textContent = String(count);
}

function addToCart(productId) {
  const product = getProductById(productId);
  if (!product || product.stock <= 0 || product.paused) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    const stockLimit = Number(product.stock) || Infinity;
    const currentQty = Math.max(Number(existing.quantity) || 0, 0);
    if (currentQty >= stockLimit) return;
    existing.quantity = Math.min(currentQty + 1, stockLimit);
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 });
  }

  saveCart();
  updateCartCount();
  renderCart();
}

function updateCartItem(productId, nextQuantity) {
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;

  const product = getProductById(productId);
  if (!product) return;

  const desiredQty = Math.max(Number(nextQuantity) || 0, 0);

  if (desiredQty <= 0) {
    cart = cart.filter((entry) => entry.id !== productId);
  } else {
    const stockLimit = Number(product.stock) || Infinity;
    item.quantity = Math.min(desiredQty, stockLimit);
  }

  saveCart();
  updateCartCount();
  renderCart();
}

function syncCartAvailability() {
  let changed = false;
  cart = cart.filter((entry) => {
    const product = getProductById(entry.id);
    if (!product || product.paused || product.stock <= 0) {
      changed = true;
      return false;
    }
    if (entry.quantity > product.stock) {
      entry.quantity = product.stock;
      changed = true;
    }
    return entry.quantity > 0;
  });

  if (changed) saveCart();
  return changed;
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

function renderCart() {
  updateCartCount();

  const cartList = document.getElementById('cartList');
  const emptyState = document.getElementById('cartEmpty');
  const subtotalEl = document.getElementById('subtotalValue');
  const discountEl = document.getElementById('discountValue');
  const shippingEl = document.getElementById('shippingValue');
  const totalEl = document.getElementById('totalValue');

  if (!cartList || !emptyState) return;

  if (!cart.length) {
    cartList.innerHTML = '';
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    cartList.innerHTML = cart.map((item) => `
      <article class="cart-item">
        <img src="${item.image}" alt="${item.name}" width="120" height="90" loading="lazy" decoding="async" />
        <div class="cart-item-body">
          <h4>${item.name}</h4>
          <p>${currency.format(item.price)}</p>
          <div class="cart-item-actions">
            <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
            <button type="button" class="remove-btn" data-action="remove" data-id="${item.id}">Xóa</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  if (subtotalEl || discountEl || shippingEl || totalEl) {
    const totals = getCartTotals();
    if (subtotalEl) subtotalEl.textContent = currency.format(totals.subtotal);
    if (discountEl) discountEl.textContent = `- ${currency.format(totals.discount)}`;
    if (shippingEl) shippingEl.textContent = currency.format(totals.shipping);
    if (totalEl) totalEl.textContent = currency.format(totals.total);
  }

  updateBankTransferBox();
}

function setCheckoutMessage(text, type = '') {
  const msg = document.getElementById('checkoutMsg');
  if (!msg) return;
  msg.textContent = text;
  msg.className = `form-msg ${type}`.trim();
}

function applyPromo() {
  const input = document.getElementById('promoInput');
  if (!input) return;
  const code = String(input.value || '').trim().toUpperCase();

  if (!code) {
    activePromo = null;
    localStorage.removeItem(PROMO_KEY);
    setCheckoutMessage('Đã bỏ mã giảm giá.', 'ok');
    renderCart();
    return;
  }

  if (!PROMO_CODES[code]) {
    setCheckoutMessage('Mã giảm giá không hợp lệ.', 'err');
    return;
  }

  activePromo = PROMO_CODES[code];
  localStorage.setItem(PROMO_KEY, code);
  setCheckoutMessage(`Áp dụng thành công: ${activePromo.label}`, 'ok');
  renderCart();
}

function loadPromoFromStorage() {
  const code = localStorage.getItem(PROMO_KEY);
  if (code && PROMO_CODES[code]) {
    activePromo = PROMO_CODES[code];
    const input = document.getElementById('promoInput');
    if (input) input.value = code;
  }
}

function bindCartEvents() {
  const menuGrid = document.getElementById('menuGrid');
  const cartList = document.getElementById('cartList');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const applyPromoBtn = document.getElementById('applyPromoBtn');
  const orderType = document.getElementById('orderType');
  if (!menuGrid || !cartList || !clearCartBtn) return;

  menuGrid.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-add-id]');
    if (!button) return;
    addToCart(button.dataset.addId);
  });

  cartList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const { action, id } = button.dataset;
    const item = cart.find((entry) => entry.id === id);
    if (!item) return;

    if (action === 'increase') updateCartItem(id, item.quantity + 1);
    if (action === 'decrease') updateCartItem(id, item.quantity - 1);
    if (action === 'remove') updateCartItem(id, 0);
  });

  clearCartBtn.addEventListener('click', clearCart);
  if (applyPromoBtn) applyPromoBtn.addEventListener('click', applyPromo);
  if (orderType) {
    orderType.addEventListener('change', () => {
    const addressField = document.getElementById('addressField');
    if (!addressField) {
      renderCart();
      return;
    }
    const isPickup = orderType.value === 'PICKUP';
    addressField.required = !isPickup;
    if (isPickup) addressField.value = 'Nhận tại quầy';
    renderCart();
  });
  }
}

function generateOrderCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const size = 8;
  let output = '';

  if (window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(size);
    window.crypto.getRandomValues(bytes);
    for (let i = 0; i < size; i += 1) {
      output += alphabet[bytes[i] % alphabet.length];
    }
  } else {
    for (let i = 0; i < size; i += 1) {
      output += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }

  return `KYS-${output}`;
}

function buildBankQrUrl(amount, content) {
  const safeAmount = Math.max(0, Number(amount) || 0);
  const addInfo = encodeURIComponent(String(content || previewTransferCode));
  const accountName = encodeURIComponent(BANK_TRANSFER_INFO.accountName);
  return `https://img.vietqr.io/image/${BANK_TRANSFER_INFO.bankBin}-${BANK_TRANSFER_INFO.accountNumber}-compact2.png?amount=${safeAmount}&addInfo=${addInfo}&accountName=${accountName}`;
}

async function processAutoGatewayPayment(amount) {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return {
    status: 'PAID',
    transactionId: `GW-${generateOrderCode().replace('KYS-', '')}`,
    amount
  };
}

function updateBankTransferBox(orderCode = null, orderAmount = null) {
  const form = document.getElementById('checkoutForm');
  const box = document.getElementById('bankTransferBox');
  if (!form || !box) return;

  const paymentMethod = form.querySelector('select[name="paymentMethod"]');
  const isBankTransfer = paymentMethod?.value === 'BANK_TRANSFER';
  box.hidden = !isBankTransfer;
  if (!isBankTransfer) return;

  const totals = getCartTotals();
  const amount = Number.isFinite(orderAmount) ? orderAmount : totals.total;
  const amountEl = document.getElementById('bankAmount');
  const contentEl = document.getElementById('bankContent');
  const bankNameEl = document.getElementById('bankName');
  const bankAccountEl = document.getElementById('bankAccountNumber');
  const bankOwnerEl = document.getElementById('bankAccountName');
  const qrImageEl = document.getElementById('bankQrImage');
  const transferContent = orderCode || previewTransferCode;

  if (amountEl) amountEl.textContent = currency.format(amount);
  if (bankNameEl) bankNameEl.textContent = BANK_TRANSFER_INFO.bankName;
  if (bankAccountEl) bankAccountEl.textContent = BANK_TRANSFER_INFO.accountNumber;
  if (bankOwnerEl) bankOwnerEl.textContent = BANK_TRANSFER_INFO.accountName;
  if (contentEl) contentEl.textContent = transferContent;
  if (qrImageEl) qrImageEl.src = buildBankQrUrl(amount, transferContent);
}

function updateAutoGatewayBox() {
  const form = document.getElementById('checkoutForm');
  const gatewayBox = document.getElementById('autoGatewayBox');
  if (!form || !gatewayBox) return;
  const paymentMethod = form.querySelector('select[name="paymentMethod"]');
  gatewayBox.hidden = paymentMethod?.value !== 'AUTO_GATEWAY';
}

function bindCheckoutForm() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;
  const phoneInput = form.querySelector('input[name="phone"]');
  if (phoneInput) {
    const enforcePhoneLength = () => {
      const digits = String(phoneInput.value || '').replace(/\D/g, '').slice(0, 10);
      phoneInput.value = digits;
      const message = digits.length === 10 ? '' : 'Số điện thoại cần đủ 10 số.';
      phoneInput.setCustomValidity(message);
    };
    phoneInput.addEventListener('input', enforcePhoneLength);
    enforcePhoneLength();
  }

  const paymentMethod = form.querySelector('select[name="paymentMethod"]');
  if (paymentMethod) {
    paymentMethod.addEventListener('change', () => {
      updateBankTransferBox();
      updateAutoGatewayBox();
    });
  }
  updateBankTransferBox();
  updateAutoGatewayBox();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const hadChanges = syncCartAvailability();
    if (hadChanges) {
      setCheckoutMessage('Một số món đã tạm ngưng bán hoặc hết hàng. Vui lòng kiểm tra lại giỏ hàng.', 'err');
      renderCart();
      return;
    }

    if (!cart.length) {
      setCheckoutMessage('Giỏ hàng trống. Hãy thêm sản phẩm trước khi thanh toán.', 'err');
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const termsCheck = document.getElementById('termsCheck');
    if (termsCheck && !termsCheck.checked) {
      setCheckoutMessage('Bạn cần xác nhận thông tin đơn hàng.', 'err');
      return;
    }

    const data = new FormData(form);
    const phone = String(data.get('phone') || '').trim();
    const totals = getCartTotals();
    const orderCode = generateOrderCode();
    previewTransferCode = generateOrderCode();

    // Save user phone for my-orders filtering
    setUserPhone(phone);  // Note: setUserPhone from my-orders.js is global

    const order = {
      orderCode,
      customerName: String(data.get('customerName') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      orderType: data.get('orderType'),
      address: String(data.get('address') || '').trim(),
      note: String(data.get('note') || '').trim(),
      paymentMethod: data.get('paymentMethod'),
      items: cart.map((item) => `${item.name} x${item.quantity}`),
      total: totals.total,
      paymentStatus: 'PENDING',
      transactionId: '',
      createdAt: new Date().toISOString()
    };

    const method = String(data.get('paymentMethod') || '');
    if (method === 'BANK_TRANSFER') {
      order.paymentStatus = 'WAITING_TRANSFER';
      updateBankTransferBox(orderCode, totals.total);
      setCheckoutMessage(`Đặt hàng thành công. Chuyển khoản ${currency.format(totals.total)} với nội dung ${orderCode}.`, 'ok');
    } else if (method === 'AUTO_GATEWAY') {
      setCheckoutMessage('Đang xử lý giao dịch tự động...', 'ok');
      const paymentResult = await processAutoGatewayPayment(totals.total);
      order.paymentStatus = paymentResult.status;
      order.transactionId = paymentResult.transactionId;
      setCheckoutMessage(`Thanh toán tự động thành công. Mã giao dịch: ${paymentResult.transactionId}`, 'ok');
    } else {
      order.paymentStatus = 'UNPAID';
      setCheckoutMessage(`Đặt hàng thành công. Mã đơn của bạn: ${orderCode}`, 'ok');
    }

    if (window.OrderDB && typeof window.OrderDB.addOrder === 'function') {
      window.OrderDB.addOrder(order, cart);
    }

    cart = [];
    saveCart();
    localStorage.removeItem(PROMO_KEY);
    activePromo = null;
    const promoInput = document.getElementById('promoInput');
    if (promoInput) promoInput.value = '';
    form.reset();
    renderCart();
    if (method === 'BANK_TRANSFER' && paymentMethod) {
      paymentMethod.value = 'BANK_TRANSFER';
      updateBankTransferBox(orderCode, totals.total);
      updateAutoGatewayBox();
    } else if (method === 'AUTO_GATEWAY' && paymentMethod) {
      paymentMethod.value = 'AUTO_GATEWAY';
      updateBankTransferBox();
      updateAutoGatewayBox();
    } else {
      updateBankTransferBox();
      updateAutoGatewayBox();
    }
  });
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function renderMenu() {
  const root = document.getElementById('menuGrid');
  if (!root) return;
  const searchText = normalizeText(document.getElementById('searchInput')?.value);
  const sortBy = document.getElementById('sortSelect')?.value || 'default';
  const stockOnly = document.getElementById('stockOnly')?.checked;
  const inStockCountEl = document.getElementById('inStockCount');
  const outStockCountEl = document.getElementById('outStockCount');

  let items = menuItems.filter((item) => {
    const stockValue = Number(item.stock || 0);
    const matchFilter = activeFilter === 'all' || item.type === activeFilter;
    const matchSearch = normalizeText(item.name).includes(searchText);
    const matchStock = !stockOnly || (stockValue > 0 && !item.paused);
    return matchFilter && matchSearch && matchStock;
  });

  const availableCount = items.filter((item) => Number(item.stock || 0) > 0 && !item.paused).length;
  const soldOutCount = items.length - availableCount;
  if (inStockCountEl) inStockCountEl.textContent = String(availableCount);
  if (outStockCountEl) outStockCountEl.textContent = String(Math.max(soldOutCount, 0));

  if (sortBy === 'price-asc') items = [...items].sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') items = [...items].sort((a, b) => b.price - a.price);
  if (sortBy === 'name-asc') items = [...items].sort((a, b) => a.name.localeCompare(b.name));

  root.innerHTML = items.map((item) => {
    const stockValue = Number(item.stock || 0);
    const isPaused = Boolean(item.paused);
    const isAvailable = stockValue > 0 && !isPaused;
    const stockCaption = isPaused ? 'Tạm ngưng bán' : stockValue > 0 ? `Còn ${stockValue} món` : 'Hết hàng';
    const stockClass = isPaused ? 'paused' : stockValue > 0 ? 'in' : 'out';
    const buttonLabel = isAvailable ? 'Thêm vào giỏ' : isPaused ? 'Tạm ngưng bán' : 'Tạm hết hàng';
    return `
      <article class="item reveal tilt-card ${isAvailable ? 'in-stock' : 'out-stock'} ${isPaused ? 'paused-item' : ''}" data-tilt="10" data-tilt-depth="10">
        <img src="${item.image}" alt="${item.alt}" width="640" height="480" loading="lazy" decoding="async" />
        <div class="item-body">
          <div class="item-head">
            <h3>${item.name}</h3>
            <span class="price">${currency.format(item.price)}</span>
          </div>
          <p>${item.desc}</p>
          <p class="stock-tag ${stockClass}">${stockCaption}</p>
          <button type="button" class="btn btn-solid add-cart-btn" data-add-id="${item.id}" ${isAvailable ? '' : 'disabled'}>${buttonLabel}</button>
        </div>
      </article>
    `;
  }).join('');

  if (!items.length) {
    root.innerHTML = '<p class="empty-result">Không tìm thấy món phù hợp với bộ lọc hiện tại.</p>';
  }

  revealOnScroll();
  bind3dTilt();
}
function bindFilterControls() {
  const chips = document.querySelectorAll('.chip');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const stockOnly = document.getElementById('stockOnly');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeFilter = chip.dataset.filter;
      renderMenu();
    });
  });

  if (searchInput) searchInput.addEventListener('input', renderMenu);
  if (sortSelect) sortSelect.addEventListener('change', renderMenu);
  if (stockOnly) stockOnly.addEventListener('change', renderMenu);
}

window.addEventListener('menu:updated', () => {
  applyMenuOverrides();
  const changed = syncCartAvailability();
  renderMenu();
  renderCart();
  if (changed) setCheckoutMessage('Một số món đã tạm ngưng bán hoặc hết hàng. Vui lòng kiểm tra lại giỏ hàng.', 'err');
});

// Expose setUserPhone globally for app.js checkout
window.setUserPhone = (phone) => {
  try {
    localStorage.setItem('kem-y-suong-user-phone', String(phone || '').trim());
  } catch {
    // ignore
  }
};

function init() {
  bindThemeToggle();
  bindMobileMenu();
  bindFilterControls();
  bindCartEvents();
  bindCheckoutForm();
  bindReviewControls();
  bindMagneticButtons();

  // Instant feedback on first load
  renderMenuSkeleton(6);

  loadCart();
  loadPromoFromStorage();

  applyMenuOverrides();
  syncCartAvailability();
  renderMenu();
  renderCart();
  renderReview();

  bind3dTilt();
  revealOnScroll();
  countUp();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

