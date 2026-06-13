import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Link2, BarChart3, QrCode, Upload,
  Settings, CreditCard, User, LogOut, Zap
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/links', icon: Link2, label: 'My Links' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/qr-codes', icon: QrCode, label: 'QR Codes' },
  { to: '/bulk', icon: Upload, label: 'Bulk Shorten' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/billing', icon: CreditCard, label: 'Billing' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '1.25rem 1rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Linko</span>
        </NavLink>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info + logout at bottom */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem', borderRadius: 8, marginBottom: '0.5rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0
            }}>
              {user.profileImage
                ? <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : user.name?.charAt(0).toUpperCase()
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <span className={`badge ${user.plan === 'pro' ? 'badge-pro' : 'badge-free'}`}>
                {user.plan === 'pro' ? 'Pro' : 'Free Plan'}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-nav-item"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
