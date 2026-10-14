// ===== GAMESTORE - DATA & STORAGE MANAGER =====

const DB = {
  KEYS: {
    USERS: 'gs_users',
    CURRENT_USER: 'gs_current_user',
    PRODUCTS: 'gs_products',
    CART: 'gs_cart',
    ORDERS: 'gs_orders',
    SUPPORT: 'gs_support',
  },

  get(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  },
  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },

  // ---------- USERS ----------
  getUsers() { return this.get(this.KEYS.USERS) || []; },
  saveUsers(users) { this.set(this.KEYS.USERS, users); },
  getUserByUsername(username) { return this.getUsers().find(u => u.username.toLowerCase() === username.toLowerCase()) || null; },
  getUserByEmail(email) { return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null; },
  getUserById(id) { return this.getUsers().find(u => u.id === id) || null; },

  registerUser({ username, email, password, avatar }) {
    const users = this.getUsers();
    if (this.getUserByUsername(username)) return { ok: false, msg: 'Bu kullanıcı adı zaten alınmış.' };
    if (this.getUserByEmail(email)) return { ok: false, msg: 'Bu e-posta adresi zaten kayıtlı.' };
    const user = {
      id: 'u_' + Date.now(),
      username, email, password,
      avatar: avatar || '🎮',
      role: 'user',
      createdAt: new Date().toISOString(),
      library: [],
      orders: [],
      wishlist: [],
    };
    users.push(user);
    this.saveUsers(users);
    return { ok: true, user };
  },

  loginUser(username, password) {
    const user = this.getUserByUsername(username);
    if (!user) return { ok: false, msg: 'Kullanıcı bulunamadı.' };
    if (user.password !== password) return { ok: false, msg: 'Hatalı şifre.' };
    this.set(this.KEYS.CURRENT_USER, user.id);
    return { ok: true, user };
  },

  logoutUser() { localStorage.removeItem(this.KEYS.CURRENT_USER); },

  getCurrentUser() {
    const id = this.get(this.KEYS.CURRENT_USER);
    if (!id) return null;
    return this.getUserById(id);
  },

  updateUser(updatedUser) {
    const users = this.getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
    this.saveUsers(users);
  },

  // ---------- WISHLIST ----------
  getWishlist(userId) {
    const user = this.getUserById(userId);
    return user ? (user.wishlist || []) : [];
  },

  isInWishlist(userId, productId) {
    return this.getWishlist(userId).includes(productId);
  },

  toggleWishlist(userId, productId) {
    const user = this.getUserById(userId);
    if (!user) return { ok: false, added: false };
    user.wishlist = user.wishlist || [];
    const idx = user.wishlist.indexOf(productId);
    if (idx === -1) {
      user.wishlist.push(productId);
      this.updateUser(user);
      return { ok: true, added: true };
    } else {
      user.wishlist.splice(idx, 1);
      this.updateUser(user);
      return { ok: true, added: false };
    }
  },

  // ---------- PRODUCTS ----------
  getProducts() { return this.get(this.KEYS.PRODUCTS) || []; },
  saveProducts(products) { this.set(this.KEYS.PRODUCTS, products); },
  getProductById(id) { return this.getProducts().find(p => p.id === id) || null; },

  addProduct(data) {
    const products = this.getProducts();
    const product = { id: 'p_' + Date.now(), ...data, createdAt: new Date().toISOString() };
    products.push(product);
    this.saveProducts(products);
    return product;
  },

  updateProduct(updated) {
    const products = this.getProducts().map(p => p.id === updated.id ? updated : p);
    this.saveProducts(products);
  },

  deleteProduct(id) {
    this.saveProducts(this.getProducts().filter(p => p.id !== id));
  },

  updateStock(productId, delta) {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === productId);
    if (idx === -1) return false;
    products[idx].stock = Math.max(0, products[idx].stock + delta);
    this.saveProducts(products);
    return true;
  },

  // ---------- CART ----------
  getCart() { return this.get(this.KEYS.CART) || []; },
  saveCart(cart) { this.set(this.KEYS.CART, cart); },

  addToCart(productId) {
    const product = this.getProductById(productId);
    if (!product) return { ok: false, msg: 'Ürün bulunamadı.' };
    if (product.stock <= 0) return { ok: false, msg: 'Ürün stokta yok.' };
    let cart = this.getCart();
    if (cart.find(c => c.productId === productId)) return { ok: false, msg: 'Bu oyun zaten sepetinizde.' };
    cart.push({ productId, addedAt: new Date().toISOString() });
    this.saveCart(cart);
    return { ok: true };
  },

  removeFromCart(productId) {
    this.saveCart(this.getCart().filter(c => c.productId !== productId));
  },

  clearCart() { this.saveCart([]); },

  getCartProducts() {
    return this.getCart().map(c => {
      const p = this.getProductById(c.productId);
      return p ? { ...c, product: p } : null;
    }).filter(Boolean);
  },

  // ---------- ORDERS ----------
  getOrders() { return this.get(this.KEYS.ORDERS) || []; },
  saveOrders(orders) { this.set(this.KEYS.ORDERS, orders); },

  createOrder(userId, items) {
    for (const item of items) {
      const p = this.getProductById(item.productId);
      if (!p || p.stock <= 0) return { ok: false, msg: `"${item.title}" stokta kalmadı.` };
    }
    for (const item of items) { this.updateStock(item.productId, -1); }
    const total = items.reduce((s, i) => s + i.price, 0);
    const order = { id: 'ord_' + Date.now(), userId, items, total, createdAt: new Date().toISOString() };
    const orders = this.getOrders();
    orders.push(order);
    this.saveOrders(orders);
    const user = this.getUserById(userId);
    if (user) {
      user.orders = user.orders || [];
      user.orders.push(order.id);
      user.library = user.library || [];
      items.forEach(i => { if (!user.library.includes(i.productId)) user.library.push(i.productId); });
      this.updateUser(user);
    }
    this.clearCart();
    return { ok: true, order };
  },

  getUserOrders(userId) { return this.getOrders().filter(o => o.userId === userId); },

  // ---------- SUPPORT ----------
  getSupportTickets() { return this.get(this.KEYS.SUPPORT) || []; },
  saveSupportTickets(t) { this.set(this.KEYS.SUPPORT, t); },

  createSupportTicket({ userId, username, email, subject, category, message }) {
    const tickets = this.getSupportTickets();
    const ticket = {
      id: 'tck_' + Date.now(),
      userId: userId || null,
      username: username || 'Anonim',
      email, subject, category, message,
      status: 'open',
      createdAt: new Date().toISOString(),
      reply: null,
    };
    tickets.push(ticket);
    this.saveSupportTickets(tickets);
    return { ok: true, ticket };
  },

  replyTicket(ticketId, reply) {
    const tickets = this.getSupportTickets().map(t =>
      t.id === ticketId ? { ...t, reply, status: 'closed' } : t
    );
    this.saveSupportTickets(tickets);
  },

  // ---------- SEED ----------
  seed() {
    const SEED_VERSION = 'v8';
    if (this.get('gs_seed_version') === SEED_VERSION && this.getProducts().length > 0) return;
    // Sürüm farklıysa veya ürünler boşsa yeniden yükle (kullanıcılar ve siparişler korunur)
    this.saveProducts([]);
    this.set('gs_seed_version', SEED_VERSION);

    const games = [
      {
        id: 'p_seed_1',
        title: 'Cyberpunk 2077',
        description: 'Geleceğin distopik şehri Night City\'de geçen açık dünya aksiyon RPG oyunu. V karakterini oynayarak şehrin karanlık sırlarını keşfet.',
        price: 499,
        category: 'RPG',
        tags: ['Açık Dünya', 'Aksiyon', 'Sci-Fi'],
        stock: 15,
        emoji: '🤖',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg',
        developer: 'CD Projekt Red',
        releaseYear: 2020,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_2',
        title: 'Elden Ring',
        description: 'FromSoftware ve George R.R. Martin iş birliğiyle oluşturulan devasa açık dünya aksiyon RPG. Ara Topraklar\'ı keşfet ve Elden Ring\'i restore et.',
        price: 649,
        category: 'RPG',
        tags: ['Souls-like', 'Aksiyon', 'Zor'],
        stock: 8,
        emoji: '⚔️',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg',
        developer: 'FromSoftware',
        releaseYear: 2022,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_3',
        title: 'Counter-Strike 2',
        description: 'Dünyanın en popüler taktik nişancı oyununun yeni nesil versiyonu. Rekabetçi maçlar ve takım çalışması ön planda.',
        price: 0,
        category: 'FPS',
        tags: ['Çok Oyunculu', 'Rekabetçi', 'Taktik'],
        stock: 999,
        emoji: '🎯',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg',
        developer: 'Valve',
        releaseYear: 2023,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_4',
        title: 'Red Dead Redemption 2',
        description: 'Amerika\'nın vahşi batısında geçen epik bir macera. Arthur Morgan olarak hayatta kalmak için mücadele et.',
        price: 399,
        category: 'Aksiyon',
        tags: ['Açık Dünya', 'Vahşi Batı', 'Hikaye'],
        stock: 3,
        emoji: '🤠',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg',
        developer: 'Rockstar Games',
        releaseYear: 2019,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_5',
        title: "Baldur's Gate 3",
        description: 'D&D evreninde geçen, seçimlerin gerçekten önem taşıdığı devasa turn-based RPG. Arkadaşlarınla ya da yalnız oyna.',
        price: 799,
        category: 'RPG',
        tags: ['Turn-Based', 'Co-op', 'Fantezi'],
        stock: 0,
        emoji: '🧙',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg',
        developer: 'Larian Studios',
        releaseYear: 2023,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_6',
        title: 'EA Sports FC 24',
        description: 'Dünyanın en çok oynanan futbol simülasyonu. Gerçekçi oynanış, Ultimate Team modu ve çevrimiçi turnuvalar.',
        price: 549,
        category: 'Spor',
        tags: ['Futbol', 'Çok Oyunculu', 'Spor'],
        stock: 22,
        emoji: '⚽',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/header.jpg',
        developer: 'EA Sports',
        releaseYear: 2023,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_7',
        title: 'Minecraft',
        description: 'Sonsuz olasılıkların sandbox oyunu. İnşa et, keşfet, hayatta kal. Yaratıcılığının sınırı yok.',
        price: 229,
        category: 'Sandbox',
        tags: ['Sandbox', 'Hayatta Kalma', 'İnşa'],
        stock: 50,
        emoji: '⛏️',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1672970/header.jpg',
        developer: 'Mojang',
        releaseYear: 2011,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_8',
        title: 'The Witcher 3',
        description: 'Geralt of Rivia olarak tehlikeli canavarlara karşı savaş. Ödüllü hikayesi ve zengin dünyasıyla efsanevi bir RPG.',
        price: 149,
        category: 'RPG',
        tags: ['Açık Dünya', 'Fantezi', 'Hikaye'],
        stock: 4,
        emoji: '🐺',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg',
        developer: 'CD Projekt Red',
        releaseYear: 2015,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_9',
        title: 'Grand Theft Auto V',
        description: 'Los Santos\'ta suç ve macera dolu açık dünya deneyimi. Çevrimiçi modda yüzlerce oyuncuyla oyna.',
        price: 199,
        category: 'Aksiyon',
        tags: ['Açık Dünya', 'Suç', 'Çok Oyunculu'],
        stock: 12,
        emoji: '🏙️',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg',
        developer: 'Rockstar Games',
        releaseYear: 2013,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_10',
        title: 'Hogwarts Legacy',
        description: 'Harry Potter evreninde geçen, 1800\'lü yıllarda Hogwarts\'ta kendi hikayeni yaz. Büyüler öğren, gizemleri çöz.',
        price: 599,
        category: 'RPG',
        tags: ['Açık Dünya', 'Büyü', 'Fantezi'],
        stock: 7,
        emoji: '🧹',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/990080/header.jpg',
        developer: 'Avalanche Software',
        releaseYear: 2023,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_11',
        title: 'Valorant',
        description: 'Taktik nişancı oyununda ajan yeteneklerini kullan. Rekabetçi maçlar ve güçlü takım sinerjisi.',
        price: 0,
        category: 'FPS',
        tags: ['Çok Oyunculu', 'Rekabetçi', 'Ajan'],
        stock: 999,
        emoji: '🔫',
        image: 'oyunlar/valorant.jpg',
        developer: 'Riot Games',
        releaseYear: 2020,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_12',
        title: 'Stardew Valley',
        description: 'Şehir hayatını bırak, büyükbabanın çiftliğini restore et. Sakin ama derin bir çiftlik simülasyonu.',
        price: 119,
        category: 'Simülasyon',
        tags: ['Rahatlatıcı', 'Çiftlik', 'Strateji'],
        stock: 30,
        emoji: '🌾',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg',
        developer: 'ConcernedApe',
        releaseYear: 2016,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_13',
        title: 'God of War',
        description: 'Kratos ve oğlu Atreus\'un Kuzey mitolojisi dünyasında geçen destansı yolculuğu. Tanrılara karşı baba-oğul hikayesi.',
        price: 449,
        category: 'Aksiyon',
        tags: ['Aksiyon', 'Hikaye', 'Mitoloji'],
        stock: 9,
        emoji: '⚡',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/header.jpg',
        developer: 'Santa Monica Studio',
        releaseYear: 2022,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_14',
        title: 'Hades',
        description: 'Yeraltı dünyasından kaçmaya çalışan Zagreus olarak savaş. Her ölümde güçlenen, bağımlılık yapan roguelike oyun.',
        price: 179,
        category: 'Roguelike',
        tags: ['Roguelike', 'Aksiyon', 'Mitoloji'],
        stock: 25,
        emoji: '🔥',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg',
        developer: 'Supergiant Games',
        releaseYear: 2020,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_15',
        title: 'Dark Souls III',
        description: 'Ateşin söndüğü bir dünyada hayatta kal. FromSoftware\'in zorlu ve ödüllendirici aksiyon RPG serisi devam ediyor.',
        price: 249,
        category: 'RPG',
        tags: ['Souls-like', 'Zor', 'Fantezi'],
        stock: 6,
        emoji: '💀',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/374320/header.jpg',
        developer: 'FromSoftware',
        releaseYear: 2016,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_16',
        title: 'Apex Legends',
        description: 'Takım tabanlı battle royale. Farklı yeteneklere sahip efsanelerle rekabet et ve şampiyonluğa ulaş.',
        price: 0,
        category: 'Battle Royale',
        tags: ['Battle Royale', 'Çok Oyunculu', 'Ücretsiz'],
        stock: 999,
        emoji: '🎖️',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg',
        developer: 'Respawn Entertainment',
        releaseYear: 2020,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_17',
        title: 'Death Stranding',
        description: 'Hideo Kojima\'nın yeni nesil açık dünya oyunu. Bölünmüş bir Amerika\'yı yeniden birleştirmek için yola çık.',
        price: 299,
        category: 'Aksiyon',
        tags: ['Aksiyon', 'Hikaye', 'Açık Dünya'],
        stock: 11,
        emoji: '🌧️',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1190460/header.jpg',
        developer: 'Kojima Productions',
        releaseYear: 2021,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_18',
        title: 'DOTA 2',
        description: 'Dünyanın en rekabetçi MOBA oyunu. 100\'den fazla kahraman, sonsuz strateji ve milyonlarca oyuncu.',
        price: 0,
        category: 'MOBA',
        tags: ['MOBA', 'Strateji', 'Çok Oyunculu'],
        stock: 999,
        emoji: '🗡️',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg',
        developer: 'Valve',
        releaseYear: 2013,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_19',
        title: 'Fortnite',
        description: 'Dünyaca ünlü battle royale oyunu. Yüz oyuncu ile mücadele et, inşa et, hayatta kal.',
        price: 0,
        category: 'Battle Royale',
        tags: ['Battle Royale', 'Ücretsiz', 'Çok Oyunculu'],
        stock: 999,
        emoji: '🏗️',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1284190/header.jpg',
        developer: 'Epic Games',
        releaseYear: 2017,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_20',
        title: 'Sekiro: Shadows Die Twice',
        description: 'Feudal Japonya\'da geçen yüksek zorluklu aksiyon oyunu. Bir shinobi olarak intikamını al.',
        price: 349,
        category: 'Aksiyon',
        tags: ['Souls-like', 'Japon', 'Zor'],
        stock: 5,
        emoji: '🥷',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/814380/header.jpg',
        developer: 'FromSoftware',
        releaseYear: 2019,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_21',
        title: 'The Last of Us Part I',
        description: 'Mantar salgınının yıktığı dünyada Joel ve Ellie\'nin hayatta kalma mücadelesi. Duygu dolu hikaye ve etkileyici grafik.',
        price: 599,
        category: 'Aksiyon',
        tags: ['Hikaye', 'Hayatta Kalma', 'Dramatik'],
        stock: 10,
        emoji: '🍄',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1888930/header.jpg',
        developer: 'Naughty Dog',
        releaseYear: 2023,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_22',
        title: 'Spider-Man: Miles Morales',
        description: 'New York\'u kurtarmak için örümcek adamın yeni maskesi. Miles Morales olarak şehrin kahramanı ol.',
        price: 449,
        category: 'Aksiyon',
        tags: ['Süper Kahraman', 'Aksiyon', 'Açık Dünya'],
        stock: 14,
        emoji: '🕷️',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1817190/header.jpg',
        developer: 'Insomniac Games',
        releaseYear: 2022,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_23',
        title: 'Hollow Knight',
        description: 'Karanlık yeraltı krallığında geçen derinlikli metroidvania oyunu. Zorlu platformer mekanikleri ve büyüleyici atmosfer.',
        price: 89,
        category: 'Platformer',
        tags: ['Metroidvania', 'Indie', 'Zor'],
        stock: 40,
        emoji: '🦋',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg',
        developer: 'Team Cherry',
        releaseYear: 2017,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_24',
        title: 'Resident Evil 4 Remake',
        description: 'Efsanevi survival horror oyununun modern yeniden yapımı. Leon Kennedy olarak köy kabusuyla yüzleş.',
        price: 499,
        category: 'Horror',
        tags: ['Korku', 'Aksiyon', 'Survival'],
        stock: 13,
        emoji: '🧟',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2050650/header.jpg',
        developer: 'Capcom',
        releaseYear: 2023,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_25',
        title: 'Celeste',
        description: 'Dağa tırmanmaya çalışan Madeline\'in hem içsel hem fiziksel zorluklarla mücadelesi. Zorlu ama adil platformer.',
        price: 79,
        category: 'Platformer',
        tags: ['Indie', 'Zorlu', 'Platform'],
        stock: 35,
        emoji: '🏔️',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/504230/header.jpg',
        developer: 'Maddy Makes Games',
        releaseYear: 2018,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_26',
        title: 'Divinity: Original Sin 2',
        description: 'Derin hikayeli izometrik RPG. Her kararın önem taşıdığı co-op destekli fantezi macerası.',
        price: 219,
        category: 'RPG',
        tags: ['Turn-Based', 'Co-op', 'Fantezi'],
        stock: 18,
        emoji: '🧝',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/435150/header.jpg',
        developer: 'Larian Studios',
        releaseYear: 2017,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_27',
        title: 'Disco Elysium',
        description: 'Diyalog ağırlıklı dedektif RPG. Kimliğini kaybetmiş bir dedektif olarak cinayet soruşturmasına katıl.',
        price: 179,
        category: 'RPG',
        tags: ['Dedektif', 'Hikaye', 'Indie'],
        stock: 20,
        emoji: '🕵️',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/632470/header.jpg',
        developer: 'ZA/UM',
        releaseYear: 2019,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_28',
        title: 'Monster Hunter: World',
        description: 'Dev canavarları avla, malzemelerini topla ve daha güçlü silahlar üret. Kooperatif avlanmanın zevki.',
        price: 249,
        category: 'RPG',
        tags: ['Co-op', 'Aksiyon', 'Canavar Avı'],
        stock: 16,
        emoji: '🐉',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/582010/header.jpg',
        developer: 'Capcom',
        releaseYear: 2018,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_29',
        title: 'Terraria',
        description: '2D sandbox dünyasında kazı, inşa et ve savaş. Sonsuz keşif ve yaratıcılık sana sunuluyor.',
        price: 79,
        category: 'Sandbox',
        tags: ['Sandbox', 'Hayatta Kalma', 'Aksiyon'],
        stock: 60,
        emoji: '⛏️',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/105600/header.jpg',
        developer: 'Re-Logic',
        releaseYear: 2011,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_30',
        title: 'Portal 2',
        description: 'Portal silahıyla bulmaca çöz, düşün ve kazan. Co-op moduyla arkadaşınla birlikte oyna.',
        price: 69,
        category: 'Bulmaca',
        tags: ['Bulmaca', 'Co-op', 'Bilim Kurgu'],
        stock: 45,
        emoji: '🌀',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg',
        developer: 'Valve',
        releaseYear: 2011,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_31',
        title: 'League of Legends',
        description: 'Dünyanın en popüler MOBA oyunu. 150+ şampiyon, takım stratejisi ve rekabetçi turnuvalar.',
        price: 0,
        category: 'MOBA',
        tags: ['MOBA', 'Ücretsiz', 'Rekabetçi'],
        stock: 999,
        emoji: '⚔️',
        image: 'oyunlar/lol.jpg',
        developer: 'Riot Games',
        releaseYear: 2009,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_32',
        title: 'Destiny 2',
        description: 'Uzayda geçen FPS looter-shooter. Exotic silahlar topla, raidlere katıl ve güçlü guardian ol.',
        price: 0,
        category: 'FPS',
        tags: ['Looter-Shooter', 'Co-op', 'Sci-Fi'],
        stock: 999,
        emoji: '🚀',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1085660/header.jpg',
        developer: 'Bungie',
        releaseYear: 2019,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_33',
        title: 'FIFA 23',
        description: 'Son FIFA markalı futbol oyunu. Ultimate Team, kariyerler ve canlı servis modlarıyla dolu.',
        price: 349,
        category: 'Spor',
        tags: ['Futbol', 'Spor', 'Çok Oyunculu'],
        stock: 17,
        emoji: '⚽',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1811260/header.jpg',
        developer: 'EA Sports',
        releaseYear: 2022,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_34',
        title: 'Ori and the Will of the Wisps',
        description: 'Görsel olarak büyüleyici, duygusal platformer. Ori ile karanlık ormanda dost ara.',
        price: 149,
        category: 'Platformer',
        tags: ['Indie', 'Platform', 'Duygusal'],
        stock: 28,
        emoji: '✨',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1057090/header.jpg',
        developer: 'Moon Studios',
        releaseYear: 2020,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_35',
        title: 'Subnautica',
        description: 'Uzak bir gezegenin okyanuslarında hayatta kal. Derin sualtı dünyasını keşfet ve sırları çöz.',
        price: 149,
        category: 'Hayatta Kalma',
        tags: ['Hayatta Kalma', 'Keşif', 'Sci-Fi'],
        stock: 22,
        emoji: '🐠',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/264710/header.jpg',
        developer: 'Unknown Worlds',
        releaseYear: 2018,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_36',
        title: 'NBA 2K24',
        description: 'En gerçekçi basketbol simülasyonu. MyCareer, MyTeam ve online maçlarla dolu basketbol deneyimi.',
        price: 399,
        category: 'Spor',
        tags: ['Basketbol', 'Spor', 'Simülasyon'],
        stock: 19,
        emoji: '🏀',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2338770/header.jpg',
        developer: '2K Games',
        releaseYear: 2023,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_37',
        title: 'Cuphead',
        description: '1930\'lar karikatür tarzında el çizimi zorlu boss rush oyunu. Her sahnesi sanat eseri.',
        price: 129,
        category: 'Aksiyon',
        tags: ['Zor', 'Indie', 'Sanatsal'],
        stock: 33,
        emoji: '🎪',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/523090/header.jpg',
        developer: 'Studio MDHR',
        releaseYear: 2017,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_38',
        title: 'No Man\'s Sky',
        description: 'Sonsuz prosedürel evren keşfi. Gezegenler arası seyahat et, baz kur, arkadaşlarınla oyna.',
        price: 249,
        category: 'Sandbox',
        tags: ['Uzay', 'Keşif', 'Co-op'],
        stock: 15,
        emoji: '🌌',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/275850/header.jpg',
        developer: 'Hello Games',
        releaseYear: 2016,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_39',
        title: 'Among Us',
        description: 'Uzay gemisinde saklanan impostoru bul! Sosyal dedüksiyon oyunu. Arkadaşlarınla oyna.',
        price: 0,
        category: 'Sosyal',
        tags: ['Sosyal', 'Çok Oyunculu', 'Eğlence'],
        stock: 999,
        emoji: '👨‍🚀',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/945360/header.jpg',
        developer: 'Innersloth',
        releaseYear: 2018,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'p_seed_40',
        title: 'It Takes Two',
        description: 'Boşanmak üzere olan çiftin minyatür dünyasında verdiği mücadele. Co-op odaklı yaratıcı platform oyunu.',
        price: 229,
        category: 'Platformer',
        tags: ['Co-op', 'Hikaye', 'Platform'],
        stock: 24,
        emoji: '💑',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1426210/header.jpg',
        developer: 'Hazelight Studios',
        releaseYear: 2021,
        createdAt: new Date().toISOString(),
      },
    ];

    this.saveProducts(games);

    const users = this.getUsers();
    if (!users.find(u => u.username === 'admin')) {
      users.push({
        id: 'u_admin',
        username: 'admin',
        email: 'admin@gamestore.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
        library: [],
        orders: [],
        wishlist: [],
      });
      this.saveUsers(users);
    }
  }
};

DB.seed();