import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Download, Copy, BarChart2, Edit2, Trash2, QrCode, ExternalLink, Link2, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import CreateLinkModal from '../components/modals/CreateLinkModal';
import QRModal from '../components/modals/QRModal';
import { formatShortUrl } from '../lib/urlHelper';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';

const LIMITS = [5, 10, 25, 50];

const MyLinksPage = () => {
  const navigate = useNavigate();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showQR, setShowQR] = useState(null);

  const fetchUrls = useCallback(async (overridePage) => {
    setLoading(true);
    try {
      const activePage = overridePage ?? page;
      const params = new URLSearchParams({ page: activePage, limit, ...(search && { search }), ...(filter !== 'all' && { filter }) });
      const { data } = await api.get(`/urls?${params}`);
      setUrls(data.urls || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 0);
    } catch {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filter]);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  // Bug fix: debounce the page-reset when search/filter changes to avoid double-fetch.
  // We reset the page to 1 and immediately call fetchUrls with page=1 in one go.
  const isFirstRender = useState(true);
  useEffect(() => {
    if (isFirstRender[0]) { isFirstRender[0] = false; return; }
    setPage(1);
    fetchUrls(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter]);

  const copyLink = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Copied to clipboard!');
  };

  const deleteUrl = async (id) => {
    if (!confirm('Delete this link?')) return;
    try {
      await api.delete(`/urls/${id}`);
      toast.success('Link deleted!');
      fetchUrls();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const exportCSV = async () => {
    try {
      const rows = [
        ['Original URL', 'Short URL', 'Clicks', 'Status', 'Created', 'Expires'],
        ...urls.map(u => [u.originalUrl, u.shortUrl, u.totalClicks, u.isActive ? 'Active' : 'Expired', format(new Date(u.createdAt), 'yyyy-MM-dd'), u.expiresAt ? format(new Date(u.expiresAt), 'yyyy-MM-dd') : 'Never'])
      ];
      const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'links.csv'; a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <AppLayout onLinkCreated={fetchUrls}>
      <div className="page-enter">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My Links</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage and track all your shortened links</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={exportCSV}><Download size={15} /> Export CSV</button>
            <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Create New Link</button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="card" style={{ padding: '0.875rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input-field"
              style={{ paddingLeft: '2rem' }}
              placeholder="Search by URL or alias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="tabs" style={{ borderBottom: 'none', gap: '0.25rem' }}>
            {['all', 'active', 'expired'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`tab-item${filter === f ? ' active' : ''}`}
                style={{ borderRadius: 6, borderBottom: 'none', background: filter === f ? 'var(--primary-light)' : 'transparent' }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 24 }} />)}
            </div>
          ) : urls.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Link2 size={36} color="var(--text-muted)" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No links yet!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                {search ? `No results for "${search}"` : "Looks like you haven't created any short links yet."}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Create Your First Link</button>
                <button className="btn-secondary" onClick={() => navigate('/bulk')}><Download size={15} /> Import from CSV</button>
              </div>
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>Original URL</th>
                    <th>Short Link</th>
                    <th>Clicks</th>
                    <th>Created</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((url) => (
                    <tr key={url._id}>
                      <td style={{ maxWidth: 220 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8125rem', color: 'var(--text-secondary)' }} title={url.originalUrl}>
                          {url.originalUrl}
                        </div>
                      </td>
                      <td>
                        <a href={url.shortUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {formatShortUrl(url.shortUrl)} <ExternalLink size={11} />
                        </a>
                      </td>
                      <td><span style={{ fontWeight: 700 }}>{url.totalClicks?.toLocaleString()}</span></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {format(new Date(url.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: url.expiresAt ? 'var(--text-secondary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {url.expiresAt ? format(new Date(url.expiresAt), 'MMM d, yyyy') : 'Never'}
                      </td>
                      <td>
                        <span className={`badge ${url.isActive ? 'badge-active' : 'badge-expired'}`}>
                          {url.isActive ? 'Active' : 'Expired'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[
                            { icon: Copy, action: () => copyLink(url.shortUrl), tip: 'Copy', cls: 'primary' },
                            { icon: BarChart2, action: () => navigate(`/analytics/${url._id}`), tip: 'Analytics', cls: 'primary' },
                            { icon: QrCode, action: () => setShowQR(url), tip: 'QR Code', cls: 'primary' },
                            { icon: Edit2, action: () => setShowEdit(url), tip: 'Edit', cls: 'primary' },
                            { icon: Trash2, action: () => deleteUrl(url._id), tip: 'Delete', cls: 'danger' },
                          ].map(({ icon: Icon, action, tip, cls }) => (
                            <button key={tip} className={`icon-btn ${cls} tooltip-wrapper`} onClick={action}>
                              <Icon size={14} /><span className="tooltip">{tip}</span>
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total} links
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Rows:
                    <select className="input-field" style={{ width: 'auto', padding: '0.25rem 0.5rem', height: 30 }} value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
                      {LIMITS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="icon-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                      return p <= totalPages ? (
                        <button key={p} onClick={() => setPage(p)} style={{ padding: '0 0.5rem', height: 28, borderRadius: 6, border: p === page ? '1px solid var(--primary)' : '1px solid var(--border)', background: p === page ? 'var(--primary-light)' : 'white', color: p === page ? 'var(--primary)' : 'var(--text-primary)', fontWeight: p === page ? 700 : 400, fontSize: '0.8125rem', cursor: 'pointer' }}>
                          {p}
                        </button>
                      ) : null;
                    })}
                    <button className="icon-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showCreate && <CreateLinkModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchUrls(); }} />}
      {showEdit && <CreateLinkModal editUrl={showEdit} onClose={() => setShowEdit(null)} onCreated={() => { setShowEdit(null); fetchUrls(); }} />}
      {showQR && <QRModal url={showQR} onClose={() => setShowQR(null)} />}
    </AppLayout>
  );
};

export default MyLinksPage;
