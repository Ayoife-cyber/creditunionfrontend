import { useCallback, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from './Sidebar.jsx';
import { MENU_GROUPS } from '../data/navConfig.js';
import MobileNav from './MobileNav.jsx';
import TopBar from './TopBar.jsx';
import { authApi } from '../api/client.js';

export default function AppLayout({ title, children, onSidebarAction }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUserNotifications() {
      // 1. Successful Sign-in Notification
      const signInNotification = {
        id: 'sign-in-success',
        icon: '🔐',
        iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        color: '#10B981',
        title: 'Successful Sign-In',
        body: `Signed in as ${user?.fullName || 'Account Holder'}. Session active.`,
        time: 'Just now',
        type: 'auth',
      };

      try {
        const txs = await authApi.getMyTransactions();
        if (cancelled) return;

        const txNotifications = [];
        if (Array.isArray(txs) && txs.length > 0) {
          // Pull about 3 notifications from the user's latest transaction IDs
          const latestThree = txs.slice(0, 3);
          latestThree.forEach((tx) => {
            const rawId = String(tx.id || tx._id || '');
            const shortId = rawId
              ? (rawId.length > 8 ? rawId.slice(-8).toUpperCase() : rawId.toUpperCase())
              : 'TX-ID';

            const isWithdrawal = tx.type === 'withdrawal' || String(tx.amount || '').startsWith('-');
            const isCrypto = tx.type === 'crypto';
            const isPending = tx.status === 'pending';

            let icon = '💰';
            let iconPath = 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z';
            let color = '#10B981';

            if (isCrypto) {
              icon = '₿';
              iconPath = 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
              color = '#F59E0B';
            } else if (isWithdrawal) {
              icon = '↗';
              iconPath = 'M5 10l7-7m0 0l7 7M12 3v18';
              color = '#A855F7';
            } else if (isPending) {
              icon = '⚠️';
              iconPath = 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
              color = '#F97316';
            }

            const statusLabel = tx.status
              ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1)
              : 'Completed';

            txNotifications.push({
              id: tx.id || tx._id,
              txId: `#${shortId}`,
              fullTxId: rawId,
              icon,
              iconPath,
              color: tx.color || color,
              title: `${tx.label || 'Transaction'} (${statusLabel})`,
              body: `${tx.amount || '$0.00'}`,
              time: tx.date || 'Recent',
              type: 'transaction',
            });
          });
        }

        setNotifications([signInNotification, ...txNotifications]);
      } catch {
        if (!cancelled) {
          setNotifications([signInNotification]);
        }
      }
    }

    if (user) {
      loadUserNotifications();
    }
    return () => { cancelled = true; };
  }, [user?.email, user?.accountNumber]);

  // Derive active section from the actual current URL (null when no menu item matches)
  let activeSection = null;
  MENU_GROUPS.forEach(group => {
    group.items.forEach(item => {
      if (item.path === location.pathname) activeSection = item.key;
    });
  });

  const handleNavigate = (path) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  // Default fallback for special actions when the page doesn't provide its own handler.
  // Navigates back to dashboard so the user lands in a place where modals are available.
  const defaultSidebarAction = useCallback((item) => {
    navigate('/dashboard');
    setMobileDrawerOpen(false);
  }, [navigate]);

  const resolvedSpecialAction = onSidebarAction || defaultSidebarAction;

  return (
    <div className="app-shell min-h-[100dvh] font-body overflow-x-hidden" style={{ backgroundColor: 'var(--bg)', color: 'var(--text-1)' }}>
      <div className="flex min-h-[100dvh]">
        <Sidebar
          activeSection={activeSection}
          onNavigate={handleNavigate}
          onLogout={logout}
          user={user}
          onSpecialAction={resolvedSpecialAction}
        />
        <main className="flex-1 min-w-0 lg:ml-72 pb-6 lg:pb-0 overflow-x-hidden">
          <TopBar
            title={title}
            user={user}
            notifications={notifications}
            hasUnread={hasUnread}
            onOpenNotifications={() => setHasUnread(false)}
            onClearNotifications={() => setNotifications([])}
            onOpenDrawer={() => setMobileDrawerOpen(true)}
          />
          {children}
        </main>
      </div>

      <MobileNav
        activeSection={activeSection}
        onNavigate={handleNavigate}
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        user={user}
        onLogout={logout}
        onSpecialAction={resolvedSpecialAction}
      />
    </div>
  );
}
