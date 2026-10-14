// ===== GAMESTORE - PHP/MySQL API Katmanı =====
// Bu dosya js/data.js'deki localStorage tabanlı DB nesnesini
// PHP API çağrılarıyla override eder.

const API = {
  base: '/site/api',
  async get(endpoint, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${this.base}/${endpoint}${qs ? '?' + qs : ''}`);
    return res.json();
  },
  async post(endpoint, params = {}, body = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${this.base}/${endpoint}?${qs}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  },
};

// ===== Override DB nesnesi =====
// data.js'deki DB nesnesinin metodlarını PHP API ile override et.
// const DB tekrar tanımlanamaz, Object.assign ile metodları üzerine yazıyoruz.

DB._currentUser = undefined;
DB._products    = null;

Object.assign(DB, {
  // ---------- AUTH ----------
  async loginUser(username, password) {
    return API.post('auth.php', { action: 'login' }, { username, password });
  },
  async registerUser({ username, email, password, avatar }) {
    return API.post('auth.php', { action: 'register' }, { username, email, password, avatar });
  },
  async logoutUser() {
    await API.post('auth.php', { action: 'logout' });
    DB._currentUser = null;
  },
  async getCurrentUser() {
    if (DB._currentUser !== undefined) return DB._currentUser;
    const r = await API.get('auth.php', { action: 'me' });
    DB._currentUser = r.ok ? r.user : null;
    return DB._currentUser;
  },
  async updateUser(data) {
    return API.post('auth.php', { action: 'update' }, data);
  },
  _currentUser: undefined,

  // ---------- PRODUCTS ----------
  async getProducts() {
    if (DB._products) return DB._products;
    const r = await API.get('products.php', { action: 'list' });
    DB._products = r.ok ? r.products : [];
    return DB._products;
  },
  async getProductById(id) {
    const r = await API.get('products.php', { action: 'get', id });
    return r.ok ? r.product : null;
  },
  async addProduct(data) {
    DB._products = null;
    return API.post('products.php', { action: 'add' }, data);
  },
  async updateProduct(data) {
    DB._products = null;
    return API.post('products.php', { action: 'update' }, data);
  },
  async deleteProduct(id) {
    DB._products = null;
    return API.post('products.php', { action: 'delete' }, { id });
  },
  _products: null,

  // ---------- CART ----------
  async getCart() {
    const r = await API.get('cart.php', { action: 'get' });
    return r.ok ? r.cart : [];
  },
  async addToCart(productId) {
    return API.post('cart.php', { action: 'add' }, { productId });
  },
  async removeFromCart(productId) {
    return API.post('cart.php', { action: 'remove' }, { productId });
  },
  async clearCart() {
    return API.post('cart.php', { action: 'clear' });
  },
  async getCartProducts() {
    const items = await DB.getCart();
    return items.map(i => ({ productId: i.product_id, product: i, addedAt: i.added_at }));
  },

  // ---------- ORDERS ----------
  async createOrder() {
    return API.post('orders.php', { action: 'create' });
  },
  async getUserOrders() {
    const r = await API.get('orders.php', { action: 'list' });
    return r.ok ? r.orders : [];
  },
  async getAllOrders() {
    const r = await API.get('orders.php', { action: 'all' });
    return r.ok ? r.orders : [];
  },

  // ---------- WISHLIST ----------
  async getWishlist() {
    const r = await API.get('wishlist.php', { action: 'get' });
    return r.ok ? r.wishlist : [];
  },
  async isInWishlist(userId, productId) {
    const list = await DB.getWishlist();
    return list.includes(productId);
  },
  async toggleWishlist(userId, productId) {
    return API.post('wishlist.php', { action: 'toggle' }, { productId });
  },

  // ---------- SUPPORT ----------
  async createSupportTicket(data) {
    return API.post('support.php', { action: 'create' }, data);
  },
  async getSupportTickets() {
    const r = await API.get('support.php', { action: 'list' });
    return r.ok ? r.tickets : [];
  },
  async replyTicket(ticketId, reply) {
    return API.post('support.php', { action: 'reply' }, { ticketId, reply });
  },
});

// Geriye dönük uyumluluk: eski senkron çağrılar için
// formatPrice ve diğer yardımcı fonksiyonlar utils.js'de kalır.
console.log('[GameStore] PHP/MySQL API modu aktif — http://localhost/site/');