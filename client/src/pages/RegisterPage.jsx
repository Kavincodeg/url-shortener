import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Zap, Check, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, loginWithToken } = useAuth();
  const navigate = useNavigate();

  // OTP state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpStep, setOtpStep] = useState('idle'); // 'idle' | 'sending' | 'input' | 'verifying'
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const pwColors = ['', '#EF4444', '#F59E0B', '#10B981'];
  const pwLabels = ['', 'Weak', 'Good', 'Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (!agreed) return toast.error('Please agree to the terms');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to Linko 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const backendUrl = apiUrl.replace(/\/api$/, '');
    window.location.href = `${backendUrl}/api/auth/${provider.toLowerCase()}`;
  };

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!otpEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpEmail)) {
      return toast.error('Please enter a valid email address');
    }
    setOtpStep('sending');
    try {
      const { data } = await api.post('/auth/send-otp', { email: otpEmail });
      if (data.action === 'direct_login') {
        loginWithToken(data.token, data.user);
        toast.success(`Welcome back, ${data.user.name}! 👋`);
        navigate('/dashboard');
      } else {
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
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 440 }}>
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
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.375rem' }}>Create your account 🚀</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Start shortening and tracking your links</p>
          </div>

          {/* Google button */}
          <div style={{ marginBottom: '1rem' }}>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem', padding: '0.6rem' }}
              onClick={() => handleSocialLogin('Google')}>
              🟢 Continue with Google
            </button>
          </div>

          {/* Email OTP section */}
          <div style={{ marginBottom: '1rem', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={14} color="var(--primary)" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Quick Sign up with Email</span>
              {otpStep !== 'idle' && (
                <button onClick={resetOtp} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                  <ArrowLeft size={12} /> Back
                </button>
              )}
            </div>
            <div style={{ padding: '1rem' }}>
              {(otpStep === 'idle' || otpStep === 'sending') && (
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.625rem' }}>No password needed — verify your email once, log in instantly forever.</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input className="input-field" type="email" placeholder="Enter your email" value={otpEmail}
                      onChange={e => setOtpEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                      style={{ flex: 1, height: 38, fontSize: '0.875rem' }} />
                    <button className="btn-primary" onClick={handleSendOtp} disabled={isOtpLoading}
                      style={{ height: 38, padding: '0 1rem', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {otpStep === 'sending' ? <Loader2 size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> : 'Send Code'}
                    </button>
                  </div>
                </div>
              )}
              {(otpStep === 'input' || otpStep === 'verifying') && (
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.875rem', lineHeight: 1.5 }}>
                    Code sent to <strong style={{ color: 'var(--text-primary)' }}>{otpEmail}</strong> — verify once, login forever.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }} onPaste={handleOtpPaste}>
                    {otpDigits.map((d, i) => (
                      <input key={i} ref={el => otpRefs.current[i] = el} type="text" inputMode="numeric" maxLength={1} value={d}
                        onChange={e => handleOtpDigit(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)}
                        style={{ width: '100%', height: 44, textAlign: 'center', fontSize: '1.125rem', fontWeight: 700,
                          border: `2px solid ${d ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 8, outline: 'none',
                          background: 'white', color: 'var(--text-primary)', transition: 'border-color 0.15s', fontFamily: 'monospace' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-primary" onClick={handleVerifyOtp} disabled={isOtpLoading || otpDigits.join('').length < 6}
                      style={{ flex: 1, height: 38, fontSize: '0.875rem', justifyContent: 'center', gap: '0.375rem' }}>
                      {otpStep === 'verifying' ? <><Loader2 size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> Verifying...</> : <><ShieldCheck size={14} /> Verify & Sign up</>}
                    </button>
                    <button className="btn-secondary" onClick={handleSendOtp} disabled={countdown > 0 || isOtpLoading}
                      style={{ height: 38, padding: '0 0.875rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {countdown > 0 ? `Resend (${countdown}s)` : 'Resend'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Full name</label>
              <input className="input-field" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Email address</label>
              <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Create a strong password"
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
              {form.password && (
                <div style={{ marginTop: '0.375rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwStrength ? pwColors[pwStrength] : '#E2E8F0', transition: 'background 0.2s' }} />
                  ))}
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: pwColors[pwStrength], marginLeft: 4 }}>{pwLabels[pwStrength]}</span>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Confirm password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type="password"
                  placeholder="Confirm your password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  style={{ paddingRight: '2.5rem', ...(form.confirm && { borderColor: form.confirm === form.password ? 'var(--success)' : 'var(--danger)' }) }}
                  required
                />
                {form.confirm && form.confirm === form.password && (
                  <Check size={15} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--success)' }} />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ accentColor: 'var(--primary)', marginTop: 2, cursor: 'pointer' }} />
              <label htmlFor="terms" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.5 }}>
                I agree to the <a href="#" style={{ color: 'var(--primary)', fontWeight: 500 }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--primary)', fontWeight: 500 }}>Privacy Policy</a>
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', height: 42, fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 0.6s linear infinite' }} /> Creating account...</> : 'Sign up'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default RegisterPage;
