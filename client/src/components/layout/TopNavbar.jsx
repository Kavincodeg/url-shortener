import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronDown, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const TopNavbar = ({ onCreateLink }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      {/* Search */}
      <div style={{ position: 'relative', width: 300 }}>
        <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="input-field"
          style={{ paddingLeft: '2rem', height: 36, fontSize: '0.8125rem' }}
          placeholder="Search short links..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
        />
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        {/* Create button */}
        {onCreateLink && (
          <button className="btn-primary" onClick={onCreateLink} style={{ height: 36, fontSize: '0.8125rem' }}>
            + Create New Link
          </button>
        )}

        {/* Dark/Light mode toggle */}
        <button
          id="theme-toggle-btn"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light'
            ? <Moon size={16} />
            : <Sun size={16} />
          }
        </button>

        {/* Notifications */}
        <button className="icon-btn" style={{ position: 'relative', width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <Bell size={16} />
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7, background: 'var(--danger)',
            borderRadius: '50%', border: '1.5px solid var(--bg-primary)'
          }} />
        </button>

        {/* User avatar dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              border: '1px solid var(--border)', borderRadius: 8,
              padding: '0.25rem 0.625rem',
              background: 'var(--bg-secondary)',
              cursor: 'pointer', transition: 'all 0.15s ease', height: 36,
              color: 'var(--text-primary)',
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0, overflow: 'hidden'
            }}>
              {user?.profileImage
                ? <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : user?.name?.charAt(0).toUpperCase()
              }
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user?.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.2, textTransform: 'capitalize' }}>{user?.plan || 'Free'} Plan</div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showDropdown && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowDropdown(false)} />
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                borderRadius: 10, boxShadow: 'var(--modal-shadow)',
                minWidth: 180, zIndex: 50, overflow: 'hidden',
                animation: 'fadeIn 0.15s ease'
              }}>
                <div style={{ padding: '0.5rem' }}>
                  {[
                    { icon: User, label: 'Profile', action: () => { navigate('/profile'); setShowDropdown(false); } },
                    { icon: Settings, label: 'Settings', action: () => { navigate('/settings'); setShowDropdown(false); } },
                  ].map(({ icon: Icon, label, action }) => (
                    <button key={label} onClick={action}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0.625rem', borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                      <Icon size={15} /> {label}
                    </button>
                  ))}
                  <div style={{ height: 1, background: 'var(--border)', margin: '0.25rem 0' }} />
                  <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0.625rem', borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--danger)', fontFamily: 'Inter, sans-serif' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--danger-light)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
