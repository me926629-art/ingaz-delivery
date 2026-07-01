// ===== State =====
let cart = JSON.parse(localStorage.getItem('ingazCart')) || [];
let currentStore = null;
let currentCategory = 'all';
let storesCache = [];

// ===== DOM Refs =====
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const storesGrid = $('#storesGrid');
const categoriesEl = $('#categories');
const searchInput = $('#searchInput');
const cartBtn = $('#cartBtn');
const cartCount = $('#cartCount');
const cartSidebar = $('#cartSidebar');
const cartOverlay = $('#cartOverlay');
const cartItems = $('#cartItems');
const cartTotal = $('#cartTotal');
const closeCart = $('#closeCart');
const productsSection = $('#productsSection');
const productsGrid = $('#productsGrid');
const productsTitle = $('#productsTitle');
const closeProducts = $('#closeProducts');
const checkoutModal = $('#checkoutModal');
const checkoutItems = $('#checkoutItems');
const checkoutTotal = $('#checkoutTotal');
const checkoutForm = $('#checkoutForm');
const submitOrder = $('#submitOrder');
const successModal = $('#successModal');
const continueShopping = $('#continueShopping');
const toast = $('#toast');

// ===== Constants =====
const categories = [
  { id: "all", name: "الكل", icon: "fas fa-th-large" },
  { id: "supermarket", name: "سوبرماركت", icon: "fas fa-shopping-basket" },
  { id: "restaurant", name: "مطاعم", icon: "fas fa-utensils" },
  { id: "shop", name: "محلات", icon: "fas fa-store" },
];

const badgeMap = {
  supermarket: 'سوبرماركت',
  restaurant: 'مطعم',
  shop: 'محل',
};
const badgeClassMap = {
  supermarket: 'badge-supermarket',
  restaurant: 'badge-restaurant',
  shop: 'badge-shop',
};

