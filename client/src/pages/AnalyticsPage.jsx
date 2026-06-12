import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Share2, QrCode, ExternalLink, TrendingUp, Users, Clock, BarChart2, Loader2, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import QRModal from '../components/modals/QRModal';
import { formatShortUrl } from '../lib/urlHelper';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';

const COLORS = ['#4F46E5', '#7C3AED', '#2563EB', '#059669', '#D97706', '#EF4444'];

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="kpi-card">
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
      <Icon size={16} color={color || 'var(--primary)'} />
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
    </div>
    <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.25rem' }}>{value}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>{sub}</div>}
  </div>
);

const TABS = ['Overview', 'Devices', 'Locations', 'Referrers', 'Browsers'];

const AnalyticsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [days, setDays] = useState(7);
  const [showQR, setShowQR] = useState(false);
  const [recentVisits, setRecentVisits] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analyticsRes, visitsRes] = await Promise.all([
          api.get(`/analytics/${id}?days=${days}`),
          api.get(`/analytics/${id}/visits?limit=5`),
        ]);
        setData(analyticsRes.data.analytics);
        setRecentVisits(visitsRes.data.visits || []);
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, days]);

  const copyLink = () => {
    navigator.clipboard.writeText(data?.url?.shortUrl || '');
    toast.success('Copied to clipboard!');
  };

  const shareLink = async () => {
    // Bug fix: derive shortUrl directly from data instead of referencing a later const
    const shareUrl = data?.url?.shortUrl || '';
    const shareData = {
      title: 'Short Link',
      text: `Original URL: ${data?.url?.originalUrl}`,
      url: shareUrl,
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Web Share not supported. Copied to clipboard instead!');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      </AppLayout>
    );
  }

  if (!data) return <AppLayout><p>Not found</p></AppLayout>;

  const shortCode = data.url.customAlias || data.url.shortCode;
  const shortUrl = data.url.shortUrl || `http://localhost:5000/${shortCode}`;

  return (
    <AppLayout>
      <div className="page-enter">
        {/* Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button onClick={() => navigate('/links')} className="btn-secondary" style={{ marginBottom: '0.875rem', height: 32, fontSize: '0.8125rem', padding: '0 0.75rem' }}>
            <ArrowLeft size={14} /> Back to My Links
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {formatShortUrl(shortUrl)}
                <span className={`badge ${data.url.isActive ? 'badge-active' : 'badge-expired'}`}>{data.url.isActive ? 'Active' : 'Expired'}</span>
              </h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Created {format(new Date(data.url.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" onClick={copyLink} style={{ height: 34, fontSize: '0.8125rem' }}><Copy size={13} /> Copy</button>
              <button className="btn-secondary" onClick={shareLink} style={{ height: 34, fontSize: '0.8125rem' }}><Share2 size={13} /> Share</button>
              <button className="btn-secondary" onClick={() => setShowQR(true)} style={{ height: 34, fontSize: '0.8125rem' }}><QrCode size={13} /> QR Code</button>
              <select className="input-field" style={{ width: 120, height: 34, fontSize: '0.8125rem' }} value={days} onChange={e => setDays(Number(e.target.value))}>
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard icon={TrendingUp} label="Total Clicks" value={data.totalClicks?.toLocaleString()} sub={data.totalClicks > 0 ? `+${data.totalClicks} total` : undefined} color="#4F46E5" />
          <StatCard icon={Users} label="Unique Clicks" value={data.uniqueClicks?.toLocaleString()} color="#059669" />
          <StatCard icon={Clock} label="Last Click" value={data.lastClick ? formatDistanceToNow(new Date(data.lastClick), { addSuffix: true }) : 'Never'} color="#D97706" />
          <StatCard icon={BarChart2} label="Avg. Daily Clicks" value={data.avgDailyClicks} color="#7C3AED" />
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '1.25rem' }}>
          {TABS.map(t => (
            <button key={t} className={`tab-item${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Click trend chart */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1.25rem' }}>Clicks Over Time</h3>
                {data.dailyTrend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={data.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={d => format(new Date(d), 'MMM d')} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                      <Tooltip contentStyle={{ fontSize: '0.8125rem', borderRadius: 8, border: '1px solid var(--border)' }} />
                      <Line type="monotone" dataKey="clicks" stroke="#4F46E5" strokeWidth={2.5} dot={{ fill: '#4F46E5', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No click data available</div>
                )}
              </div>

              {/* Recent visits mini-table */}
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Recent Clicks</h3>
                  <button onClick={() => navigate(`/analytics/${id}/visits`)} style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                    View all clicks →
                  </button>
                </div>
                {recentVisits.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No visits yet</div>
                ) : (
                  <table className="data-table">
                    <thead><tr><th>Time</th><th>Location</th><th>Device</th><th>Browser</th><th>Referrer</th></tr></thead>
                    <tbody>
                      {recentVisits.map((v) => (
                        <tr key={v._id}>
                          <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatDistanceToNow(new Date(v.timestamp), { addSuffix: true })}</td>
                          <td style={{ fontSize: '0.8rem' }}>{v.city !== 'Unknown' ? `${v.city}, ` : ''}{v.country}</td>
                          <td style={{ fontSize: '0.8rem' }}>{v.device}</td>
                          <td style={{ fontSize: '0.8rem' }}>{v.browser}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.referrer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Device Pie */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem' }}>Top Devices</h3>
                {data.deviceStats?.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={data.deviceStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                          {data.deviceStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: '0.75rem', borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                      {data.deviceStats.map((d, i) => {
                        const pct = Math.round(d.value / (data.deviceStats.reduce((s, x) => s + x.value, 0) || 1) * 100);
                        return (
                          <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                              {d.name}
                            </div>
                            <span style={{ fontWeight: 700 }}>{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '1rem' }}>No data yet</div>}
              </div>

              {/* Top Countries */}
              <div className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem' }}>Top Countries</h3>
                {data.countryStats?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {data.countryStats.map((c, i) => {
                      const total = data.countryStats.reduce((s, x) => s + x.value, 0);
                      const pct = Math.round(c.value / total * 100);
                      return (
                        <div key={c.name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                            <span style={{ fontWeight: 700 }}>{pct}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '1rem' }}>No data yet</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Devices' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem' }}>Device Breakdown</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={data.deviceStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {data.deviceStats?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem' }}>OS Breakdown</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.osStats} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'Locations' && (
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem' }}>Top Countries</h3>
            {data.countryStats?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.countryStats.map((c, i) => {
                  const total = data.countryStats.reduce((s, x) => s + x.value, 0);
                  const pct = Math.round(c.value / total * 100);
                  return (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ width: 28, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)' }}>#{i + 1}</span>
                      <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{c.name}</span>
                      <div className="progress-bar" style={{ flex: 3 }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                      <span style={{ width: 50, textAlign: 'right', fontSize: '0.875rem', fontWeight: 700 }}>{c.value}</span>
                      <span style={{ width: 40, textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            ) : <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No location data yet</div>}
          </div>
        )}

        {activeTab === 'Referrers' && (
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem' }}>Traffic Sources</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.referrerStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'Browsers' && (
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem' }}>Browser Breakdown</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.browserStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {showQR && <QRModal url={data.url} onClose={() => setShowQR(false)} />}
    </AppLayout>
  );
};

export default AnalyticsPage;
