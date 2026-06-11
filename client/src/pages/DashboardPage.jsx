import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, TrendingUp, MousePointerClick, CheckCircle2, Clock, ExternalLink, Copy, BarChart2, Edit2, Trash2, QrCode, Plus, Calendar, Loader2 } from 'lucide-react';
import { formatShortUrl } from '../lib/urlHelper';
import AppLayout from '../components/layout/AppLayout';
import CreateLinkModal from '../components/modals/CreateLinkModal';
import QRModal from '../components/modals/QRModal';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const KPICard = ({ icon: Icon, label, value, sub, subColor, iconBg, iconColor }) => (
  <div className="kpi-card">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={17} color={iconColor} />
      </div>
    </div>
    <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.375rem' }}>
      {value}
    </div>
    <div style={{ fontSize: '0.75rem', color: subColor || 'var(--text-muted)', fontWeight: 500 }}>{sub}</div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [showEdit, setShowEdit] = useState(null);
  const [inlineForm, setInlineForm] = useState({ originalUrl: '', customAlias: '', expiresAt: '', generateQR: true });
  const [creating, setCreating] = useState(false);

  const fetchUrls = useCallback(async () => {
    try {
      const { data } = await api.get('/urls?limit=5&page=1');
      setUrls(data.urls || []);
    } catch {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  const totalClicks = urls.reduce((s, u) => s + (u.totalClicks || 0), 0);
  const activeLinks = urls.filter(u => u.isActive).length;
  const expiredLinks = urls.filter(u => !u.isActive).length;

  const copyLink = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Copied to clipboard!');
  };

  const deleteUrl = async (id) => {
    if (!confirm('Delete this link?')) return;
    try {
      await api.delete(`/urls/${id}`);
      setUrls(prev => prev.filter(u => u._id !== id));
      toast.success('Link deleted!');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleInlineCreate = async (e) => {
    e.preventDefault();
    if (!inlineForm.originalUrl) return toast.error('Please enter a URL');
    setCreating(true);
    try {
      const { data } = await api.post('/urls', {
        originalUrl: inlineForm.originalUrl,
        customAlias: inlineForm.customAlias || undefined,
        expiresAt: inlineForm.expiresAt || undefined,
        generateQR: inlineForm.generateQR,
      });
      toast.success('Link created successfully!');
      setUrls(prev => [data.url, ...prev.slice(0, 4)]);
      setInlineForm({ originalUrl: '', customAlias: '', expiresAt: '', generateQR: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create link');
    } finally {
      setCreating(false);
    }
  };

  const kpis = [
    { icon: Link2, label: 'Total Links', value: urls.length, sub: '+12 this month', subColor: 'var(--success)', iconBg: '#EEF2FF', iconColor: '#4F46E5' },
    { icon: MousePointerClick, label: 'Total Clicks', value: totalClicks.toLocaleString(), sub: '+18.2% this month', subColor: 'var(--success)', iconBg: '#D1FAE5', iconColor: '#059669' },
    { icon: CheckCircle2, label: 'Active Links', value: activeLinks, sub: `${urls.length ? Math.round(activeLinks / urls.length * 100) : 0}% of total`, iconBg: '#FEF3C7', iconColor: '#D97706' },
    { icon: Clock, label: 'Expired Links', value: expiredLinks, sub: `${urls.length ? Math.round(expiredLinks / urls.length * 100) : 0}% of total`, subColor: 'var(--danger)', iconBg: '#FEE2E2', iconColor: '#EF4444' },
  ];

  return (
    <AppLayout onLinkCreated={(url) => setUrls(prev => [url, ...prev.slice(0, 4)])}>
      <div className="page-enter">
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.name?.split(' ')[0]}</strong>! Here's what's happening with your links today.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> Create New Link
          </button>
        </div>

        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {kpis.map((k) => <KPICard key={k.label} {...k} />)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Create Short Link inline form */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem' }}>Create Short Link</h2>
              <form onSubmit={handleInlineCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Long URL</label>
                  <input className="input-field" placeholder="https://example.com/very/long/url" value={inlineForm.originalUrl} onChange={(e) => setInlineForm({ ...inlineForm, originalUrl: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Custom Alias</label>
                    <input className="input-field" placeholder="my-custom-alias" value={inlineForm.customAlias} onChange={(e) => setInlineForm({ ...inlineForm, customAlias: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Expiry Date</label>
                    <input type="date" className="input-field" value={inlineForm.expiresAt} onChange={(e) => setInlineForm({ ...inlineForm, expiresAt: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button type="submit" className="btn-primary" disabled={creating} style={{ width: '100%', justifyContent: 'center', height: 36 }}>
                      {creating ? <Loader2 size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> : <><Plus size={14} /> Generate Link</>}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Recent Links Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Recent Links</h2>
                <button onClick={() => navigate('/links')} style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                  View All →
                </button>
              </div>

              {loading ? (
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 20 }} />)}
                </div>
              ) : urls.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <Link2 size={36} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No links yet. Create your first one!</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Original URL</th>
                      <th>Short Link</th>
                      <th>Clicks</th>
                      <th>Created</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {urls.map((url) => (
                      <tr key={url._id}>
                        <td style={{ maxWidth: 200 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            {url.originalUrl}
                          </div>
                        </td>
                        <td>
                          <a href={url.shortUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {formatShortUrl(url.shortUrl)}
                            <ExternalLink size={11} />
                          </a>
                        </td>
                        <td><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{url.totalClicks?.toLocaleString()}</span></td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {formatDistanceToNow(new Date(url.createdAt), { addSuffix: true })}
                        </td>
                        <td>
                          <span className={`badge ${url.isActive ? 'badge-active' : 'badge-expired'}`}>
                            {url.isActive ? 'Active' : 'Expired'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            <button className="icon-btn primary tooltip-wrapper" onClick={() => copyLink(url.shortUrl)} title="Copy">
                              <Copy size={14} /><span className="tooltip">Copy</span>
                            </button>
                            <button className="icon-btn primary tooltip-wrapper" onClick={() => navigate(`/analytics/${url._id}`)} title="Analytics">
                              <BarChart2 size={14} /><span className="tooltip">Analytics</span>
                            </button>
                            <button className="icon-btn primary tooltip-wrapper" onClick={() => setShowQR(url)} title="QR Code">
                              <QrCode size={14} /><span className="tooltip">QR Code</span>
                            </button>
                            <button className="icon-btn primary tooltip-wrapper" onClick={() => setShowEdit(url)} title="Edit">
                              <Edit2 size={14} /><span className="tooltip">Edit</span>
                            </button>
                            <button className="icon-btn danger tooltip-wrapper" onClick={() => deleteUrl(url._id)} title="Delete">
                              <Trash2 size={14} /><span className="tooltip">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right column - Quick actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { icon: Plus, label: 'Create New Link', onClick: () => setShowCreate(true), primary: true },
                  { icon: BarChart2, label: 'View Analytics', onClick: () => navigate('/analytics'), primary: false },
                  { icon: QrCode, label: 'Manage QR Codes', onClick: () => navigate('/qr-codes'), primary: false },
                  { icon: TrendingUp, label: 'Bulk Upload', onClick: () => navigate('/bulk'), primary: false },
                ].map(({ icon: Icon, label, onClick, primary }) => (
                  <button key={label} onClick={onClick} className={primary ? 'btn-primary' : 'btn-secondary'} style={{ justifyContent: 'flex-start', width: '100%' }}>
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent activity summary */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem' }}>Link Overview</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  { label: 'Active', value: activeLinks, total: urls.length, color: 'var(--success)' },
                  { label: 'Expired', value: expiredLinks, total: urls.length, color: 'var(--danger)' },
                ].map(({ label, value, total, color }) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                      <span style={{ fontWeight: 700 }}>{value}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: total ? `${(value / total) * 100}%` : '0%', background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreate && <CreateLinkModal onClose={() => setShowCreate(false)} onCreated={(url) => { setUrls(prev => [url, ...prev.slice(0, 4)]); setShowCreate(false); }} />}
      {showQR && <QRModal url={showQR} onClose={() => setShowQR(null)} />}
      {showEdit && <CreateLinkModal editUrl={showEdit} onClose={() => setShowEdit(null)} onCreated={(url) => { setUrls(prev => prev.map(u => u._id === url._id ? url : u)); setShowEdit(null); }} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
};

export default DashboardPage;
