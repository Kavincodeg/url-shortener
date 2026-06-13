import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, TrendingUp, MousePointerClick, Link2, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { formatShortUrl } from '../lib/urlHelper';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsOverviewPage = () => {
  const navigate = useNavigate();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUrls = useCallback(async () => {
    try {
      const { data } = await api.get('/urls?limit=50&page=1');
      setUrls(data.urls || []);
    } catch {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  const totalClicks = urls.reduce((s, u) => s + (u.totalClicks || 0), 0);
  const totalLinks = urls.length;
  const activeLinks = urls.filter(u => u.isActive).length;
  const topLink = [...urls].sort((a, b) => (b.totalClicks || 0) - (a.totalClicks || 0))[0];

  // Bar chart data — top 6 links by clicks
  const chartData = [...urls]
    .sort((a, b) => (b.totalClicks || 0) - (a.totalClicks || 0))
    .slice(0, 6)
    .map(u => ({
      name: formatShortUrl(u.shortUrl).replace(/^https?:\/\/[^/]+\//, ''),
      clicks: u.totalClicks || 0,
    }));

  return (
    <AppLayout>
      <div className="page-enter">
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Click on any link to see detailed analytics — devices, locations, referrers and more.
          </p>
        </div>

        {/* KPI Summary Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { icon: Link2, label: 'Total Links', value: totalLinks, iconBg: '#EEF2FF', iconColor: '#4F46E5' },
            { icon: MousePointerClick, label: 'Total Clicks', value: totalClicks.toLocaleString(), iconBg: '#D1FAE5', iconColor: '#059669' },
            { icon: TrendingUp, label: 'Active Links', value: activeLinks, iconBg: '#FEF3C7', iconColor: '#D97706' },
          ].map(({ icon: Icon, label, value, iconBg, iconColor }) => (
            <div key={label} className="kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={iconColor} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}
          </div>
        ) : urls.length === 0 ? (
          <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
            <BarChart2 size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No links yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Create your first short link to start seeing analytics here.
            </p>
            <button className="btn-primary" onClick={() => navigate('/links')}>
              Create a Link
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>

            {/* Left — Links list */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>All Links — Click to view analytics</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {urls.map((url, idx) => {
                  const pct = totalClicks > 0 ? Math.round((url.totalClicks || 0) / totalClicks * 100) : 0;
                  return (
                    <div
                      key={url._id}
                      onClick={() => navigate(`/analytics/${url._id}`)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.875rem 1.25rem',
                        borderBottom: idx < urls.length - 1 ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Rank */}
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: idx === 0 ? 'linear-gradient(135deg,#4F46E5,#7C3AED)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: idx === 0 ? 'white' : 'var(--text-muted)' }}>#{idx + 1}</span>
                      </div>

                      {/* Link info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary)' }}>
                            {formatShortUrl(url.shortUrl)}
                          </span>
                          <ExternalLink size={11} color="var(--primary)" />
                          <span className={`badge ${url.isActive ? 'badge-active' : 'badge-expired'}`} style={{ fontSize: '0.65rem' }}>
                            {url.isActive ? 'Active' : 'Expired'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {url.originalUrl}
                        </div>
                        {/* Progress bar */}
                        <div className="progress-bar" style={{ marginTop: '0.4rem', height: 3 }}>
                          <div className="progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      {/* Click count */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {(url.totalClicks || 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>clicks</div>
                      </div>

                      <ArrowRight size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — Chart + top link */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Bar chart */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem' }}>Clicks by Link</h3>
                {chartData.some(d => d.clicks > 0) ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                      <Tooltip contentStyle={{ fontSize: '0.8rem', borderRadius: 8, border: '1px solid var(--border)' }} />
                      <Bar dataKey="clicks" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No clicks yet — share your links!
                  </div>
                )}
              </div>

              {/* Top performing link */}
              {topLink && (
                <div className="card" style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.875rem' }}>🏆 Top Performing</h3>
                  <div
                    onClick={() => navigate(`/analytics/${topLink._id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {formatShortUrl(topLink.shortUrl)} <ExternalLink size={11} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {topLink.originalUrl}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>{(topLink.totalClicks || 0).toLocaleString()}</div>
                        <div style={{ color: 'var(--text-muted)' }}>total clicks</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          {formatDistanceToNow(new Date(topLink.createdAt), { addSuffix: true })}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>created</div>
                      </div>
                    </div>
                    <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.875rem', height: 34, fontSize: '0.8125rem' }}>
                      <BarChart2 size={13} /> View Full Analytics
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AnalyticsOverviewPage;
