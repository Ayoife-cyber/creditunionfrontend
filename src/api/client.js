const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// The admin token is stored under a separate key so AuthContext never touches it
const ADMIN_TOKEN_KEY = 'shughar_admin_token';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  // Prefer: explicit token > admin token > regular user token
  const authToken =
    token ||
    localStorage.getItem(ADMIN_TOKEN_KEY) ||
    localStorage.getItem('shughar_token');
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }
  return data;
}

export const authApi = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
  verifyOtp: (payload) => request('/auth/verify-otp', { method: 'POST', body: payload }),
  toggleCardLock: (email) => request(`/auth/users/${encodeURIComponent(email)}/toggle-card-lock`, { method: 'PUT' }),
  updateBalance: (email, payload) => request(`/auth/users/${encodeURIComponent(email)}/balance`, { method: 'PUT', body: payload }),
  updateCardDetails: (email, payload) => request(`/auth/users/${encodeURIComponent(email)}/card-details`, { method: 'PUT', body: payload }),
  getUsers: () => request('/auth/users'),
  deleteUser: (email) => request(`/auth/users/${encodeURIComponent(email)}`, { method: 'DELETE' }),
  toggleUserStatus: (email) => request(`/auth/users/${encodeURIComponent(email)}/status`, { method: 'PUT' }),

  // Transactions
  getUserTransactions: (email) => request(`/transactions/user/${encodeURIComponent(email)}`),
  addTransaction: (email, payload) => request(`/transactions/user/${encodeURIComponent(email)}`, { method: 'POST', body: payload }),
  updateTransaction: (id, payload) => request(`/transactions/${id}`, { method: 'PUT', body: payload }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
  getMyTransactions: (token) => request('/transactions', { token }),
};
