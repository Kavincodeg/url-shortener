import { useState, useEffect } from 'react';
import { Search, Download, Copy, ExternalLink, QrCode, Loader2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { formatShortUrl } from '../lib/urlHelper';
import QRImage from '../components/QRImage';

const QRCodesPage = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/urls?limit=100');
      setLinks(data.urls || []);
    } catch (err) {
      toast.error('Failed to fetch QR codes');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Copied to clipboard!');
  };

  const downloadPNG = async (id, alias) => {
    try {
      const response = await api.get(`/urls/${id}/qr-png`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qrcode-${alias || 'link'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('PNG downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download PNG');
    }
  };

  const downloadSVG = async (id, alias) => {
    try {
      const response = await api.get(`/urls/${id}/qr-svg`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qrcode-${alias || 'link'}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('SVG downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download SVG');
    }
  };

  const filteredLinks = links.filter(link => 
    link.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
    (link.customAlias && link.customAlias.toLowerCase().includes(search.toLowerCase())) ||
    link.shortCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="page-enter">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>QR Codes Gallery</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              View and download dynamic QR codes for your shortened links.
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="input-field"
              style={{ paddingLeft: '2.25rem', height: 38 }}
              placeholder="Search by URL or alias..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grid List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <Loader2 size={32} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="card animate-fade-in" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <QrCode size={24} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>No QR Codes Found</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 320, margin: '0 auto' }}>
              {search ? 'Try adjusting your search terms.' : 'Create a short link to see it here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {filteredLinks.map((link) => {
              const displayUrl = formatShortUrl(link.shortUrl);
              return (
                <div key={link._id} className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.25rem', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  
                  {/* QR Image Container */}
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border)', marginBottom: '1rem', aspectRatio: '1/1' }}>
                    <QRImage urlId={link._id} alt={`QR for ${link.customAlias || link.shortCode}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0, marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {displayUrl}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.25rem' }}>
                      {link.originalUrl}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span><strong>{link.totalClicks}</strong> clicks</span>
                      <span>•</span>
                      <span>{new Date(link.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.875rem' }}>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1, height: 32, fontSize: '0.75rem', padding: '0 0.5rem', gap: '0.25rem' }}
                      onClick={() => copyToClipboard(link.shortUrl)}
                    >
                      <Copy size={12} /> Copy
                    </button>
                    
                    <button
                      className="btn-secondary"
                      style={{ height: 32, fontSize: '0.75rem', padding: '0 0.5rem', gap: '0.25rem' }}
                      onClick={() => downloadPNG(link._id, link.customAlias || link.shortCode)}
                      title="Download as PNG"
                    >
                      <Download size={12} /> PNG
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ height: 32, fontSize: '0.75rem', padding: '0 0.5rem', gap: '0.25rem' }}
                      onClick={() => downloadSVG(link._id, link.customAlias || link.shortCode)}
                      title="Download as SVG"
                    >
                      <Download size={12} /> SVG
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
};

export default QRCodesPage;
