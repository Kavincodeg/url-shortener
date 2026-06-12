import { useState, useEffect } from 'react';
import { X, Link2, Calendar, QrCode, Check, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const CreateLinkModal = ({ onClose, onCreated, editUrl }) => {
  const [form, setForm] = useState({
    originalUrl: editUrl?.originalUrl || '',
    customAlias: editUrl?.customAlias || '',
    expiresAt: editUrl?.expiresAt ? editUrl.expiresAt.split('T')[0] : '',
    generateQR: true,
  });
  const [loading, setLoading] = useState(false);
  const [aliasStatus, setAliasStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const isEdit = !!editUrl;

  useEffect(() => {
    if (!form.customAlias || form.customAlias === editUrl?.customAlias) {
      setAliasStatus(null);
      return;
    }
    const t = setTimeout(async () => {
      setAliasStatus('checking');
      try {
        const { data } = await api.get(`/urls/check-alias/${form.customAlias}`);
        setAliasStatus(data.available ? 'available' : 'taken');
      } catch {
        setAliasStatus(null);
      }
    }, 500);
    return () => clearTimeout(t);
  // Bug fix: include editUrl in deps so the stale-closure check uses the current editUrl alias
  }, [form.customAlias, editUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.originalUrl) return toast.error('Please enter a URL');
    if (aliasStatus === 'taken') return toast.error('That alias is already taken');

    setLoading(true);
    try {
      const payload = {
        originalUrl: form.originalUrl,
        customAlias: form.customAlias || undefined,
        expiresAt: form.expiresAt || undefined,
        generateQR: form.generateQR,
      };

      let data;
      if (isEdit) {
        const res = await api.put(`/urls/${editUrl._id}`, payload);
        data = res.data;
        toast.success('Link updated!');
      } else {
        const res = await api.post('/urls', payload);
        data = res.data;
        toast.success('Link created successfully!');
      }
      onCreated?.(data.url);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>{isEdit ? 'Edit Link' : 'Create New Short Link'}</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Long URL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--text-primary)' }}>
              Long URL <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Link2 size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="input-field"
                style={{ paddingLeft: '2rem' }}
                placeholder="https://example.com/very/long/url"
                value={form.originalUrl}
                onChange={(e) => setForm({ ...form, originalUrl: e.target.value })}
              />
            </div>
          </div>

          {/* Custom Alias */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--text-primary)' }}>
              Custom Alias <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', transition: 'all 0.15s', ...(aliasStatus === 'taken' ? { borderColor: 'var(--danger)' } : aliasStatus === 'available' ? { borderColor: 'var(--success)' } : {}) }}>
              <span style={{ padding: '0 0.625rem 0 0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)', background: '#F8FAFC', borderRight: '1px solid var(--border)', whiteSpace: 'nowrap', alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>
                {window.location.hostname}/
              </span>
              <input
                style={{ flex: 1, padding: '0.5rem 0.75rem', border: 'none', outline: 'none', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}
                placeholder="your-alias"
                value={form.customAlias}
                onChange={(e) => setForm({ ...form, customAlias: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              />
              {aliasStatus === 'available' && (
                <span style={{ paddingRight: '0.625rem', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Check size={13} /> Available
                </span>
              )}
              {aliasStatus === 'taken' && (
                <span style={{ paddingRight: '0.625rem', fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>Taken</span>
              )}
              {aliasStatus === 'checking' && (
                <span style={{ paddingRight: '0.625rem' }}><Loader2 size={14} style={{ animation: 'spin 0.6s linear infinite' }} /></span>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Only letters, numbers and hyphens allowed</p>
          </div>

          {/* Expiry Date */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--text-primary)' }}>
              Expiry Date <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Calendar size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="date"
                className="input-field"
                style={{ paddingLeft: '2rem' }}
                min={new Date().toISOString().split('T')[0]}
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>
          </div>

          {/* Generate QR toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#F8FAFC', borderRadius: 8 }}>
            <label className="toggle">
              <input type="checkbox" checked={form.generateQR} onChange={(e) => setForm({ ...form, generateQR: e.target.checked })} />
              <span className="toggle-slider" />
            </label>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <QrCode size={15} /> Generate QR Code
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>You can download QR after creation</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1.5, justifyContent: 'center' }}>
              {loading ? <><Loader2 size={15} style={{ animation: 'spin 0.6s linear infinite' }} /> {isEdit ? 'Saving...' : 'Creating...'}</> : isEdit ? 'Save Changes' : 'Create Link'}
            </button>
          </div>
        </form>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default CreateLinkModal;
