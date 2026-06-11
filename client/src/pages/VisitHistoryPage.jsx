import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const VisitHistoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [countryFilter, setCountryFilter] = useState('All');
  const [countries, setCountries] = useState([]);

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit, ...(countryFilter !== 'All' && { country: countryFilter }) });
      const { data } = await api.get(`/analytics/${id}/visits?${params}`);
      setVisits(data.visits || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 0);
      const uniqueCountries = [...new Set(data.visits?.map(v => v.country).filter(c => c && c !== 'Unknown'))];
      if (uniqueCountries.length > 0) setCountries(uniqueCountries);
    } catch {
      toast.error('Failed to load visit history');
    } finally {
      setLoading(false);
    }
  }, [id, page, limit, countryFilter]);

  useEffect(() => { fetchVisits(); }, [fetchVisits]);

  const exportCSV = async () => {
    try {
      window.open(`/api/analytics/${id}/visits?exportCsv=true`, '_blank');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <AppLayout>
      <div className="page-enter">
        <div style={{ marginBottom: '1.25rem' }}>
          <button onClick={() => navigate(`/analytics/${id}`)} className="btn-secondary" style={{ marginBottom: '0.875rem', height: 32, fontSize: '0.8125rem', padding: '0 0.75rem' }}>
            <ArrowLeft size={14} /> Back to Analytics
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Visit History</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{total.toLocaleString()} total visits recorded</p>
            </div>
            <button className="btn-secondary" onClick={exportCSV}><Download size={14} /> Export CSV</button>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Country:</label>
          <select className="input-field" style={{ width: 180 }} value={countryFilter} onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}>
            <option value="All">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 20 }} />)}
            </div>
          ) : visits.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No visits recorded yet</div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Country</th>
                    <th>City</th>
                    <th>Device</th>
                    <th>Browser</th>
                    <th>OS</th>
                    <th>IP Address</th>
                    <th>Referrer</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((v) => (
                    <tr key={v._id}>
                      <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {format(new Date(v.timestamp), 'MMM d, HH:mm')}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{v.country}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.city}</td>
                      <td>
                        <span className="badge" style={{ background: v.device === 'Mobile' ? '#FEF3C7' : v.device === 'Tablet' ? '#D1FAE5' : '#EEF2FF', color: v.device === 'Mobile' ? '#D97706' : v.device === 'Tablet' ? '#059669' : '#4F46E5' }}>
                          {v.device}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{v.browser}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.os}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{v.ip}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{v.referrer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total.toLocaleString()} visits
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <select className="input-field" style={{ width: 'auto', padding: '0.25rem 0.5rem', height: 30, fontSize: '0.8125rem' }} value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
                    {[10, 25, 50].map(l => <option key={l} value={l}>{l}/page</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="icon-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                      {page} / {totalPages}
                    </span>
                    <button className="icon-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default VisitHistoryPage;
