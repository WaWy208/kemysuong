from pathlib import Path
path = Path('app.js')
text = path.read_text(encoding='utf-8-sig')
start = text.index('function renderMenu() {')
end = text.index('function bindFilterControls() {')
new_block = """function renderMenu() {
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
    const stockCaption = isPaused ? 'T?m ngung bán' : stockValue > 0 ? `Còn ${stockValue} món` : 'H?t hàng';
    const stockClass = isPaused ? 'paused' : stockValue > 0 ? 'in' : 'out';
    const buttonLabel = isAvailable ? 'Thêm vào gi?' : isPaused ? 'T?m ngung bán' : 'T?m h?t hàng';
    return `
      <article class="item reveal ${isAvailable ? 'in-stock' : 'out-stock'} ${isPaused ? 'paused-item' : ''}">
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
    root.innerHTML = '<p class="empty-result">Không tìm th?y món phù h?p v?i b? l?c hi?n t?i.</p>';
  }

  revealOnScroll();
}
"""
text = text[:start] + new_block + text[end:]
path.write_text(text, encoding='utf-8-sig')
