import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { authApi } from '../api/client.js';
import { DEFAULT_BALANCE } from '../config/balanceConfig.js';
import { upsertUser } from '../data/mockData.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'shughar_token';
const PROFILE_KEY = 'shughar_profile';

// Normalise whatever the backend sends into a consistent shape
function normaliseUser(raw) {
  if (!raw) return null;
  return {
    // identity
    fullName:      raw.fullName      || raw.name        || raw.username || '',
    email:         raw.email         || '',
    mobileNumber:  raw.mobileNumber  || raw.phone       || raw.mobile   || '',
    accountNumber: raw.accountNumber || raw.account     || raw.accountId || '',
    accountType:   raw.accountType   || 'Premium Savings',
    address:       raw.address       || '',
    // card
    cardHolderName: raw.cardHolderName || raw.fullName || raw.name || '',
    cardNumber:     raw.cardNumber     || '**** 4821',
    expiryDate:     raw.expiryDate     || '09/28',
    cardType:       raw.cardType       || 'Platinum',
    spendLimit:     raw.spendLimit     || '$8,500',
    rewards:        raw.rewards        || '0 pts',
    // balance
    balanceUsd: raw.balanceUsd ?? DEFAULT_BALANCE.balanceUsd,
    btcHolding: raw.btcHolding ?? DEFAULT_BALANCE.btcHolding,
    // pass everything else through
    ...raw,
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // On mount — if a token exists, refresh user from /me
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!token) { setLoading(false); return; }
      try {
        const { user: freshUser } = await authApi.me(token);
        if (!cancelled) {
          const normalised = normaliseUser(freshUser);
          setUser(normalised);
          localStorage.setItem(PROFILE_KEY, JSON.stringify(normalised));
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(PROFILE_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();

    // Poll every 10 seconds to reflect immediate admin changes (like balance/card lock)
    const pollInterval = setInterval(() => {
      if (token && !cancelled) {
        authApi.me(token).then(({ user: freshUser }) => {
          if (!cancelled) {
            const normalised = normaliseUser(freshUser);
            setUser(normalised);
            localStorage.setItem(PROFILE_KEY, JSON.stringify(normalised));
          }
        }).catch(() => { /* ignore silent polling errors */ });
      }
    }, 10000);

    return () => { 
      cancelled = true; 
      clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const persistUser = useCallback((raw) => {
    const normalised = raw ? normaliseUser(raw) : null;
    if (normalised) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(normalised));
    } else {
      localStorage.removeItem(PROFILE_KEY);
    }
    setUser(normalised);
    return normalised;
  }, []);

  const login = useCallback(async (identifier, password) => {
    const result = await authApi.login({ identifier, password });
    if (result.token) {
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      const saved = persistUser(result.user);
      // ── Sync to admin users registry ──
      if (saved) upsertUser(saved);
      setLoading(false);
    }
    return result;
  }, [persistUser]);

  const signup = useCallback(async (fullName, email, password, confirmPassword, phone) => {
    // Clear any stale session from a previous attempt before firing a fresh signup
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setToken(null);
    setUser(null);

    const res = await authApi.signup({
      fullName,
      email,
      mobileNumber: phone,
      password,
      confirmPassword,
    });

    // If the backend returned a full auth token, the account is fully active
    if (res.token) {
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      const saved = persistUser(res.user || { fullName, email, mobileNumber: phone });
      // ── Sync to admin users registry ──
      if (saved) upsertUser(saved);
      setLoading(false);
      return saved;
    }

    // No auth token returned — account needs OTP verification
    const tempToken = res.tempToken || res.token || '';
    const partial = normaliseUser({ fullName, email, mobileNumber: phone, ...res.user });
    // ── Register the partial profile so admin can see it immediately ──
    upsertUser(partial);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(partial));
    if (tempToken) {
      localStorage.setItem(TOKEN_KEY, tempToken);
      setToken(tempToken);
    }
    return { needsVerification: true, token: tempToken, email: res.email || email, ...res };
  }, [persistUser]);

  const verifyOtp = useCallback(async (tempToken, otp, email) => {
    const res = await authApi.verifyOtp({ tempToken, token: tempToken, otp, email });
    if (res.token) {
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);

      // Merge the freshly-verified user with anything already stored
      const stored = localStorage.getItem(PROFILE_KEY);
      const existing = stored ? JSON.parse(stored) : {};
      const merged = persistUser({ ...existing, ...res.user });
      // ── Sync verified profile to admin registry ──
      if (merged) upsertUser(merged);
      setLoading(false);
      return { user: merged };
    }
    throw new Error(res.message || 'Verification failed');
  }, [persistUser]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates) => {
    setUser((current) => {
      const next = current ? { ...current, ...updates } : { ...updates };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // ── Auto-logout after 15 minutes of inactivity ──
  const INACTIVITY_MS = 15 * 60 * 1000;
  const inactivityRef = useRef(null);
  const isAuthenticated = Boolean(token && user);

  useEffect(() => {
    if (!isAuthenticated) {
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
      return;
    }

    function resetTimer() {
      clearTimeout(inactivityRef.current);
      inactivityRef.current = setTimeout(() => {
        logout();
      }, INACTIVITY_MS);
    }

    const events = ['mousemove', 'mousedown', 'click', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(inactivityRef.current);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [isAuthenticated, logout]);

  const value = {
    token,
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    verifyOtp,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
