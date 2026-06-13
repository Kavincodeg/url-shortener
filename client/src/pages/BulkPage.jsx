import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Download, CheckCircle2, XCircle, Loader2, ExternalLink, Copy } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { formatShortUrl } from '../lib/urlHelper';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const BulkPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [options, setOptions] = useState({ useCustomAliases: false, setExpiry: false, expiresAt: '' });

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/csv': ['.csv'] }, maxFiles: 1, maxSize: 5 * 1024 * 1024,
  });

  const downloadSample = () => {
    window.open('/api/bulk/sample', '_blank');
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a CSV file');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('useCustomAliases', options.useCustomAliases);
      formData.append('setExpiry', options.setExpiry);
      if (options.setExpiry && options.expiresAt) formData.append('expiresAt', options.expiresAt);

      const { data } = await api.post('/bulk', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResults(data);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadResults = () => {
    if (!results) return;
    const rows = [
      ['Original URL', 'Short URL', 'Status', 'Error'],
      ...results.results.map(r => [r.originalUrl, r.shortUrl || '', r.status, r.error || ''])
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bulk-results.csv'; a.click();
  };

  return (
    <AppLayout>
      <div className="page-enter" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Bulk Shorten</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Upload a CSV file to shorten multiple URLs at once</p>
        </div>

        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>How it works?</h2>
            <button className="btn-secondary" onClick={downloadSample}><Download size={14} /> Download Sample CSV</button>
          </div>

          {/* Drop zone */}
          <div {...getRootProps()} className={`drop-zone${isDragActive ? ' active' : ''}`} style={{ marginBottom: '1.25rem' }}>
            <input {...getInputProps()} />
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                <CheckCircle2 size={24} color="var(--success)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{file.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
            ) : (
              <div>
                <Upload size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {isDragActive ? 'Drop your CSV here!' : 'Drag & drop your CSV file here'}
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>or click to browse · Max 500 URLs, 5MB</p>
              </div>
            )}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Options</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={options.useCustomAliases} onChange={e => setOptions({ ...options, useCustomAliases: e.target.checked })} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
              Use custom aliases from CSV (if available)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={options.setExpiry} onChange={e => setOptions({ ...options, setExpiry: e.target.checked })} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
              Set expiry date for all links
            </label>
            {options.setExpiry && (
              <input type="date" className="input-field" style={{ maxWidth: 200 }} value={options.expiresAt} onChange={e => setOptions({ ...options, expiresAt: e.target.value })} min={new Date().toISOString().split('T')[0]} />
            )}
          </div>

          <button className="btn-primary" onClick={handleUpload} disabled={uploading || !file} style={{ width: '100%', justifyContent: 'center', height: 44, fontSize: '0.9375rem' }}>
            {uploading ? <><Loader2 size={16} style={{ animation: 'spin 0.6s linear infinite' }} /> Processing...</> : <><Upload size={16} /> Process URLs</>}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Results</h2>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>✓ {results.summary.successful} created</span>
                  {results.summary.failed > 0 && <span style={{ color: 'var(--danger)', fontWeight: 600 }}>✗ {results.summary.failed} failed</span>}
                </div>
              </div>
              <button className="btn-secondary" onClick={downloadResults}><Download size={14} /> Download Results</button>
            </div>
            <table className="data-table">
              <thead><tr><th>Original URL</th><th>Short URL</th><th>Status</th></tr></thead>
              <tbody>
                {results.results.map((r, i) => (
                  <tr key={i}>
                    <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>{r.originalUrl}</td>
                    <td>
                      {r.shortUrl ? (
                        <a href={r.shortUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {formatShortUrl(r.shortUrl)} <ExternalLink size={11} />
                        </a>
                      ) : <span style={{ color: 'var(--danger)', fontSize: '0.8125rem' }}>{r.error}</span>}
                    </td>
                    <td>
                      {r.status === 'success'
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--success)', fontWeight: 600, fontSize: '0.8125rem' }}><CheckCircle2 size={13} /> Success</span>
                        : <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--danger)', fontWeight: 600, fontSize: '0.8125rem' }}><XCircle size={13} /> Failed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
};

export default BulkPage;
