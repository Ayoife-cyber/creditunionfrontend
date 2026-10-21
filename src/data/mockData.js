export const WALLET_ADDRESS = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
export const BTC_PRICE_USD = 80000; // simulated live price

export const TRANSACTIONS = [
  { id: 1, type: 'deposit', label: 'Salary Deposit', amount: '+$4,200.00', status: 'completed', date: 'Today, 09:14', tag: 'deposit', color: '#10b981' },
  { id: 2, type: 'withdrawal', label: 'Wire Transfer', amount: '-$850.00', status: 'completed', date: 'Today, 08:30', tag: 'withdrawal', color: '#ef4444' },
  { id: 3, type: 'crypto', label: 'BTC Purchase', amount: '-$1,136.42', status: 'completed', date: 'Yesterday, 17:05', tag: 'crypto', color: '#f97316' },
  { id: 4, type: 'swap', label: 'BTC → USDT Swap', amount: '+$980.00', status: 'completed', date: 'Yesterday, 14:21', tag: 'crypto', color: '#8b5cf6' },
  { id: 5, type: 'deposit', label: 'Freelance Payment', amount: '+$2,500.00', status: 'completed', date: 'May 10, 11:00', tag: 'deposit', color: '#10b981' },
  { id: 6, type: 'withdrawal', label: 'Rent Payment', amount: '-$1,200.00', status: 'completed', date: 'May 9, 08:00', tag: 'withdrawal', color: '#ef4444' },
  { id: 7, type: 'crypto', label: 'BTC Transfer Out', amount: '-0.05 BTC', status: 'pending', date: 'May 8, 16:44', tag: 'crypto', color: '#f97316' },
  { id: 8, type: 'deposit', label: 'Dividend Income', amount: '+$320.00', status: 'completed', date: 'May 7, 10:30', tag: 'deposit', color: '#10b981' },
  { id: 9, type: 'swap', label: 'USD → BTC Swap', amount: '+0.012 BTC', status: 'completed', date: 'May 6, 13:15', tag: 'crypto', color: '#8b5cf6' },
  { id: 10, type: 'withdrawal', label: 'ATM Withdrawal', amount: '-$200.00', status: 'completed', date: 'May 5, 09:00', tag: 'withdrawal', color: '#ef4444' },
  { id: 11, type: 'crypto', label: 'BTC Staking Reward', amount: '+0.001 BTC', status: 'completed', date: 'May 4, 00:00', tag: 'crypto', color: '#f97316' },
  { id: 12, type: 'deposit', label: 'Bank Interest', amount: '+$46.18', status: 'pending', date: 'May 3, 12:00', tag: 'deposit', color: '#10b981' },
];

// ── Admin-overridable helpers ──────────────────────────────────────────────────

/** Returns the global admin-set wallet address, or the default hardcoded one. */
export function getWalletAddress() {
  try {
    const override = localStorage.getItem('shughar_wallet_address');
    if (override) return override;
  } catch { /* ignore */ }
  return WALLET_ADDRESS;
}

/**
 * Returns the wallet address for a specific user.
 * Priority: per-user address → global override → hardcoded default.
 */
export function getUserWalletAddress(email) {
  try {
    if (email) {
      const store = localStorage.getItem('shughar_user_wallets');
      if (store) {
        const parsed = JSON.parse(store);
        if (parsed[email]) return parsed[email];
      }
    }
  } catch { /* ignore */ }
  return getWalletAddress();
}

/** Saves a wallet address for a specific user. */
export function saveUserWalletAddress(email, address) {
  if (!email) return;
  try {
    const store = localStorage.getItem('shughar_user_wallets');
    const parsed = store ? JSON.parse(store) : {};
    if (address && address.trim()) {
      parsed[email] = address.trim();
    } else {
      delete parsed[email]; // removing sets them back to global/default
    }
    localStorage.setItem('shughar_user_wallets', JSON.stringify(parsed));
  } catch { /* ignore */ }
}


/**
 * Returns transactions for a specific user (by email).
 * Falls back to the shared DEFAULT_TRANSACTIONS if none have been set by admin.
 */
export function getTransactions(email) {
  try {
    const store = localStorage.getItem('shughar_transactions');
    if (store) {
      const parsed = JSON.parse(store);
      if (email && parsed[email]) return parsed[email];
    }
  } catch { /* ignore */ }
  return TRANSACTIONS;
}

/**
 * Saves transactions for a specific user (by email) to the admin store.
 */
export function saveTransactions(email, transactions) {
  try {
    const store = localStorage.getItem('shughar_transactions');
    const parsed = store ? JSON.parse(store) : {};
    parsed[email] = transactions;
    localStorage.setItem('shughar_transactions', JSON.stringify(parsed));
  } catch { /* ignore */ }
}

// ── Admin Users Registry ──────────────────────────────────────────────────────

export const ADMIN_USERS_KEY = 'shughar_users';

/** Returns all registered users from the admin registry. */
export function getAllUsers() {
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    return raw ? Object.values(JSON.parse(raw)) : [];
  } catch { return []; }
}

/** Saves / updates a user in the admin registry (keyed by email). */
export function upsertUser(userProfile) {
  if (!userProfile?.email) return;
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    const isNew = !store[userProfile.email]; // first time we see this email
    store[userProfile.email] = {
      ...store[userProfile.email],
      ...userProfile,
      // Only set signedUpAt once — never overwrite it on subsequent updates
      signedUpAt: store[userProfile.email]?.signedUpAt ?? (isNew ? Date.now() : null),
    };
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(store));
  } catch { /* ignore */ }
}

/**
 * Returns the number of users who signed up after the given timestamp (ms).
 * Pass 0 to count all users.
 */
export function getNewUsersCount(since = 0) {
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    if (!raw) return 0;
    return Object.values(JSON.parse(raw)).filter(
      u => u.signedUpAt && u.signedUpAt > since
    ).length;
  } catch { return 0; }
}

/** Updates a specific field set for a user and returns the updated profile. */
export function updateUserInRegistry(email, updates) {
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[email] = { ...store[email], ...updates };
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(store));
    return store[email];
  } catch { return null; }
}


export const INITIAL_NOTIFICATIONS = [
  {
    icon: '💰',
    iconPath: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
    color: '#10B981',
    title: 'Salary Credited',
    body: '$4,200 deposited to your account',
    time: 'Just now',
  },
  {
    icon: '₿',
    iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: '#F59E0B',
    title: 'BTC Price Alert',
    body: 'BTC rose 2.4% in the last 24h',
    time: '10 min ago',
  },
  {
    icon: '⚠️',
    iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    color: '#F97316',
    title: 'Pending Transaction',
    body: 'BTC Transfer awaiting confirmation',
    time: '2 hrs ago',
  },
  {
    icon: '🔐',
    iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    color: '#06B6D4',
    title: 'Login Detected',
    body: 'New sign-in from Chrome, Lagos NG',
    time: 'Yesterday',
  },
];

export const CHART_DATA = {
  '1W': [112000, 115400, 118200, 116800, 119500, 120100, 121220],
  '1M': [108000, 111000, 114500, 110200, 116000, 118900, 121220],
  '1Y': [95000, 100000, 105000, 99000, 108000, 115000, 121220],
};
