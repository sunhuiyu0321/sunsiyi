/* =========================================================
   智能云AI电商在线销售系统 —— 核心逻辑
   说明：纯静态前端实现，数据存于 localStorage。
   预设账号：202471022 / 200622shy
   ========================================================= */

/* ---------- 预设账号 ---------- */
const PRESET_ACCOUNTS = [
  { username: "202471023", password: "SSYsjy441", name: "默认用户" },
  { username: "202471022", password: "200622shy", name: "默认用户" }
];

/* ---------- 商品数据 ---------- */
const PRODUCTS = [
  { id: 1,  name: "智能AI语音音箱",     tag: "AI硬件", price: 299,  img: "https://picsum.photos/seed/ai001/400/300" },
  { id: 2,  name: "云服务器 ECS 年套餐", tag: "云服务", price: 999,  img: "https://picsum.photos/seed/ai002/400/300" },
  { id: 3,  name: "AI 智能摄像头",       tag: "AI硬件", price: 459,  img: "https://picsum.photos/seed/ai003/400/300" },
  { id: 4,  name: "智能运动手环",       tag: "穿戴",   price: 199,  img: "https://picsum.photos/seed/ai004/400/300" },
  { id: 5,  name: "机械键盘 87键",       tag: "外设",   price: 399,  img: "https://picsum.photos/seed/ai005/400/300" },
  { id: 6,  name: "无线静音鼠标",       tag: "外设",   price: 129,  img: "https://picsum.photos/seed/ai006/400/300" },
  { id: 7,  name: "智能护眼台灯",       tag: "智能家居", price: 159, img: "https://picsum.photos/seed/ai007/400/300" },
  { id: 8,  name: "AI 实时翻译笔",      tag: "AI硬件", price: 349,  img: "https://picsum.photos/seed/ai008/400/300" },
  { id: 9,  name: "智能体脂秤",         tag: "智能家居", price: 99,   img: "https://picsum.photos/seed/ai009/400/300" },
  { id: 10, name: "云存储会员年卡",     tag: "云服务", price: 199,  img: "https://picsum.photos/seed/ai010/400/300" },
  { id: 11, name: "主动降噪智能耳机",   tag: "穿戴",   price: 599,  img: "https://picsum.photos/seed/ai011/400/300" },
  { id: 12, name: "AI 学习平板 11寸",   tag: "AI硬件", price: 2499, img: "https://picsum.photos/seed/ai012/400/300" }
];

/* ---------- 工具函数 ---------- */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

function getUsers() {
  try { return JSON.parse(localStorage.getItem("shop_users") || "[]"); }
  catch { return []; }
}
function saveUsers(users) { localStorage.setItem("shop_users", JSON.stringify(users)); }

function getCurrentUser() { return localStorage.getItem("shop_currentUser"); }

function toast(msg) {
  let t = $("#toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast"; t.className = "toast"; document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 1800);
}

function fmtPrice(n) { return "¥" + Number(n).toLocaleString("zh-CN"); }

/* =========================================================
   购物车逻辑
   ========================================================= */
function getCart() {
  try { return JSON.parse(localStorage.getItem("shop_cart") || "[]"); }
  catch { return []; }
}
function saveCart(cart) { localStorage.setItem("shop_cart", JSON.stringify(cart)); }

function addToCart(id) {
  if (!getCurrentUser()) {
    toast("请先登录后再加入购物车");
    setTimeout(() => { location.href = "login.html"; }, 900);
    return;
  }
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const cart = getCart();
  const item = cart.find(c => c.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart(cart);
  updateCartBadge();
  toast(`已加入：${product.name}`);
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    const idx = cart.indexOf(item);
    cart.splice(idx, 1);
  }
  saveCart(cart);
  renderCart();
  updateCartBadge();
}

function removeFromCart(id) {
  const cart = getCart().filter(c => c.id !== id);
  saveCart(cart);
  renderCart();
  updateCartBadge();
}

function cartCount() { return getCart().reduce((s, c) => s + c.qty, 0); }
function cartTotal() {
  return getCart().reduce((s, c) => {
    const p = PRODUCTS.find(x => x.id === c.id);
    return s + (p ? p.price * c.qty : 0);
  }, 0);
}

function updateCartBadge() {
  const badge = $("#cart-badge");
  if (!badge) return;
  const n = cartCount();
  badge.textContent = n;
  badge.style.display = n > 0 ? "grid" : "none";
}

