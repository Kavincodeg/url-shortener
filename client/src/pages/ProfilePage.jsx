import { useState, useRef } from 'react';
import { Camera, Save, Lock, Loader2, User, Bell, AlertTriangle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const TABS = ['Profile', 'Security', 'Notifications'];
const TIMEZONES = ['UTC', 'Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney'];

const NOTIFICATION_PREFS_KEY = 'linko_notif_prefs';
const DEFAULT_NOTIF_PREFS = {
  linkExpiry: true,
  weeklyReport: true,
  securityAlerts: true,
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', timezone: user?.timezone || 'UTC' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const fileInputRef = useRef(null);
  // Bug fix: notification prefs are now controlled state persisted to localStorage
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(localStorage.getItem(NOTIFICATION_PREFS_KEY) || '{}') }; }
    catch { return DEFAULT_NOTIF_PREFS; }
  });
  const togglePref = (key) => setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  const saveNotifPrefs = () => {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(notifPrefs));
    toast.success('Preferences saved!');
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('New passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPw(true);
    try {
      await api.put('/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return toast.error('Only image files are allowed');
    if (file.size > 2 * 1024 * 1024) return toast.error('Image size must be less than 2MB');

    const formData = new FormData();
    formData.append('avatar', file);

    const loadingToast = toast.loading('Uploading avatar...');
    try {
      const { data } = await api.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      toast.success('Avatar updated successfully!', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar', { id: loadingToast });
    }
  };

  return (
    <AppLayout>
      <div className="page-enter" style={{ maxWidth: 700 }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Settings</h1>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          {TABS.map(t => (
            <button key={t} className={`tab-item${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {activeTab === 'Profile' && (
          <div className="card animate-fade-in" style={{ padding: '1.75rem' }}>
            {/* Profile picture */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: '1.75rem', overflow: 'hidden'
                }}>
                  {user?.profileImage
                    ? <img src={user.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : user?.name?.charAt(0).toUpperCase()
                  }
                </div>
                <button style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'var(--primary)', border: '2px solid white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => fileInputRef.current?.click()}>
                  <Camera size={11} color="white" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.name}</div>
                <button style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => fileInputRef.current?.click()}>
                  Change
                </button>
              </div>
            </div>

            <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Full Name</label>
                  <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Email Address</label>
                  <input className="input-field" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Timezone</label>
                <select className="input-field" value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}>
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> Saving...</> : <><Save size={14} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'Security' && (
          <div className="card animate-fade-in" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} color="var(--primary)" /> Change Password
            </h2>
            <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Current Password</label>
                <input className="input-field" type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} placeholder="••••••••" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>New Password</label>
                <input className="input-field" type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="Min 6 characters" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Confirm New Password</label>
                <input className="input-field" type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} placeholder="Repeat new password" required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary" disabled={savingPw}>
                  {savingPw ? <><Loader2 size={14} style={{ animation: 'spin 0.6s linear infinite' }} /> Updating...</> : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'Notifications' && (
          <div className="card animate-fade-in" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} color="var(--primary)" /> Notification Preferences
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { key: 'linkExpiry', label: 'Link expiry alerts', desc: 'Get notified before your links expire' },
                { key: 'weeklyReport', label: 'Weekly analytics report', desc: 'Receive a weekly summary of your link performance' },
                { key: 'securityAlerts', label: 'Security alerts', desc: 'Get notified about suspicious activity' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={notifPrefs[key]} onChange={() => togglePref(key)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={saveNotifPrefs}><Save size={14} /> Save Preferences</button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
};

export default ProfilePage;
