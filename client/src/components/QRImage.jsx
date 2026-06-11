import { useState, useEffect } from 'react';
import { Loader2, QrCode } from 'lucide-react';
import api from '../lib/axios';

/**
 * QRImage is a lazy-loading image component that retrieves the QR Code PNG
 * from the backend as a Blob (with authentication headers attached) and displays it.
 */
const QRImage = ({ urlId, alt, className, style }) => {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchQR = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/urls/${urlId}/qr-png`, { responseType: 'blob' });
        if (active) {
          const objectUrl = URL.createObjectURL(data);
          setSrc(objectUrl);
        }
      } catch (err) {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchQR();

    return () => {
      active = false;
      if (src) {
        URL.revokeObjectURL(src);
      }
    };
  }, [urlId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 180, ...style }}>
        <Loader2 size={24} color="var(--primary)" style={{ animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>Generating QR...</span>
      </div>
    );
  }

  if (error || !src) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 180, color: 'var(--danger)', ...style }}>
        <QrCode size={32} style={{ opacity: 0.5, marginBottom: 8 }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Failed to load QR code</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "QR Code"}
      className={className}
      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', ...style }}
    />
  );
};

export default QRImage;
