const API = (() => {
  const BASE = '/api';

  async function request(url, options = {}) {
    const token = localStorage.getItem('ingazToken');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${BASE}${url}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'خطأ في الاتصال');
    return data;
  }

  return {
    // Auth
    login: (email, password) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (name, email, password, phone) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, phone }) }),
    getMe: () => request('/auth/me'),

    // Stores
    getStores: (category = 'all', search = '') => {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (search) params.set('search', search);
      const qs = params.toString();
      return request(`/stores${qs ? `?${qs}` : ''}`);
    },
    getStoreWithProducts: (id) => request(`/stores/${id}`),

    // Orders
    createOrder: (orderData) =>
      request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),

    // Admin
    createStore: (data) =>
      request('/stores', { method: 'POST', body: JSON.stringify(data) }),
    updateStore: (id, data) =>
      request(`/stores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteStore: (id) =>
      request(`/stores/${id}`, { method: 'DELETE' }),
    createProduct: (data) =>
      request('/products', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct: (id, data) =>
      request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProduct: (id) =>
      request(`/products/${id}`, { method: 'DELETE' }),
    getOrders: () => request('/orders'),
    updateOrderStatus: (id, status) =>
      request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  };
})();
