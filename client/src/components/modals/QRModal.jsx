import { useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import QRImage from '../QRImage';
import { formatShortUrl } from '../../lib/urlHelper';

const QRModal = ({ url, onClose }) => {
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [downloadingSvg, setDownloadingSvg] = useState(false);

  const shortCode = url.customAlias || url.shortCode;
  const shortUrl = url.shortUrl || `http://localhost:5000/${shortCode}`;

  const downloadPNG = async () => {
    setDownloadingPng(true);
    try {
      const res = await api.get(`/urls/${url._id}/qr-png`, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(new Blob([res.data], { type: 'image/png' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `qr-${shortCode}.png`;
      link.click();
      URL.revokeObjectURL(blobUrl);
      toast.success('QR Code downloaded!');
    } catch {
      toast.error('Failed to download PNG');
    } finally {
      setDownloadingPng(false);
    }
  };

  const downloadSVG = async () => {
    setDownloadingSvg(true);
    try {
      const res = await api.get(`/urls/${url._id}/qr-svg`, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(new Blob([res.data], { type: 'image/svg+xml' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `qr-${shortCode}.svg`;
      link.click();
      URL.revokeObjectURL(blobUrl);
      toast.success('SVG downloaded!');
    } catch {
      toast.error('Failed to download SVG');
    } finally {
      setDownloadingSvg(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box animate-fade-in" style={{ maxWidth: 360 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>QR Code</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Scan to visit <strong style={{ color: 'var(--primary)' }}>{formatShortUrl(shortUrl)}</strong>
          </p>

          {/* QR Code image */}
          <div style={{
            display: 'inline-flex', padding: '1rem', background: 'var(--bg-primary)',
            border: '1px solid var(--border)', borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)', marginBottom: '1.5rem',
            width: 232, height: 232, alignItems: 'center', justifyContent: 'center'
          }}>
            <QRImage urlId={url._id} alt={`QR for ${shortCode}`} style={{ width: 200, height: 200 }} />
          </div>

          {/* Short URL display */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '0.625rem 1rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>
            {formatShortUrl(shortUrl)}
          </div>

          {/* Download buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={downloadPNG} disabled={downloadingPng} style={{ flex: 1, justifyContent: 'center' }}>
              {downloadingPng ? <Loader2 size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> : <Download size={14} />}
              Download PNG
            </button>
            <button className="btn-secondary" onClick={downloadSVG} disabled={downloadingSvg} style={{ flex: 1, justifyContent: 'center' }}>
              {downloadingSvg ? <Loader2 size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> : <Download size={14} />}
              Download SVG
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default QRModal;
