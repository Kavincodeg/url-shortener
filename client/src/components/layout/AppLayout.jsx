import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import CreateLinkModal from '../modals/CreateLinkModal';

const AppLayout = ({ children, onLinkCreated }) => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-body)' }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopNavbar onCreateLink={() => setShowCreate(true)} />
        <main style={{ flex: 1, padding: '1.5rem', maxWidth: '100%', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      {showCreate && (
        <CreateLinkModal
          onClose={() => setShowCreate(false)}
          onCreated={(url) => {
            setShowCreate(false);
            onLinkCreated?.(url);
          }}
        />
      )}
    </div>
  );
};

export default AppLayout;
