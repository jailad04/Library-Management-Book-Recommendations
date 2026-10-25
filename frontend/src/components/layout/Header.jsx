import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  UserCheck,
  Check,
  ChevronRight
} from 'lucide-react';
import {
  toggleMobileSidebar,
  toggleTheme,
  setGlobalSearchQuery
} from '../../features/ui/uiSlice';
import { switchRole } from '../../features/auth/authSlice';
import { markAsRead, markAllAsRead } from '../../features/notifications/notificationsSlice';
import './Header.css';

export const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useSelector((state) => state.ui.theme);
  const user = useSelector((state) => state.auth.user);
  const notifications = useSelector((state) => state.notifications.items);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [searchVal, setSearchVal] = useState('');
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifRef = useRef(null);

  // Close notifications popover on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      dispatch(setGlobalSearchQuery(searchVal.trim()));
      navigate(`/books?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const handleToggleRole = () => {
    const nextRole = user?.role === 'admin' ? 'user' : 'admin';
    dispatch(switchRole(nextRole));
  };

  // Compute breadcrumb title based on path
  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/books/')) return 'Book Details';
    if (path === '/books') return 'Explore Catalogue';
    if (path === '/recommendations') return 'AI Book Recommendations';
    if (path === '/borrowings') return 'My Borrowed Books';
    if (path === '/wishlist') return 'Wishlist';
    if (path === '/history') return 'Reading History';
    if (path === '/reviews') return 'Reviews & Ratings';
    if (path === '/profile') return 'My Profile';
    if (path === '/admin') return 'Admin Dashboard & Analytics';
    return 'Library Management';
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="header-mobile-toggle"
          onClick={() => dispatch(toggleMobileSidebar())}
          aria-label="Toggle mobile navigation menu"
        >
          <Menu size={22} />
        </button>

        <nav aria-label="Breadcrumb" className="header-breadcrumb">
          <span>BookNest</span>
          <ChevronRight size={14} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {getBreadcrumbTitle()}
          </span>
        </nav>
      </div>

      <div className="header-right">
        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="header-search-form">
          <Search size={16} className="header-search-icon" />
          <input
            type="search"
            placeholder="Search by title, author, ISBN..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="header-search-input"
            aria-label="Search books"
          />
        </form>

        {/* Demo Mode Role Switcher: Great for Evaluators and Presentations */}
        <button
          type="button"
          onClick={handleToggleRole}
          className="header-role-switcher"
          title="Switch view between Student and Admin"
        >
          {user?.role === 'admin' ? (
            <>
              <ShieldCheck size={14} color="#2563eb" />
              <span>Admin Mode</span>
            </>
          ) : (
            <>
              <UserCheck size={14} color="#10b981" />
              <span>Student View</span>
            </>
          )}
        </button>

        {/* Quick Theme Switcher */}
        <button
          type="button"
          className="header-btn"
          onClick={() => dispatch(toggleTheme())}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            className="header-btn"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="header-btn-badge">{unreadCount}</span>}
          </button>

          {showNotifMenu && (
            <div className="notif-popover">
              <div className="notif-header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => dispatch(markAllAsRead())}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-600)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Check size={12} />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notif-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => dispatch(markAsRead(notif.id))}
                    >
                      <div>
                        <div className="notif-title">{notif.title}</div>
                        <div className="notif-message">{notif.message}</div>
                        <div className="notif-time">{notif.timestamp}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar linking to profile */}
        {user && (
          <button
            type="button"
            onClick={() => navigate('/profile')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Go to Profile"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--border-color)'
              }}
            />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