function renderCart() {
  const body = $("#cart-body");
  const totalEl = $("#cart-total");
  if (!body) return;
  const cart = getCart();
  if (cart.length === 0) {
    body.innerHTML = '<div class="empty-cart">购物车还是空的 🛒<br>去首页挑选心仪商品吧</div>';
    totalEl.textContent = fmtPrice(0);
    return;
  }
  body.innerHTML = cart.map(c => {
    const p = PRODUCTS.find(x => x.id === c.id);
    if (!p) return "";
    return `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.name}">
        <div class="info">
          <div class="nm">${p.name}</div>
          <div class="pr">${fmtPrice(p.price)}</div>
          <div class="qty">
            <button onclick="changeQty(${p.id}, -1)">−</button>
            <span>${c.qty}</span>
            <button onclick="changeQty(${p.id}, 1)">+</button>
            <button class="remove" onclick="removeFromCart(${p.id})" style="margin-left:auto">删除</button>
          </div>
        </div>
      </div>`;
  }).join("");
  totalEl.textContent = fmtPrice(cartTotal());
}

function openCart() { renderCart(); $("#cart-drawer").classList.add("open"); $("#cart-overlay").classList.add("open"); }
function closeCart() { $("#cart-drawer").classList.remove("open"); $("#cart-overlay").classList.remove("open"); }

function checkout() {
  const cart = getCart();
  if (cart.length === 0) { toast("购物车为空"); return; }
  toast(`下单成功！合计 ${fmtPrice(cartTotal())} 🎉`);
  saveCart([]);
  setTimeout(() => { renderCart(); updateCartBadge(); closeCart(); }, 1200);
}

/* =========================================================
   页面渲染分发
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const user = getCurrentUser();

  /* 顶部导航登录态 */
  const navUser = $("#nav-user");
  const navLogin = $("#nav-login");
  if (navUser && navLogin) {
    if (user) {
      navUser.style.display = "inline-flex";
      navLogin.style.display = "none";
      $("#nav-username").textContent = user;
    } else {
      navUser.style.display = "none";
      navLogin.style.display = "inline-flex";
    }
  }

  /* 首页商品列表 */
  const grid = $("#product-grid");
  if (grid) {
    grid.innerHTML = PRODUCTS.map(p => `
      <div class="product-card">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        <div class="product-body">
          <span class="product-tag">${p.tag}</span>
          <div class="product-name">${p.name}</div>
          <div class="product-foot">
            <span class="price">${fmtPrice(p.price)}</span>
            <button class="btn btn-primary btn-sm" onclick="addToCart(${p.id})">加入购物车</button>
          </div>
        </div>
      </div>`).join("");
    updateCartBadge();
  }

  /* 购物车抽屉事件 */
  const overlay = $("#cart-overlay");
  if (overlay) overlay.addEventListener("click", closeCart);

  /* 退出登录 */
  const logoutBtn = $("#logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("shop_currentUser");
    toast("已退出登录");
    setTimeout(() => location.href = "login.html", 800);
  });

  /* ---------- 登录页 ---------- */
  const loginForm = $("#login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = $("#login-username").value.trim();
      const password = $("#login-password").value;
      const msg = $("#login-msg");
      const preset = PRESET_ACCOUNTS.find(a => a.username === username && a.password === password);
      const regUser = getUsers().find(u => u.username === username && u.password === password);
      if (preset || regUser) {
        localStorage.setItem("shop_currentUser", username);
        msg.className = "form-msg success";
        msg.textContent = "登录成功，正在跳转到首页…";
        setTimeout(() => location.href = "index.html", 700);
      } else {
        msg.className = "form-msg error";
        msg.textContent = "账号或密码错误，请重试。";
      }
    });
  }

  /* ---------- 注册页 ---------- */
  const regForm = $("#register-form");
  if (regForm) {
    regForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = $("#reg-username").value.trim();
      const password = $("#reg-password").value;
      const confirm = $("#reg-confirm").value;
      const msg = $("#reg-msg");
      if (username.length < 4) { msg.className = "form-msg error"; msg.textContent = "账号至少 4 位"; return; }
      if (password.length < 6) { msg.className = "form-msg error"; msg.textContent = "密码至少 6 位"; return; }
      if (password !== confirm) { msg.className = "form-msg error"; msg.textContent = "两次密码不一致"; return; }
      const users = getUsers();
      if (users.some(u => u.username === username) || PRESET_ACCOUNTS.some(a => a.username === username)) {
        msg.className = "form-msg error"; msg.textContent = "该账号已被注册"; return;
      }
      users.push({ username, password, name: username });
      saveUsers(users);
      msg.className = "form-msg success"; msg.textContent = "注册成功，正在跳转到登录页…";
      setTimeout(() => location.href = "login.html", 800);
    });
  }
});
