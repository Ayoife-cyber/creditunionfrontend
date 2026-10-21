import { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from './Sidebar.jsx';
import { MENU_GROUPS } from '../data/navConfig.js';
import MobileNav from './MobileNav.jsx';
import TopBar from './TopBar.jsx';
import { INITIAL_NOTIFICATIONS } from '../data/mockData.js';

export default function AppLayout({ title, children, onSidebarAction }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [hasUnread, setHasUnread] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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
    <div className="min-h-screen font-body" style={{ backgroundColor: '#0A1628', color: '#F1F5F9' }}>
      <div className="flex min-h-screen">
        <Sidebar
          activeSection={activeSection}
          onNavigate={handleNavigate}
          onLogout={logout}
          user={user}
          onSpecialAction={resolvedSpecialAction}
        />
        <main className="flex-1 min-w-0 lg:ml-72 pb-6 lg:pb-0">
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
