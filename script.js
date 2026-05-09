const books = [
  { id: 1, title: "55 Poems", author: "Jose Garcia Villa", price: 450, cat: "Classic", img: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1300093963i/10787442.jpg" },
  { id: 2, title: "Maaari", author: "Allan Popa", price: 395, cat: "Filipino", img: "https://down-ph.img.susercontent.com/file/300df9680254c0407643c7b30291937f" },
  { id: 3, title: "Dark Hours", author: "Conchitina Cruz", price: 350, cat: "Modern", img: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1313037268i/1621262.jpg" },
  { id: 4, title: "Antiemetic for Homesickness", author: "Romalyn Ante", price: 650, cat: "Filipino", img: "https://m.media-amazon.com/images/I/813er3Ta5hL._AC_UF894,1000_QL80_.jpg" },
  { id: 5, title: "Jolography Retconned", author: "Paolo Manalo", price: 495, cat: "Filipino", img: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1583240312i/52045694.jpg" },
  { id: 6, title: "Mga Tala at Tula", author: "Ron Canimo", price: 450, cat: "Filipino", img: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1754166843i/56573826.jpg" },
  { id: 7, title: "Sa Buwan Kita Natagpuan", author: "Ron Canimo", price: 550, cat: "Love", img: "https://down-ph.img.susercontent.com/file/sg-11134202-7rfgj-m41ozflhjyjm76" },
  { id: 8, title: "Ikaw sa Bawat Araw", author: "Ron Canimo", price: 550, cat: "Love", img: "https://down-ph.img.susercontent.com/file/ph-11134207-81ztp-mhnknk4pt3ib2f" },
  { id: 9, title: "I Hope We Meet Again", author: "Ron Canimo", price: 550, cat: "Love", img: "https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/d385a911cc724fcc8f822d32598fd543~tplv-aphluv4xwc-resize-webp:800:800.webp" },
  { id: 10, title: "The Tracks of Babylon", author: "Edith Tiempo", price: 550, cat: "Classic", img: "https://pictures.abebooks.com/isbn/9789718967706-uk.jpg" }
];

let cart = [];
let currentUser = null;
let orders = [];

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

function openAuth() {
  document.getElementById('authModal').classList.add('show');
  switchAuthTab('login');
}

function closeAuth() {
  document.getElementById('authModal').classList.remove('show');
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  
  if (tab === 'login') {
    document.getElementById('loginForm').classList.add('active');
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
  } else if (tab === 'signup') {
    document.getElementById('signupForm').classList.add('active');
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
  } else if (tab === 'forgot') {
    document.getElementById('forgotForm').classList.add('active');
  } else if (tab === 'reset') {
    document.getElementById('resetForm').classList.add('active');
  }
}

function showForgotPassword() {
  document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
  document.getElementById('forgotForm').classList.add('active');
}

// Demo user database (in real app, this would be server-side)
let users = JSON.parse(localStorage.getItem('poemShelfUsers')) || [];

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPass').value;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    currentUser = { name: user.name, email: user.email };
    localStorage.setItem('poemShelfCurrentUser', JSON.stringify(currentUser));
    updateUI();
    closeAuth();
    showToast('✓', 'Welcome back, ' + user.name + '!');
    loadOrders();
  } else {
    showToast('✗', 'Invalid email or password');
  }
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPass').value;
  const confirm = document.getElementById('signupConfirm').value;
  
  if (password !== confirm) {
    showToast('✗', 'Passwords do not match!');
    return;
  }
  
  if (password.length < 6) {
    showToast('✗', 'Password must be at least 6 characters');
    return;
  }
  
  if (users.find(u => u.email === email)) {
    showToast('✗', 'Email already registered');
    return;
  }
  
  users.push({ name, email, password });
  localStorage.setItem('poemShelfUsers', JSON.stringify(users));
  
  showToast('✓', 'Account created! Please sign in.');
  switchAuthTab('login');
  document.getElementById('signupForm').reset();
}

function handleForgot(e) {
  e.preventDefault();
  const email = document.getElementById('forgotEmail').value;
  const user = users.find(u => u.email === email);
  
  if (user) {
    showToast('✓', 'Reset link sent to ' + email);
    switchAuthTab('login');
  } else {
    showToast('✗', 'No account found with this email');
  }
}

function handleReset(e) {
  e.preventDefault();
  const token = document.getElementById('resetToken').value;
  const password = document.getElementById('resetPass').value;
  const confirm = document.getElementById('resetConfirm').value;
  
  if (password !== confirm) {
    showToast('✗', 'Passwords do not match!');
    return;
  }
  
  showToast('✓', 'Password reset successful!');
  switchAuthTab('login');
}

function signOut() {
  currentUser = null;
  localStorage.removeItem('poemShelfCurrentUser');
  updateUI();
  showToast('✓', 'Signed out successfully');
  show('home');
}

function updateUI() {
  const authBtn = document.getElementById('authBtn');
  const userMenu = document.getElementById('userMenu');
  const navOrders = document.getElementById('nav-orders');
  const userAvatar = document.getElementById('userAvatar');
  const dropdownName = document.getElementById('dropdownName');
  
  if (currentUser) {
    authBtn.style.display = 'none';
    userMenu.style.display = 'block';
    navOrders.style.display = 'inline';
    userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    dropdownName.textContent = currentUser.name;
  } else {
    authBtn.style.display = 'block';
    userMenu.style.display = 'none';
    navOrders.style.display = 'none';
  }
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  const userMenu = document.getElementById('userMenu');
  if (userMenu && !userMenu.contains(e.target)) {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('show');
  }
});

// ============================================
// TOAST NOTIFICATION
// ============================================

function showToast(icon, message) {
  const toast = document.getElementById('toast');
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent = message;
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ============================================
// BOOK & CART FUNCTIONS
// ============================================

const card = b => `<div class="card"><img src="${b.img}"><div class="card-content"><span class="tag">${b.cat}</span><h3>${b.title}</h3><p>${b.author}</p><div class="prices">₱${b.price}</div><button class="add-btn" onclick="add(${b.id})">Add to Cart</button></div></div>`;

const render = () => {
  document.getElementById('feat').innerHTML = books.slice(0, 4).map(card).join('');
  document.getElementById('all').innerHTML = books.map(card).join('');
};

const doSearch = q => {
  const d = document.getElementById('drop');
  if (!q) { d.classList.remove('show'); return; }
  const f = books.filter(b => b.title.toLowerCase().includes(q.toLowerCase()) || b.author.toLowerCase().includes(q.toLowerCase()));
  d.innerHTML = f.map(b => `<div class="dropdown-item" onclick="selectBook(${b.id})"><img src="${b.img}"><div class="info"><b>${b.title}</b><br><small>${b.author}</small></div><div class="price">₱${b.price}</div></div>`).join('');
  d.classList.toggle('show', f.length > 0);
};

const selectBook = id => {
  document.getElementById('search').value = books.find(b => b.id === id).title;
  document.getElementById('drop').classList.remove('show');
  show('products');
  setTimeout(() => {
    const c = document.querySelectorAll('.card')[books.findIndex(b => b.id === id)];
    if (c) c.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
};

const add = id => {
  const b = books.find(x => x.id === id), ex = cart.find(x => x.id === id);
  ex ? ex.q++ : cart.push({ ...b, q: 1 });
  update();
  showToast('✓', 'Added to cart!');
};

const remove = id => {
  cart = cart.filter(x => x.id !== id);
  update();
};

const update = () => {
  document.getElementById('count').innerText = cart.reduce((a, b) => a + b.q, 0);
  const t = cart.reduce((a, b) => a + b.price * b.q, 0);
  document.getElementById('total').innerText = t;
  document.getElementById('items').innerHTML = cart.length ? cart.map(c => `<div class="cart-item"><img src="${c.img}"><div style="flex:1"><b>${c.title}</b><p style="font-size:12px;color:#8b6914">${c.author}</p><p>₱${c.price} x ${c.q}</p></div><button style="background:#c44;color:#fff;border:none;padding:5px 10px;cursor:pointer;border-radius:5px" onclick="remove(${c.id})">×</button></div>`).join('') : '<p style="text-align:center;color:#666;padding:40px">Empty</p>';
};

const toggleCart = () => {
  document.getElementById('cart').classList.toggle('open');
  document.querySelector('.overlay').classList.toggle('show');
};

const show = p => {
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.getElementById(p).classList.add('active');
  window.scrollTo(0, 0);
  
  if (p === 'orders') {
    loadOrders();
  }
};

const openCheckout = () => {
  if (!cart.length) return;
  if (!currentUser) {
    showToast('✗', 'Please sign in to checkout');
    openAuth();
    return;
  }
  const t = cart.reduce((a, b) => a + b.price * b.q, 0);
  document.getElementById('sum').innerHTML = cart.map(c => `<p>${c.title} x${c.q} = ₱${c.price * c.q}</p>`).join('') + `<p><b>Total: ₱${t}</b></p>`;
  document.getElementById('ref').innerText = Math.random().toString(36).substr(2, 9).toUpperCase();
  document.getElementById('checkout').classList.add('show');
  toggleCart();
};

const submitOrder = e => {
  e.preventDefault();
  
  if (!currentUser) {
    showToast('✗', 'Please sign in to place an order');
    return;
  }
  
  const orderNumber = 'PS-' + Date.now().toString().slice(-8);
  const order = {
    id: Date.now(),
    orderNumber: orderNumber,
    userEmail: currentUser.email,
    items: [...cart],
    total: cart.reduce((a, b) => a + b.price * b.q, 0),
    status: 'pending',
    date: new Date().toLocaleDateString(),
    customer: {
      name: document.getElementById('fname').value + ' ' + document.getElementById('lname').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      postal: document.getElementById('postal').value
    },
    payment: document.getElementById('pay').value
  };
  
  orders.push(order);
  localStorage.setItem('poemShelfOrders', JSON.stringify(orders));
  
  showToast('✓', 'Order placed! #' + orderNumber);
  cart = [];
  update();
  document.getElementById('checkout').classList.remove('show');
  show('home');
};

const toggleQR = () => {
  const m = document.getElementById('pay').value, qr = document.getElementById('qr');
  qr.classList.toggle('show', m === 'GCash');
  if (m === 'GCash') {
    const c = document.getElementById('qrCanvas'), ctx = c.getContext('2d'), s = 12;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 180, 180);
    ctx.fillStyle = '#2c1810';
    for (let i = 0; i < 15; i++) for (let j = 0; j < 15; j++) if (Math.random() > 0.5) ctx.fillRect(i * s, j * s, s, s);
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(0, 0, 3 * s, 3 * s);
    ctx.fillRect(12 * s, 0, 3 * s, 3 * s);
    ctx.fillRect(0, 12 * s, 3 * s, 3 * s);
  }
};

// ============================================
// ORDERS & CANCEL FEATURE
// ============================================

function loadOrders() {
  if (!currentUser) {
    document.getElementById('ordersList').innerHTML = `
      <div class="no-orders">
        <div class="no-orders-icon">🔒</div>
        <p>Please sign in to view your orders</p>
      </div>
    `;
    return;
  }
  
  const allOrders = JSON.parse(localStorage.getItem('poemShelfOrders')) || [];
  const userOrders = allOrders.filter(o => o.userEmail === currentUser.email);
  
  if (userOrders.length === 0) {
    document.getElementById('ordersList').innerHTML = `
      <div class="no-orders">
        <div class="no-orders-icon">📦</div>
        <p>No orders yet. Start shopping!</p>
      </div>
    `;
    return;
  }
  
  document.getElementById('ordersList').innerHTML = userOrders.map(order => `
    <div class="order-card">
      <div class="order-header">
        <span class="order-num">${order.orderNumber}</span>
        <span class="order-status status-${order.status}">${order.status}</span>
      </div>
      <div class="order-items">
        ${order.items.map(item => `<p>📖 ${item.title} × ${item.q} — ₱${item.price * item.q}</p>`).join('')}
      </div>
      <div class="order-footer">
        <span>Total: ₱${order.total}</span>
        ${order.status === 'pending' ? `<button class="cancel-btn" onclick="cancelOrder(${order.id})">Cancel Order</button>` : ''}
      </div>
      <p style="color:#8b6914;font-size:13px;margin-top:10px">📅 ${order.date} | 💳 ${order.payment}</p>
    </div>
  `).join('');
}

function cancelOrder(orderId) {
  if (!confirm('Are you sure you want to cancel this order?')) return;
  
  let allOrders = JSON.parse(localStorage.getItem('poemShelfOrders')) || [];
  const orderIndex = allOrders.findIndex(o => o.id === orderId);
  
  if (orderIndex > -1 && allOrders[orderIndex].status === 'pending') {
    allOrders[orderIndex].status = 'cancelled';
    localStorage.setItem('poemShelfOrders', JSON.stringify(allOrders));
    showToast('✓', 'Order cancelled successfully');
    loadOrders();
  } else {
    showToast('✗', 'Cannot cancel this order');
  }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Check for saved session
  const savedUser = localStorage.getItem('poemShelfCurrentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateUI();
  }
  
  render();
  update();
  
  // Close modals on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeAuth();
      document.getElementById('checkout').classList.remove('show');
    }
  });
});

document.getElementById('checkout').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('show');
});