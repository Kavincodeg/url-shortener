import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TopNavbar = ({ onCreateLink }) => {
  const { user, logout } = useAuth();
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
      <div style={{ position: 'relative', width: 320 }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Create button */}
        {onCreateLink && (
          <button className="btn-primary" onClick={onCreateLink} style={{ height: 36, fontSize: '0.8125rem' }}>
            + Create New Link
          </button>
        )}

        {/* Notifications */}
        <button className="icon-btn" style={{ position: 'relative' }}>
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 7, height: 7, background: 'var(--danger)',
            borderRadius: '50%', border: '1.5px solid white'
          }} />
        </button>

        {/* User avatar dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              border: '1px solid var(--border)', borderRadius: 8,
              padding: '0.25rem 0.625rem', background: 'white', cursor: 'pointer',
              transition: 'all 0.15s ease', height: 36
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
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
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>Free Plan</div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {showDropdown && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowDropdown(false)} />
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                background: 'white', border: '1px solid var(--border)',
                borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                minWidth: 180, zIndex: 50, overflow: 'hidden',
                animation: 'fadeIn 0.15s ease'
              }}>
                <div style={{ padding: '0.5rem' }}>
                  <button onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0.625rem', borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                    <User size={15} /> Profile
                  </button>
                  <button onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0.625rem', borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                    <Settings size={15} /> Settings
                  </button>
                  <div style={{ height: 1, background: 'var(--border)', margin: '0.25rem 0' }} />
                  <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0.625rem', borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--danger)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
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
