/* ===== Global State ===== */
let cartCount = parseInt(localStorage.getItem('cartCount') || '0');

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initHeader();
  initHamburger();
  initBackTop();
  initPriceRange();
  initSearchEnter();
});

/* ===== Header Scroll Effect ===== */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

/* ===== Hamburger / Mobile Menu ===== */
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = !menu.classList.contains('open');
    btn.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
      btn.classList.remove('open');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ===== Cart Badge ===== */
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  badge.textContent = cartCount;
  badge.style.display = cartCount === 0 ? 'none' : 'flex';
}

/* ===== Add to Cart ===== */
function addToCart(btn, productName) {
  cartCount++;
  localStorage.setItem('cartCount', cartCount);
  updateCartBadge();

  // Button feedback
  const original = btn.innerHTML;
  btn.classList.add('added');
  btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> 已加入購物車`;

  setTimeout(() => {
    btn.classList.remove('added');
    btn.innerHTML = original;
  }, 1800);

  // Badge bump animation
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.classList.add('bump');
    setTimeout(() => badge.classList.remove('bump'), 300);
  }

  showToast(`「${productName}」已加入購物車`);
}

/* ===== Wishlist Toggle ===== */
function toggleWish(btn) {
  const isActive = btn.classList.toggle('active');
  btn.innerHTML = isActive
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="#FF6B6B" stroke="#FF6B6B" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

  showToast(isActive ? '已加入收藏清單' : '已從收藏移除');
}

/* ===== Toast Notification ===== */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ===== Back to Top ===== */
function initBackTop() {
  const btn = document.getElementById('backTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
}

/* ===== Category Filter ===== */
function filterCategory(el, name) {
  document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  showToast(`已切換至「${name}」分類`);
}

/* ===== Price Range ===== */
function initPriceRange() {
  const ranges = document.querySelectorAll('.price-range');
  ranges.forEach(r => updatePrice(r));
}

function updatePrice(input) {
  const val = parseInt(input.value);
  const pct = ((val / parseInt(input.max)) * 100).toFixed(1);
  input.style.setProperty('--val', pct + '%');

  // Update display label (next sibling container)
  const wrap = input.closest('.price-range-wrap');
  if (wrap) {
    const display = wrap.querySelector('#priceMax') || wrap.querySelectorAll('.price-display span')[1];
    if (display) display.textContent = `NT$${val.toLocaleString()}`;
  }
}

/* ===== Mobile Filter Drawer ===== */
function openFilterDrawer() {
  document.getElementById('filterOverlay')?.classList.add('open');
  document.getElementById('filterDrawer')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeFilterDrawer() {
  document.getElementById('filterOverlay')?.classList.remove('open');
  document.getElementById('filterDrawer')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ===== Clear Filters ===== */
function clearFilters() {
  document.querySelectorAll('.filter-item input[type="checkbox"]').forEach(cb => { cb.checked = false; });
  const ranges = document.querySelectorAll('.price-range');
  ranges.forEach(r => { r.value = r.max; updatePrice(r); });
  showToast('已清除所有篩選條件');
  updateProductCount();
}

/* ===== Product Count ===== */
function updateProductCount() {
  const el = document.getElementById('productCount');
  if (!el) return;
  // Simulate dynamic count
  const base = 12;
  const checked = document.querySelectorAll('.filter-item input:checked').length;
  const count = Math.max(1, base - Math.floor(Math.random() * checked * 2));
  el.textContent = `共 ${count} 件商品`;
}

/* ===== Sort Products ===== */
function sortProducts() {
  const select = document.getElementById('sortSelect');
  const grid = document.getElementById('productsGrid');
  if (!select || !grid) return;

  const cards = Array.from(grid.querySelectorAll('.product-card'));

  cards.sort((a, b) => {
    const priceA = parseInt(a.dataset.price || 0);
    const priceB = parseInt(b.dataset.price || 0);
    const ratingA = parseFloat(a.dataset.rating || 0);
    const ratingB = parseFloat(b.dataset.rating || 0);

    switch (select.value) {
      case 'price-asc':  return priceA - priceB;
      case 'price-desc': return priceB - priceA;
      case 'rating':     return ratingB - ratingA;
      default:           return 0; // keep original
    }
  });

  // Animate re-order
  cards.forEach(c => {
    c.style.opacity = '0';
    c.style.transform = 'translateY(8px)';
  });
  grid.innerHTML = '';
  cards.forEach((c, i) => {
    grid.appendChild(c);
    setTimeout(() => {
      c.style.transition = 'opacity .25s, transform .25s';
      c.style.opacity = '1';
      c.style.transform = 'translateY(0)';
    }, i * 40);
  });
}

/* ===== Filter Tag Toggle ===== */
function toggleTag(el) {
  const siblings = el.closest('.filter-tags').querySelectorAll('.filter-tag');
  siblings.forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

/* ===== Search Enter Key ===== */
function initSearchEnter() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      showToast(`搜尋「${input.value.trim()}」中...`);
      setTimeout(() => {
        if (!window.location.pathname.includes('products')) {
          window.location.href = 'products.html';
        }
      }, 600);
    }
  });
}
