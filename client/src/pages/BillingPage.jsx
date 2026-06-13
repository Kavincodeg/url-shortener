import { useState, useEffect } from 'react';
import { CreditCard, Check, ShieldCheck, Zap, Sparkles, Loader2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const BillingPage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [stats, setStats] = useState({ linksCount: 0, clicksCount: 0 });
  const [cardForm, setCardForm] = useState({ name: '', number: '', expiry: '', cvv: '' });

  useEffect(() => {
    // Fetch stats to display quotas
    api.get('/urls?limit=100')
      .then(({ data }) => {
        const totalClicks = data.urls?.reduce((sum, u) => sum + (u.totalClicks || 0), 0) || 0;
        setStats({
          linksCount: data.urls?.length || 0,
          clicksCount: totalClicks
        });
      })
      .catch(() => {});
  }, []);

  const handleUpgrade = async (e) => {
    e.preventDefault();
    if (!cardForm.number || !cardForm.cvv) {
      return toast.error('Please enter payment details');
    }

    setLoading(true);
    try {
      // Simulate network request delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { data } = await api.post('/auth/upgrade');
      updateUser(data.user);
      toast.success('🎉 Welcome to Pro! Upgrade successful.');
      setShowPaymentModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment upgrade failed');
    } finally {
      setLoading(false);
    }
  };

  const isPro = user?.plan === 'pro';

  return (
    <AppLayout>
      <div className="page-enter" style={{ maxWidth: 850 }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Billing & Subscription</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manage your subscription details, usage quotas, and payment plans.
          </p>
        </div>

        {/* Plan Header Summary */}
        <div className="card animate-fade-in" style={{
          padding: '1.5rem',
          background: isPro ? 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' : 'white',
          border: isPro ? '1px solid #C7D2FE' : '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Current Level
              </span>
              {isPro && (
                <span className="badge badge-pro" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Sparkles size={10} /> Active
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {isPro ? 'Linko Pro Premium' : 'Linko Free Basic'}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {isPro ? 'Unlimited URL codes, advanced reporting & full priority support.' : 'Standard URL shortening capabilities with basic redirect tracking.'}
            </p>
          </div>
          <div>
            {!isPro ? (
              <button className="btn-primary" style={{ padding: '0.625rem 1.25rem' }} onClick={() => setShowPaymentModal(true)}>
                <Zap size={14} /> Upgrade to Pro
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3730A3', fontWeight: 700, fontSize: '0.9375rem' }}>
                <ShieldCheck size={20} color="var(--primary)" /> Premium Active
              </div>
            )}
          </div>
        </div>

        {/* Quotas & Usage Progress */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Monthly Resource Usage</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Links creation limit */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Short Links Created</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  <strong>{stats.linksCount}</strong> / {isPro ? '∞' : '15'}
                </span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${isPro ? Math.min((stats.linksCount / 100) * 100, 100) : Math.min((stats.linksCount / 15) * 100, 100)}%`,
                    background: stats.linksCount >= 15 && !isPro ? 'var(--danger)' : 'var(--primary)'
                  }} 
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                {isPro ? 'Unlimited active links available.' : 'Up to 15 short codes allowed on the Free plan.'}
              </p>
            </div>

            {/* Click limit */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Click Analytics Capacity</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  <strong>{stats.clicksCount}</strong> / {isPro ? '∞' : '1000'}
                </span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${isPro ? Math.min((stats.clicksCount / 10000) * 100, 100) : Math.min((stats.clicksCount / 1000) * 100, 100)}%`,
                    background: stats.clicksCount >= 1000 && !isPro ? 'var(--danger)' : 'var(--primary)'
                  }} 
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                {isPro ? 'Unlimited clicks are tracked.' : 'First 1,000 redirections are fully parsed per month.'}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Free Plan Card */}
          <div className="card" style={{ padding: '1.75rem', border: '1px solid var(--border)', position: 'relative' }}>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Free Core</h4>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.75rem 0' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800 }}>$0</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>/ forever</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Essential core capabilities for link redirects and basic stats.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={14} color="#10B981" /> 15 Short Links</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={14} color="#10B981" /> 1,000 clicks/mo analytics</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={14} color="#10B981" /> Basic QR code PNG downloads</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={14} color="#10B981" /> Bulk CSV shortener</li>
            </ul>
            <button className="btn-secondary" style={{ width: '100%' }} disabled={!isPro}>
              {!isPro ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>

          {/* Pro Plan Card */}
          <div className="card" style={{ 
            padding: '1.75rem', 
            border: '2px solid var(--primary)', 
            boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.1), 0 8px 10px -6px rgba(79, 70, 229, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: 12, right: -32,
              background: 'var(--primary)', color: 'white',
              fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
              padding: '0.25rem 2.5rem', transform: 'rotate(45deg)'
            }}>
              Popular
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Pro Elite <Sparkles size={16} color="var(--primary)" />
            </h4>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.75rem 0' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800 }}>$9</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>/ month</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Advanced analytics suite, branded options, and high limits.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={14} color="#10B981" /> <strong>Unlimited</strong> Short Links</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={14} color="#10B981" /> <strong>Unlimited</strong> clicks & analytics</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={14} color="#10B981" /> QR code SVG & PNG downloads</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={14} color="#10B981" /> Advanced password protection on links</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={14} color="#10B981" /> Priority Email Support</li>
            </ul>
            <button 
              className="btn-primary" 
              style={{ width: '100%', background: isPro ? 'var(--text-muted)' : 'var(--primary)' }} 
              disabled={isPro}
              onClick={() => setShowPaymentModal(true)}
            >
              {isPro ? 'Active Premium' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>

        {/* Invoice List */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Invoice History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Billing Date</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Description</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {isPro && (
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.875rem 0.5rem' }}>{new Date().toLocaleDateString()}</td>
                    <td style={{ padding: '0.875rem 0.5rem', fontWeight: 500 }}>Linko Pro Subscription — Monthly</td>
                    <td style={{ padding: '0.875rem 0.5rem' }}>$9.00</td>
                    <td style={{ padding: '0.875rem 0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: 4, background: 'var(--success-light)', color: '#065F46', fontWeight: 600 }}>Paid</span>
                    </td>
                  </tr>
                )}
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.875rem 0.5rem' }}>{new Date(Date.now() - 3600000 * 24).toLocaleDateString()}</td>
                  <td style={{ padding: '0.875rem 0.5rem' }}>Free Plan Account Creation</td>
                  <td style={{ padding: '0.875rem 0.5rem' }}>$0.00</td>
                  <td style={{ padding: '0.875rem 0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: 4, background: 'var(--bg-secondary)', color: '#475569', fontWeight: 600 }}>Active</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Upgrade Modal */}
        {showPaymentModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <div className="card animate-scale-in" style={{ maxWidth: 420, width: '100%', padding: '1.75rem', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Billing Information</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Secure payment processing sandbox</p>
                </div>
              </div>

              <form onSubmit={handleUpgrade} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Cardholder Name</label>
                  <input 
                    className="input-field" 
                    placeholder="John Doe" 
                    required 
                    value={cardForm.name}
                    onChange={e => setCardForm({ ...cardForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Card Number</label>
                  <input 
                    className="input-field" 
                    placeholder="4111 2222 3333 4444" 
                    maxLength={19} 
                    required 
                    value={cardForm.number}
                    onChange={e => setCardForm({ ...cardForm, number: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Expiry Date</label>
                    <input 
                      className="input-field" 
                      placeholder="MM/YY" 
                      maxLength={5} 
                      required 
                      value={cardForm.expiry}
                      onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>CVV</label>
                    <input 
                      className="input-field" 
                      type="password"
                      placeholder="•••" 
                      maxLength={3} 
                      required 
                      value={cardForm.cvv}
                      onChange={e => setCardForm({ ...cardForm, cvv: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <ShieldCheck size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                  <span>This is a secure checkout simulation. Upgrading immediately provides Pro metrics capacity.</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowPaymentModal(false)} disabled={loading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1.5 }} disabled={loading}>
                    {loading ? (
                      <><Loader2 size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> Processing...</>
                    ) : (
                      'Pay & Upgrade'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
};

export default BillingPage;
