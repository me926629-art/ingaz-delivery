const API_BASE = '/api';
let token = localStorage.getItem('ingazAdminToken');

function getToken() {
  token = localStorage.getItem('ingazAdminToken');
  return token;
}

async function apiFetch(url, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'خطأ');
  return data;
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.user.role !== 'admin') {
      errorEl.textContent = 'هذا الحساب ليس لديه صلاحيات مشرف';
      errorEl.style.display = 'block';
      return;
    }
    localStorage.setItem('ingazAdminToken', data.token);
    showDashboard();
    loadOrders();
  } catch (e) {
    errorEl.textContent = e.message;
    errorEl.style.display = 'block';
  }
}

function handleLogout() {
  localStorage.removeItem('ingazAdminToken');
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
}

async function loadOrders() {
  try {
    const orders = await apiFetch('/orders');
    renderOrders(orders);
  } catch (e) {
    document.getElementById('ordersContent').innerHTML = `
      <div class="empty-orders">
        <i class="fas fa-exclamation-triangle"></i>
        <p>${e.message}</p>
      </div>
    `;
  }
}

function renderOrders(orders) {
  const content = document.getElementById('ordersContent');

  if (!orders || orders.length === 0) {
    content.innerHTML = `
      <div class="empty-orders">
        <i class="fas fa-inbox"></i>
        <p>لا توجد طلبات حتى الآن</p>
      </div>
    `;
    updateStats([]);
    return;
  }

  updateStats(orders);

  const statusMap = {
    pending: 'قيد الانتظار',
    confirmed: 'تم التأكيد',
    preparing: 'قيد التجهيز',
    delivering: 'في الطريق',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  };

  let html = `<table>
    <thead><tr>
      <th>#</th>
      <th>العميل</th>
      <th>الهاتف</th>
      <th>العنوان</th>
      <th>المنتجات</th>
      <th>الإجمالي</th>
      <th>التاريخ</th>
      <th>الحالة</th>
    </tr></thead><tbody>`;

  orders.forEach((o, i) => {
    const itemsList = o.items.map(item =>
      `• ${item.name} × ${item.qty} = ${item.price * item.qty} ج.م`
    ).join('<br>');

    const date = new Date(o.createdAt).toLocaleDateString('ar-EG', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    html += `<tr>
      <td>${i + 1}</td>
      <td><strong>${o.customerName}</strong></td>
      <td dir="ltr">${o.phone}</td>
      <td style="font-size:12px;">${o.address}</td>
      <td class="items-cell">${itemsList}</td>
      <td><strong>${o.total} ج.م</strong></td>
      <td style="font-size:11px;color:#636e72;">${date}</td>
      <td>
        <select class="status-select" onchange="updateStatus('${o._id}', this.value)">
          ${Object.entries(statusMap).map(([key, label]) =>
            `<option value="${key}" ${o.status === key ? 'selected' : ''}>${label}</option>`
          ).join('')}
        </select>
      </td>
    </tr>`;
  });

  html += '</tbody></table>';
  content.innerHTML = html;
}

function updateStats(orders) {
  document.getElementById('statTotal').textContent = orders.length;
  document.getElementById('statPending').textContent = orders.filter(o => o.status === 'pending').length;
  document.getElementById('statActive').textContent = orders.filter(o =>
    ['confirmed', 'preparing', 'delivering'].includes(o.status)
  ).length;
  document.getElementById('statDelivered').textContent = orders.filter(o => o.status === 'delivered').length;
}

async function updateStatus(orderId, newStatus) {
  try {
    await apiFetch(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
    });
    loadOrders();
  } catch (e) {
    alert('فشل تحديث الحالة: ' + e.message);
  }
}

// Check token on load
if (token) {
  apiFetch('/auth/me').then(() => {
    showDashboard();
    loadOrders();
  }).catch(() => {
    localStorage.removeItem('ingazAdminToken');
  });
}
