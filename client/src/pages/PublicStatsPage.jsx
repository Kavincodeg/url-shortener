import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Zap, Share2, TrendingUp, Users, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/axios';
import { formatShortUrl } from '../lib/urlHelper';
import { formatDistanceToNow, format } from 'date-fns';

const PublicStatsPage = () => {
  const { shortCode } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/analytics/stats/${shortCode}`)
      .then(({ data }) => setStats(data.stats))
      .catch(() => setError('Stats not found for this link'))
      .finally(() => setLoading(false));
  }, [shortCode]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #EEF2FF', borderTop: '3px solid #4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)', fontSize: '1rem' }}>{error}</p>
      </div>
    </div>
  );

  const total = stats.countryStats?.reduce((s, c) => s + c.value, 0) || 0;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Navbar */}
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 1.5rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Linko</span>
        </div>
        <button className="btn-secondary" style={{ height: 32, fontSize: '0.8125rem' }} onClick={() => navigator.share?.({ url: window.location.href })}>
          <Share2 size={13} /> Share
        </button>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* URL display */}
        <div className="card animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>
            {formatShortUrl(stats.shortUrl)}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Created {format(new Date(stats.createdAt), 'MMMM d, yyyy')}
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { icon: TrendingUp, label: 'Total Clicks', value: stats.totalClicks?.toLocaleString() },
            { icon: Users, label: 'Unique Clicks', value: stats.uniqueClicks?.toLocaleString() },
            { icon: Clock, label: 'Last Click', value: stats.lastClick ? formatDistanceToNow(new Date(stats.lastClick), { addSuffix: true }) : 'Never' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="kpi-card" style={{ textAlign: 'center' }}>
              <Icon size={20} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '1.625rem', fontWeight: 800 }}>{value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Click trend */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem' }}>Clicks Over Time</h2>
          {stats.dailyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={d => format(new Date(d), 'MMM d')} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ fontSize: '0.8125rem', borderRadius: 8 }} />
                <Line type="monotone" dataKey="clicks" stroke="#4F46E5" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No click data yet</div>
          )}
        </div>

        {/* Top countries */}
        {stats.countryStats?.length > 0 && (
          <div className="card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem' }}>Top Countries</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {stats.countryStats.map((c) => {
                const pct = Math.round(c.value / total * 100);
                return (
                  <div key={c.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 500 }}>{c.name}</span>
                      <span style={{ fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          This is a public analytics page for this short link. · Powered by <strong>Linko</strong>
        </p>
      </div>
    </div>
  );
};

export default PublicStatsPage;