// ===== Render Categories =====
function renderCategories() {
  categoriesEl.innerHTML = categories.map((cat) => `
    <div class="category-card ${cat.id === currentCategory ? 'active' : ''}" data-category="${cat.id}">
      <div class="icon"><i class="${cat.icon}"></i></div>
      <span>${cat.name}</span>
    </div>
  `).join('');

  categoriesEl.querySelectorAll('.category-card').forEach((el) => {
    el.addEventListener('click', () => {
      currentCategory = el.dataset.category;
      renderCategories();
      renderStores();
      document.querySelector('.stores-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ===== Render Stores =====
async function renderStores() {
  try {
    const query = searchInput.value.trim();
    storesCache = await API.getStores(currentCategory, query);

    if (storesCache.length === 0) {
      storesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--gray-700);">
          <i class="fas fa-store" style="font-size: 50px; color: var(--gray-400); margin-bottom: 15px; display: block;"></i>
          <p style="font-size: 18px; font-weight: 600;">لا توجد متاجر في هذا القسم</p>
        </div>
      `;
      return;
    }

    storesGrid.innerHTML = storesCache.map((store) => `
      <div class="store-card" data-store-id="${store._id}">
        <div class="store-image">
          <img src="${store.image}" alt="${store.name}" loading="lazy">
          <span class="store-badge ${badgeClassMap[store.category]}">${badgeMap[store.category]}</span>
          <span class="store-rating"><i class="fas fa-star"></i> ${store.rating}</span>
        </div>
        <div class="store-body">
          <h3>${store.name}</h3>
          <p>${store.description}</p>
          <div class="store-meta">
            <span><i class="fas fa-clock"></i> ${store.deliveryTime} دقيقة</span>
            <span><i class="fas fa-truck"></i> ${store.deliveryFee} ج.م</span>
          </div>
        </div>
      </div>
    `).join('');

    storesGrid.querySelectorAll('.store-card').forEach((el) => {
      el.addEventListener('click', () => openStoreProducts(el.dataset.storeId));
    });
  } catch (err) {
    storesGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--gray-700);">
        <i class="fas fa-exclamation-triangle" style="font-size: 50px; color: var(--primary); margin-bottom: 15px; display: block;"></i>
        <p style="font-size: 18px; font-weight: 600;">تعذر تحميل المتاجر</p>
        <p style="font-size: 14px;">تأكد من تشغيل الخادم الخلفي</p>
      </div>
    `;
  }
}

// ===== Open Store Products =====
async function openStoreProducts(storeId) {
  try {
    const data = await API.getStoreWithProducts(storeId);
    const store = data.store;
    const products = data.products;
    currentStore = store;

    productsTitle.innerHTML = `${store.name} <small>${store.description}</small>`;
    productsGrid.innerHTML = products.map((p) => `
      <div class="product-card">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="product-info">
          <h4>${p.name}</h4>
          <div class="product-unit">${p.unit}</div>
          <div class="product-bottom">
            <span class="product-price">${p.price}</span>
            <button class="add-to-cart" data-product-id="${p._id}" data-store-id="${store._id}">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    productsGrid.querySelectorAll('.add-to-cart').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(btn.dataset.productId, btn.dataset.storeId);
      });
    });

    productsSection.classList.add('open');
    document.body.style.overflow = 'hidden';
  } catch (err) {
    showToast('حدث خطأ أثناء تحميل المنتجات');
  }
}

function closeStoreProducts() {
  productsSection.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== Cart Functions =====
function findProduct(storeId, productId) {
  const allStores = storesCache;
  let store = allStores.find((s) => s._id === storeId);
  if (!store && currentStore && currentStore._id === storeId) store = currentStore;
  if (!store) return null;
  const product = productId._id ? productId : { _id: productId };
  const found = store.products
    ? store.products.find((p) => p._id === (productId._id || productId))
    : null;
  if (found) return found;
  return null;
}

async function addToCart(productId, storeId) {
  try {
    const data = await API.getStoreWithProducts(storeId);
    const product = data.products.find((p) => p._id === productId);
    if (!product) return;

    const existing = cart.find((c) => c.productId === productId && c.storeId === storeId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        productId: product._id,
        storeId: data.store._id,
        storeName: data.store.name,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: 1,
      });
    }

    saveCart();
    updateCartUI();
    showToast(`تم إضافة ${product.name} إلى السلة`);
  } catch {
    showToast('حدث خطأ');
  }
}

function removeFromCart(productId, storeId) {
  cart = cart.filter((c) => !(c.productId === productId && c.storeId === storeId));
  saveCart();
  updateCartUI();
}

function updateQty(productId, storeId, delta) {
  const item = cart.find((c) => c.productId === productId && c.storeId === storeId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId, storeId);
    return;
  }
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('ingazCart', JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((sum, c) => sum + c.price * c.qty, 0);
}

function getCartCount() {
  return cart.reduce((sum, c) => sum + c.qty, 0);
}

function updateCartUI() {
  const count = getCartCount();
  cartCount.textContent = count;
  cartCount.style.display = count > 0 ? 'flex' : 'none';
  renderCartItems();
  renderCheckoutSummary();
}

function renderCartItems() {
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-cart"></i>
        <p>السلة فارغة</p>
        <p style="font-size: 14px; font-weight: 400;">تصفح المتاجر وأضف ما تريد</p>
      </div>
    `;
    cartTotal.textContent = '0 ج.م';
    return;
  }

  cartItems.innerHTML = cart.map((c) => `
    <div class="cart-item">
      <img src="${c.image}" alt="${c.name}">
      <div class="cart-item-info">
        <h4>${c.name}</h4>
        <div class="item-store">${c.storeName}</div>
        <div class="cart-item-price">${c.price} ج.م</div>
      </div>
      <div class="cart-item-qty">
        <button onclick="updateQty('${c.productId}', '${c.storeId}', -1)"><i class="fas fa-minus"></i></button>
        <span>${c.qty}</span>
        <button onclick="updateQty('${c.productId}', '${c.storeId}', 1)"><i class="fas fa-plus"></i></button>
      </div>
      <button class="remove-item" onclick="removeFromCart('${c.productId}', '${c.storeId}')">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  `).join('');

  cartTotal.textContent = `${getCartTotal()} ج.م`;
}

function renderCheckoutSummary() {
  if (!checkoutModal.classList.contains('open')) return;
  if (cart.length === 0) {
    checkoutItems.innerHTML = '<p style="text-align:center;color:var(--gray-700);">السلة فارغة</p>';
    checkoutTotal.textContent = '0 ج.م';
    return;
  }
  checkoutItems.innerHTML = cart.map((c) => `
    <div class="order-summary-item">
      <span>${c.name} × ${c.qty}</span>
      <span>${c.price * c.qty} ج.م</span>
    </div>
  `).join('');
  checkoutTotal.textContent = `${getCartTotal()} ج.م`;
}

// ===== Toast =====
function showToast(msg) {
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== Cart Sidebar =====
function openCart() {
  renderCartItems();
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCartSidebar() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== Checkout =====
function openCheckout() {
  if (cart.length === 0) {
    showToast('السلة فارغة! أضف منتجات أولاً');
    return;
  }
  checkoutModal.classList.add('open');
  renderCheckoutSummary();
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  checkoutModal.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== Submit Order =====
async function handleSubmitOrder(e) {
  e.preventDefault();
  if (cart.length === 0) {
    showToast('السلة فارغة');
    return;
  }

  const formData = new FormData(checkoutForm);
  const name = formData.get('name');
  const phone = formData.get('phone');
  const address = formData.get('address');

  if (!name || !phone || !address) {
    showToast('يرجى ملء جميع الحقول المطلوبة');
    return;
  }

  const items = cart.map((c) => ({
    product: c.productId,
    store: c.storeId,
    name: c.name,
    price: c.price,
    qty: c.qty,
    image: c.image,
  }));

  try {
    await API.createOrder({
      customerName: name,
      phone,
      address,
      paymentMethod: formData.get('payment') || 'cash',
      notes: formData.get('notes') || '',
      items,
    });

    cart = [];
    saveCart();
    updateCartUI();
    closeCheckout();
    closeCartSidebar();
    successModal.classList.add('open');
    checkoutForm.reset();

    console.log('✅ Order submitted successfully!');
  } catch (err) {
    showToast(err.message || 'حدث خطأ أثناء إرسال الطلب');
  }
}

// ===== Event Listeners =====
closeProducts.addEventListener('click', closeStoreProducts);
productsSection.addEventListener('click', (e) => {
  if (e.target === productsSection) closeStoreProducts();
});

cartBtn.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartSidebar);
cartOverlay.addEventListener('click', closeCartSidebar);

$('#checkoutBtn').addEventListener('click', openCheckout);
document.querySelectorAll('.close-checkout').forEach((el) => {
  el.addEventListener('click', closeCheckout);
});
checkoutModal.addEventListener('click', (e) => {
  if (e.target === checkoutModal) closeCheckout();
});
checkoutForm.addEventListener('submit', handleSubmitOrder);
submitOrder.addEventListener('click', handleSubmitOrder);

continueShopping.addEventListener('click', () => {
  successModal.classList.remove('open');
  document.body.style.overflow = '';
});

searchInput.addEventListener('input', renderStores);

$('#browseStores').addEventListener('click', () => {
  document.querySelector('.categories-section').scrollIntoView({ behavior: 'smooth' });
});

// ===== Init =====
function init() {
  renderCategories();
  renderStores();
  updateCartUI();
}

init();
