import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Zap, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpStep, setOtpStep] = useState('idle'); // 'idle' | 'sending' | 'input' | 'verifying'
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  const { login, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'oauth_failed') {
      toast.error('Authentication failed. Please try again.');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const backendUrl = apiUrl.replace(/\/api$/, '');
    window.location.href = `${backendUrl}/api/auth/${provider}`;
  };

  // --- OTP handlers ---
  const handleSendOtp = async () => {
    if (!otpEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpEmail)) {
      return toast.error('Please enter a valid email address');
    }
    setOtpStep('sending');
    try {
      const { data } = await api.post('/auth/send-otp', { email: otpEmail });
      if (data.action === 'direct_login') {
        // Returning verified user — log in directly
        loginWithToken(data.token, data.user);
        toast.success(`Welcome back, ${data.user.name}! 👋`);
        navigate('/dashboard');
      } else {
        // New user — show OTP input
        setOtpStep('input');
        setCountdown(60);
        toast.success('Verification code sent! Check your inbox.');
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send code');
      setOtpStep('idle');
    }
  };

  const handleOtpDigit = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) return toast.error('Please enter all 6 digits');
    setOtpStep('verifying');
    try {
      const { data } = await api.post('/auth/verify-otp', { email: otpEmail, code });
      loginWithToken(data.token, data.user);
      toast.success(`Welcome to Linko, ${data.user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
      setOtpStep('input');
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
  };

  const resetOtp = () => {
    setOtpStep('idle');
    setOtpDigits(['', '', '', '', '', '']);
    setCountdown(0);
  };

  const isOtpLoading = otpStep === 'sending' || otpStep === 'verifying';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #EFF6FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Linko</span>
          </Link>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.375rem' }}>Welcome back! 👋</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Login to your account to continue</p>
          </div>

          {/* Google button */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8125rem', padding: '0.6rem 0.75rem' }}
              onClick={() => handleSocialLogin('google')}>
              <span>🟢</span> Continue with Google
            </button>
          </div>

          <div className="divider-text" style={{ marginBottom: '1.25rem' }}>or</div>

          {/* Email OTP section */}
          <div style={{ marginBottom: '1.25rem', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Continue with Email</span>
              {otpStep !== 'idle' && (
                <button onClick={resetOtp} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                  <ArrowLeft size={12} /> Back
                </button>
              )}
            </div>

            <div style={{ padding: '1rem' }}>
              {/* Step 1: Email input */}
              {(otpStep === 'idle' || otpStep === 'sending') && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    className="input-field"
                    type="email"
                    placeholder="Enter your email"
                    value={otpEmail}
                    onChange={e => setOtpEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                    style={{ flex: 1, height: 38, fontSize: '0.875rem' }}
                  />
                  <button
                    className="btn-primary"
                    onClick={handleSendOtp}
                    disabled={isOtpLoading}
                    style={{ height: 38, padding: '0 1rem', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}
                  >
                    {otpStep === 'sending' ? <Loader2 size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> : 'Send Code'}
                  </button>
                </div>
              )}

              {/* Step 2: OTP input */}
              {(otpStep === 'input' || otpStep === 'verifying') && (
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.875rem', lineHeight: 1.5 }}>
                    Code sent to <strong style={{ color: 'var(--text-primary)' }}>{otpEmail}</strong>
                    {' '}— first time only. Future logins are instant.
                  </p>

                  {/* 6-digit boxes */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }} onPaste={handleOtpPaste}>
                    {otpDigits.map((d, i) => (
                      <input
                        key={i}
                        ref={el => otpRefs.current[i] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={e => handleOtpDigit(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        style={{
                          width: '100%', height: 48, textAlign: 'center', fontSize: '1.25rem', fontWeight: 700,
                          border: `2px solid ${d ? 'var(--primary)' : 'var(--border)'}`,
                          borderRadius: 8, outline: 'none', background: 'white',
                          color: 'var(--text-primary)', transition: 'border-color 0.15s',
                          fontFamily: 'monospace'
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      className="btn-primary"
                      onClick={handleVerifyOtp}
                      disabled={isOtpLoading || otpDigits.join('').length < 6}
                      style={{ flex: 1, height: 38, fontSize: '0.875rem', justifyContent: 'center', gap: '0.375rem' }}
                    >
                      {otpStep === 'verifying'
                        ? <><Loader2 size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> Verifying...</>
                        : <><ShieldCheck size={14} /> Verify & Login</>}
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={handleSendOtp}
                      disabled={countdown > 0 || isOtpLoading}
                      style={{ height: 38, padding: '0 0.875rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    >
                      {countdown > 0 ? `Resend (${countdown}s)` : 'Resend'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="divider-text" style={{ marginBottom: '1.25rem' }}>or sign in with password</div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Email address</label>
              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Password</label>
                <a href="#" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: '2.5rem' }}
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', height: 42, fontSize: '0.9375rem' }}>
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 0.6s linear infinite' }} /> Logging in...</> : 'Login'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign up</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoginPage;
