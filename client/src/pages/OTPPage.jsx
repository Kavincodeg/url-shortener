import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Loader2, Zap, Mail, RotateCcw, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RESEND_COOLDOWN = 60; // seconds

const OTPPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useAuth();

  const { name, email, password } = location.state || {};

  // Guard: if no state, redirect back to register
  useEffect(() => {
    if (!name || !email || !password) navigate('/register', { replace: true });
  }, [name, email, password, navigate]);

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef([]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const otp = digits.join('');

  const handleDigitChange = (idx, val) => {
    // Allow only single digit
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    // Auto-advance
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...digits];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = async () => {
    if (otp.length < 6) return toast.error('Please enter all 6 digits');
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      toast.success('Email verified! Welcome to Linko 🎉');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Incorrect code. Please try again.';
      toast.error(msg);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      await sendOtp(name, email, password);
      toast.success('New code sent! Check your inbox.');
      setCooldown(RESEND_COOLDOWN);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend. Try again.');
    } finally {
      setResending(false);
    }
  };

  // Focus first input on mount
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.max(1, b.length)) + c)
    : '';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-body)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo.png" alt="Linko" style={{ height: 36, objectFit: 'contain' }} />
          </Link>
        </div>

        <div className="card" style={{ padding: '2rem' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: 64, height: 64, margin: '0 auto 1rem',
              background: 'var(--primary-light)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--primary)',
            }}>
              <Mail size={28} color="var(--primary)" />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.375rem' }}>Check your email</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              We sent a 6-digit verification code to<br />
              <strong style={{ color: 'var(--text-primary)' }}>{maskedEmail}</strong>
            </p>
          </div>

          {/* Digit inputs */}
          <div
            style={{
              display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem',
              animation: shake ? 'shake 0.5s ease' : 'none',
            }}
            onPaste={handlePaste}
          >
            {digits.map((d, i) => (
              <input
                key={i}
                id={`otp-digit-${i}`}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                style={{
                  width: 48, height: 56,
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  fontFamily: "'Courier New', monospace",
                  border: `2px solid ${d ? '#4F46E5' : 'var(--border)'}`,
                  borderRadius: 10,
                  background: d ? '#EEF2FF' : 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                  boxShadow: d ? '0 0 0 3px rgba(79,70,229,0.12)' : 'none',
                  caretColor: '#4F46E5',
                }}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>

          {/* Verify button */}
          <button
            id="otp-verify-btn"
            className="btn-primary"
            onClick={handleVerify}
            disabled={loading || otp.length < 6}
            style={{ width: '100%', justifyContent: 'center', height: 44, fontSize: '0.9375rem', marginBottom: '1rem' }}
          >
            {loading
              ? <><Loader2 size={16} style={{ animation: 'spin 0.6s linear infinite' }} /> Verifying...</>
              : <><ShieldCheck size={16} /> Verify & Create Account</>}
          </button>

          {/* Resend */}
          <div style={{ textAlign: 'center' }}>
            {cooldown > 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Resend code in <strong style={{ color: 'var(--text-primary)' }}>{cooldown}s</strong>
              </p>
            ) : (
              <button
                id="otp-resend-btn"
                onClick={handleResend}
                disabled={resending}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--primary)', fontWeight: 600, fontSize: '0.8125rem',
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.25rem 0.5rem', borderRadius: 6,
                  transition: 'opacity 0.15s',
                  opacity: resending ? 0.6 : 1,
                }}
              >
                {resending
                  ? <><Loader2 size={13} style={{ animation: 'spin 0.6s linear infinite' }} /> Sending...</>
                  : <><RotateCcw size={13} /> Resend code</>}
              </button>
            )}
          </div>

          {/* Back link */}
          <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <Link
              to="/register"
              style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <ArrowLeft size={13} /> Back to registration
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Didn't get the email? Check your spam folder.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default OTPPage;
