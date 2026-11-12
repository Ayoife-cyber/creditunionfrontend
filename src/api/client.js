const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ADMIN_TOKEN_KEY = 'shughar_admin_token';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };

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
  toggleSend: (email, sendEnabled) => request('/auth/users/' + encodeURIComponent(email) + '/toggle-send', { method: 'PUT', body: { sendEnabled } }),
  updateBalance: (email, payload) => request(`/auth/users/${encodeURIComponent(email)}/balance`, { method: 'PUT', body: payload }),
  updateSendMessage: (email, payload) => request('/auth/users/' + encodeURIComponent(email) + '/send-message', { method: 'PUT', body: payload }),
  updateSendReviewPopup: (email, payload) => request(`/auth/users/${encodeURIComponent(email)}/send-review-popup`, { method: 'PUT', body: payload }),
  updateWallets: (email, payload) => request(`/auth/users/${encodeURIComponent(email)}/wallets`, { method: 'PUT', body: payload }),
  getGlobalSendReviewPopup: () => request('/auth/settings/send-review-popup'),
  updateGlobalSendReviewPopup: (payload) => request('/auth/settings/send-review-popup', { method: 'PUT', body: payload }),
  getGlobalSettings: () => request('/auth/settings/global'),
  updateGlobalSettings: (payload) => request('/auth/settings/global', { method: 'PUT', body: payload }),
  updateCardDetails: (email, payload) => request(`/auth/users/${encodeURIComponent(email)}/card-details`, { method: 'PUT', body: payload }),
  updateWithdrawalMessage: (email, payload) => request(`/auth/users/${encodeURIComponent(email)}/withdrawal-message`, { method: 'PUT', body: payload }),
  getUsers: () => request('/auth/users'),
  deleteUser: (email) => request(`/auth/users/${encodeURIComponent(email)}`, { method: 'DELETE' }),
  toggleUserStatus: (email) => request(`/auth/users/${encodeURIComponent(email)}/status`, { method: 'PUT' }),


  getUserTransactions: (email) => request(`/transactions/user/${encodeURIComponent(email)}`),
  addTransaction: (email, payload) => request(`/transactions/user/${encodeURIComponent(email)}`, { method: 'POST', body: payload }),
  updateTransaction: (id, payload) => request(`/transactions/${id}`, { method: 'PUT', body: payload }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
  getMyTransactions: (token) => request('/transactions', { token }),
};
