import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const OAuthSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        loginWithToken(token, user);
        toast.success('Successfully logged in! Welcome to Linko 🎉');
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Failed to parse OAuth user info:', err);
        toast.error('Authentication failed. Please try again.');
        navigate('/login', { replace: true });
      }
    } else {
      toast.error('Authentication failed. Missing token or user details.');
      navigate('/login', { replace: true });
    }
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #EFF6FF 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 360, padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Completing login</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>We are securely signing you in...</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OAuthSuccessPage;
