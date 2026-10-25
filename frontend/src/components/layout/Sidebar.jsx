import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  BookMarked,
  Heart,
  History,
  Star,
  User,
  ShieldCheck,
  Sun,
  Moon,
  LogOut,
  BookOpen,
  X
} from 'lucide-react';
import { toggleTheme, closeMobileSidebar } from '../../features/ui/uiSlice';
import { logout } from '../../features/auth/authSlice';
import './Sidebar.css';

export const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const theme = useSelector((state) => state.ui.theme);
  const mobileSidebarOpen = useSelector((state) => state.ui.mobileSidebarOpen);
  const user = useSelector((state) => state.auth.user);
  const borrowings = useSelector((state) => state.borrowings.items);
  const wishlist = useSelector((state) => state.wishlist.bookIds);

  const activeBorrowingsCount = borrowings.filter(
    (b) => b.status === 'active' || b.status === 'due-soon'
  ).length;

  const handleLinkClick = () => {
    dispatch(closeMobileSidebar());
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(closeMobileSidebar());
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <>
      <div
        className={`sidebar-overlay ${mobileSidebarOpen ? 'active' : ''}`}
        onClick={() => dispatch(closeMobileSidebar())}
      />

      <aside className={`sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand" onClick={handleLinkClick}>
            <div className="sidebar-brand-icon">
              <BookOpen size={22} />
            </div>
            <div>
              <span className="sidebar-brand-text">BookNest</span>
              <span className="sidebar-brand-tag">Library Intelligence</span>
            </div>
          </Link>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => dispatch(closeMobileSidebar())}
            style={{
              display: mobileSidebarOpen ? 'block' : 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text-sidebar-muted)',
              cursor: 'pointer'
            }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-section-title">Catalogue & Discovery</div>

          <NavLink to="/" end className="sidebar-link" onClick={handleLinkClick}>
            <LayoutDashboard size={18} className="sidebar-link-icon" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/books" className="sidebar-link" onClick={handleLinkClick}>
            <Compass size={18} className="sidebar-link-icon" />
            <span>Explore Books</span>
          </NavLink>

          <NavLink to="/recommendations" className="sidebar-link" onClick={handleLinkClick}>
            <Sparkles size={18} className="sidebar-link-icon" />
            <span>Recommendations</span>
            <span className="sidebar-link-badge" style={{ backgroundColor: 'var(--color-purple)' }}>
              AI
            </span>
          </NavLink>

          <div className="sidebar-nav-section-title">My Activity</div>

          <NavLink to="/borrowings" className="sidebar-link" onClick={handleLinkClick}>
            <BookMarked size={18} className="sidebar-link-icon" />
            <span>My Borrowings</span>
            {activeBorrowingsCount > 0 && (
              <span className="sidebar-link-badge">{activeBorrowingsCount}</span>
            )}
          </NavLink>

          <NavLink to="/wishlist" className="sidebar-link" onClick={handleLinkClick}>
            <Heart size={18} className="sidebar-link-icon" />
            <span>Wishlist</span>
            {wishlist.length > 0 && (
              <span className="sidebar-link-badge">{wishlist.length}</span>
            )}
          </NavLink>

          <NavLink to="/history" className="sidebar-link" onClick={handleLinkClick}>
            <History size={18} className="sidebar-link-icon" />
            <span>Reading History</span>
          </NavLink>

          <NavLink to="/reviews" className="sidebar-link" onClick={handleLinkClick}>
            <Star size={18} className="sidebar-link-icon" />
            <span>Reviews & Ratings</span>
          </NavLink>

          <div className="sidebar-nav-section-title">Account & Administration</div>

          <NavLink to="/profile" className="sidebar-link" onClick={handleLinkClick}>
            <User size={18} className="sidebar-link-icon" />
            <span>My Profile</span>
          </NavLink>

          {/* Admin link visible for admin users */}
          {isAdmin && (
            <NavLink to="/admin" className="sidebar-link" onClick={handleLinkClick}>
              <ShieldCheck size={18} className="sidebar-link-icon" />
              <span>Admin Dashboard</span>
              <span className="sidebar-link-badge" style={{ backgroundColor: '#2563eb' }}>
                Staff
              </span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-theme-toggle"
            onClick={() => dispatch(toggleTheme())}
            aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            <span>Appearance</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
              <span style={{ textTransform: 'capitalize' }}>{theme}</span>
            </div>
          </button>

          {user && (
            <div className="sidebar-user-card">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="sidebar-user-avatar"
              />
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.name}</div>
                <div className="sidebar-user-role">{user.role} Member</div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Log Out"
                aria-label="Log Out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-sidebar-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
