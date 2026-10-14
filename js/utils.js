// ===== GAMESTORE - UTILITY FUNCTIONS =====

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(60px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatPrice(price) {
  if (price === 0) return 'Ücretsiz';
  return '₺' + price.toLocaleString('tr-TR');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function stockBadgeHTML(stock) {
  if (stock <= 0) return '<span class="stock-badge out-of-stock">Tükendi</span>';
  if (stock <= 5) return `<span class="stock-badge low-stock">Az Kaldı (${stock})</span>`;
  return `<span class="stock-badge in-stock">Stokta</span>`;
}

function stockInfoHTML(stock) {
  if (stock <= 0) return `<div class="stock-info"><div class="stock-dot red"></div><span class="stock-count" style="color:var(--accent-red)">Tükendi</span></div>`;
  if (stock <= 5) return `<div class="stock-info"><div class="stock-dot orange"></div><span class="stock-count" style="color:var(--accent-orange)">Az kaldı — ${stock} adet</span></div>`;
  return `<div class="stock-info"><div class="stock-dot green"></div><span class="stock-count" style="color:var(--accent-green)">Stokta — ${stock} adet</span></div>`;
}

// Oyun görseli HTML'i (resim varsa img, yoksa emoji)
function gameImageHTML(product, cssClass = 'game-card-img-placeholder') {
  if (product.image) {
    return `<div class="${cssClass}"><img src="${product.image}" alt="${product.title}" onerror="this.parentElement.innerHTML='<span style=\\'font-size:3rem;opacity:0.4\\'>${product.emoji || '🎮'}</span>'" loading="lazy" /></div>`;
  }
  return `<div class="${cssClass}"><span>${product.emoji || '🎮'}</span></div>`;
}

// SVG ikonlar
const NAV_ICONS = {
  home: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  store: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  library: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  wishlist: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  support: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  cart: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  admin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  logout: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
};

// Navbar render
async function renderNavbar(activePage = '') {
  const user = await DB.getCurrentUser().catch(() => null);
  const cartItems = await DB.getCart().catch(() => []);
  const cartCount = Array.isArray(cartItems) ? cartItems.length : 0;
  const cartBadge = cartCount > 0 ? `<span class="cart-badge">${cartCount}</span>` : '';

  let wishlistCount = 0;
  if (user) {
    const wl = await DB.getWishlist().catch(() => []);
    wishlistCount = Array.isArray(wl) ? wl.length : 0;
  }
  const wishBadge = wishlistCount > 0 ? `<span class="nav-badge">${wishlistCount}</span>` : '';

  // Avatar URL yardımcısı: relative yolları /site/ ile başlatır
  function _navAvatarSrc(val) {
    if (!val) return '';
    if (val.startsWith('data:') || val.startsWith('http') || val.startsWith('/')) return val;
    return '/site/' + val;
  }

  const userSection = user
    ? `<a href="profile.html" class="user-menu" style="text-decoration:none">
         <div class="user-avatar" style="overflow:hidden;border-radius:50%;border:2px solid var(--accent);background:var(--bg-secondary);padding:0;">${user.avatar && user.avatar.includes('/') && !user.avatar.startsWith('data:') ? `<img src="${_navAvatarSrc(user.avatar)}" alt="av" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-size:1.1rem\\'>${user.username[0].toUpperCase()}</span>'" />` : `<span style="font-size:1.1rem;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${(user.avatar && !user.avatar.startsWith('data:') && !user.avatar.includes('/')) ? user.avatar : user.username[0].toUpperCase()}</span>`}</div>
       </a>
       ${user.role === 'admin' ? `<a href="admin.html" class="btn btn-sm btn-secondary nav-icon-btn">${NAV_ICONS.admin} <span>Admin</span></a>` : ''}
       <button class="btn btn-sm btn-secondary nav-icon-btn" onclick="logoutAndRedirect()">${NAV_ICONS.logout} <span>Çıkış</span></button>`
    : `<a href="login.html" class="btn btn-sm btn-secondary">Giriş Yap</a>
       <a href="register.html" class="btn btn-sm btn-primary">Kayıt Ol</a>`;

  const navLinks = [
    { href: 'index.html', label: 'Ana Sayfa', key: 'index', icon: NAV_ICONS.home },
    { href: 'store.html', label: 'Mağaza', key: 'store', icon: NAV_ICONS.store },
    { href: 'library.html', label: 'Kütüphane', key: 'library', icon: NAV_ICONS.library },
    { href: 'wishlist.html', label: 'Favoriler', key: 'wishlist', icon: NAV_ICONS.wishlist, badge: wishBadge },
    { href: 'support.html', label: 'Destek', key: 'support', icon: NAV_ICONS.support },
  ];

  const linksHTML = navLinks.map(l =>
    `<a href="${l.href}" class="nav-link ${activePage === l.key ? 'active' : ''}">
      <span class="nav-link-icon">${l.icon}</span>
      <span class="nav-link-label">${l.label}</span>
      ${l.badge || ''}
    </a>`
  ).join('');

  const el = document.getElementById('navbar');
  if (!el) return;
  el.innerHTML = `
    <div class="navbar-inner">
      <a href="index.html" class="navbar-logo" style="text-decoration:none">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent-hover)"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        Game<span>Store</span>
      </a>
      <div class="navbar-links">${linksHTML}</div>
      <div class="navbar-right">
        <div class="navbar-search" id="nav-search-wrap">
          <span class="nav-search-icon">${NAV_ICONS.search}</span>
          <input type="text" id="nav-search-input" placeholder="Oyun ara..." oninput="handleNavLiveSearch()" onkeydown="handleNavSearch(event)" autocomplete="off" />
          <div class="nav-search-dropdown" id="nav-search-dropdown"></div>
        </div>
        <a href="cart.html" class="btn-cart" style="text-decoration:none;position:relative">
          ${NAV_ICONS.cart} <span>Sepet</span>${cartBadge}
        </a>
        ${userSection}
      </div>
    </div>`;

  // Dışarı tıklayınca dropdown kapat
  document.addEventListener('click', function closeSearch(e) {
    const wrap = document.getElementById('nav-search-wrap');
    if (wrap && !wrap.contains(e.target)) {
      const dd = document.getElementById('nav-search-dropdown');
      if (dd) dd.innerHTML = '';
    }
  }, { once: false, capture: true });
}

async function logoutAndRedirect() {
  await DB.logoutUser();
  DB._currentUser = null;
  showToast('Başarıyla çıkış yapıldı.', 'success');
  setTimeout(() => { window.location.href = 'index.html'; }, 600);
}

function handleNavSearch(e) {
  if (e.key === 'Enter') doNavSearch();
  if (e.key === 'Escape') {
    const dd = document.getElementById('nav-search-dropdown');
    if (dd) dd.innerHTML = '';
  }
}

function doNavSearch() {
  const val = document.getElementById('nav-search-input').value.trim();
  if (val) window.location.href = `store.html?q=${encodeURIComponent(val)}`;
}

async function handleNavLiveSearch() {
  const val = (document.getElementById('nav-search-input').value || '').trim().toLowerCase();
  const dd = document.getElementById('nav-search-dropdown');
  if (!dd) return;
  if (val.length < 2) { dd.innerHTML = ''; return; }

  const allProducts = await DB.getProducts();
  const results = allProducts.filter(p =>
    p.title.toLowerCase().includes(val) ||
    p.category.toLowerCase().includes(val) ||
    (p.tags || []).some(t => t.toLowerCase().includes(val))
  ).slice(0, 6);

  if (results.length === 0) {
    dd.innerHTML = `<div class="nav-search-no-result">Sonuç bulunamadı</div>`;
    return;
  }

  dd.innerHTML = results.map(p => `
    <a href="game.html?id=${p.id}" class="nav-search-item" onclick="document.getElementById('nav-search-dropdown').innerHTML=''">
      <div class="nav-search-item-img">
        ${p.image ? `<img src="${p.image}" alt="${p.title}" onerror="this.style.display='none'" />` : `<span style="font-size:1.2rem">${p.emoji||'🎮'}</span>`}
      </div>
      <div class="nav-search-item-info">
        <div class="nav-search-item-title">${p.title}</div>
        <div class="nav-search-item-meta">${p.category} · ${formatPrice(p.price)}</div>
      </div>
      <div>${stockBadgeHTML(p.stock)}</div>
    </a>
  `).join('') + `<a href="store.html?q=${encodeURIComponent(val)}" class="nav-search-all" onclick="document.getElementById('nav-search-dropdown').innerHTML=''">Tüm sonuçları gör →</a>`;
}

async function requireLogin() {
  const user = await DB.getCurrentUser();
  if (!user) {
    showToast('Bu sayfayı görmek için giriş yapmalısınız.', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 800);
    return null;
  }
  return user;
}

async function requireAdmin() {
  const user = await DB.getCurrentUser();
  if (!user || user.role !== 'admin') {
    showToast('Bu sayfaya erişim yetkiniz yok.', 'error');
    setTimeout(() => { window.location.href = 'index.html'; }, 800);
    return null;
  }
  return user;
}

// Oyun kartı HTML
async function gameCardHTMLAsync(product) {
  const user = await DB.getCurrentUser().catch(() => null);
  const wishlist = user ? await DB.getWishlist().catch(() => []) : [];
  return gameCardHTML(product, user, wishlist);
}

function gameCardHTML(product, user, wishlistIds) {
  wishlistIds = wishlistIds || [];

  // Fiyat + indirim hesabı
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.price / product.original_price) * 100) : 0;

  let priceHTML;
  if (product.price === 0) {
    priceHTML = '<span class="game-price free">Ücretsiz</span>';
  } else if (hasDiscount) {
    priceHTML = `
      <div class="price-block">
        <span class="price-original">₺${Number(product.original_price).toLocaleString('tr-TR')}</span>
        <span class="game-price">₺${Number(product.price).toLocaleString('tr-TR')}</span>
      </div>`;
  } else {
    priceHTML = `<span class="game-price">₺${Number(product.price).toLocaleString('tr-TR')}</span>`;
  }

  const discountBadge = hasDiscount ? `<span class="discount-badge">%${discountPct}</span>` : '';
  const badge = product.stock <= 0 ? '<span class="stock-badge out-of-stock">Tükendi</span>' : stockBadgeHTML(product.stock);

  let tags = product.tags || [];
  if (typeof tags === 'string') { try { tags = JSON.parse(tags); } catch { tags = []; } }
  const tagsHTML = tags.slice(0, 2).map(t => `<span class="tag">${t}</span>`).join('');

  const inWishlist = Array.isArray(wishlistIds) && wishlistIds.includes(product.id);
  const wishBtn = user
    ? `<button class="card-wishlist-btn ${inWishlist ? 'active' : ''}" onclick="event.stopPropagation();toggleWishlistCard('${product.id}',this)" title="${inWishlist ? 'Favorilerden çıkar' : 'Favorilere ekle'}">${inWishlist ? '❤️' : '🤍'}</button>`
    : '';

  let imgHTML;
  if (product.image) {
    imgHTML = `<div class="game-card-img-placeholder"><img src="${product.image}" alt="${product.title}"
        onerror="this.parentElement.innerHTML='<span style=&quot;font-size:2.5rem&quot;>${product.emoji || '🎮'}</span>'" /></div>`;
  } else {
    imgHTML = `<div class="game-card-img-placeholder"><span>${product.emoji || '🎮'}</span></div>`;
  }

  return `
    <div class="game-card" onclick="window.location.href='game.html?id=${product.id}'">
      ${imgHTML}
      ${wishBtn}
      ${discountBadge}
      <div class="game-card-body">
        <div class="game-card-title">${product.title}</div>
        <div class="game-tags">${tagsHTML}</div>
        <div class="game-card-meta">
          ${priceHTML}
          ${badge}
        </div>
      </div>
    </div>`;
}

async function toggleWishlistCard(productId, btn) {
  const user = await DB.getCurrentUser().catch(() => null);
  if (!user) {
    showToast('Favorilere eklemek için giriş yapmalısınız.', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 800);
    return;
  }
  const result = await DB.toggleWishlist(user.id, productId);
  if (result.added) {
    btn.textContent = '❤️';
    btn.classList.add('active');
    showToast('Favorilere eklendi!', 'success');
  } else {
    btn.textContent = '🤍';
    btn.classList.remove('active');
    showToast('Favorilerden çıkarıldı.', 'info');
  }
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function shortId(id) {
  return id ? id.slice(-6).toUpperCase() : '------';
}