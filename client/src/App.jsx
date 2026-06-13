import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OTPPage from './pages/OTPPage';
import PublicStatsPage from './pages/PublicStatsPage';
import OAuthSuccessPage from './pages/OAuthSuccessPage';

// Protected pages
import DashboardPage from './pages/DashboardPage';
import MyLinksPage from './pages/MyLinksPage';
import AnalyticsPage from './pages/AnalyticsPage';
import VisitHistoryPage from './pages/VisitHistoryPage';
import BulkPage from './pages/BulkPage';
import ProfilePage from './pages/ProfilePage';
import QRCodesPage from './pages/QRCodesPage';
import BillingPage from './pages/BillingPage';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OTPPage />} />
          <Route path="/stats/:shortCode" element={<PublicStatsPage />} />
          <Route path="/oauth-success" element={<OAuthSuccessPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/links" element={<ProtectedRoute><MyLinksPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<Navigate to="/links" replace />} />
          <Route path="/analytics/:id" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/analytics/:id/visits" element={<ProtectedRoute><VisitHistoryPage /></ProtectedRoute>} />
          <Route path="/qr-codes" element={<ProtectedRoute><QRCodesPage /></ProtectedRoute>} />
          <Route path="/bulk" element={<ProtectedRoute><BulkPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: '10px',
              background: '#0F172A',
              color: '#F8FAFC',
              fontSize: '0.875rem',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              padding: '0.75rem 1rem',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#F8FAFC' },
              duration: 3000,
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#F8FAFC' },
              duration: 4000,
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
