import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { supabase } from './lib/supabase';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import Home from './pages/Home';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import HowItWorks from './pages/HowItWorks';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Onboarding from './pages/Onboarding';
import BrandKit from './pages/BrandKit';
import Dashboard from './Dashboard';
import Admin from './pages/Admin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ComingSoon from './pages/ComingSoon';

// Only these emails get full dashboard access. Everyone else sees Coming Soon.
const ADMIN_EMAILS = ['kunaivlogsdaily@gmail.com'];

function PublicLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen">
      <Nav onLogin={() => navigate('/login')} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function ProtectedRoute({ children, requireOnboarding = true }: { children: React.ReactNode, requireOnboarding?: boolean }) {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(requireOnboarding);
  const [hasProfile, setHasProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !requireOnboarding) return;

    // Check if user has completed onboarding (has a brand kit)
    supabase
      .from('brand_kits')
      .select('id')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (!data) {
          // No brand kit = hasn't completed onboarding
          navigate('/onboarding', { replace: true });
        }
        setChecking(false);
      });
  }, [user, requireOnboarding, navigate]);

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mb-4"></div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand-blue rounded flex items-center justify-center">
            <span className="font-bold text-sm text-white">K</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-brand-navy">Kulve</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Non-admin users see Coming Soon page
  if (!ADMIN_EMAILS.includes(user.email || '')) {
    return <ComingSoon />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    window.scrollTo(0, 0);
  };

  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<PublicLayout><Home onLogin={() => navigate('/signup')} /></PublicLayout>} />
      <Route path="/features" element={<PublicLayout><Features /></PublicLayout>} />
      <Route path="/pricing" element={<PublicLayout><Pricing onLogin={() => navigate('/signup')} /></PublicLayout>} />
      <Route path="/how-it-works" element={<PublicLayout><HowItWorks /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />

      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Onboarding */}
      <Route path="/onboarding" element={<ProtectedRoute requireOnboarding={false}><Onboarding /></ProtectedRoute>} />
      <Route path="/brand-kit" element={<ProtectedRoute requireOnboarding={false}><BrandKit /></ProtectedRoute>} />

      {/* Protected pages (require completed onboarding) */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard onLogout={handleLogout} /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<Admin />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
