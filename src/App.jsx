/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Navbar from './components/Navbar';
import { Toaster, toast } from 'sonner';
import { Shield } from 'lucide-react';

const PhishingDetectivePage = lazy(() => import('./pages/PhishingDetectivePage'));
const SecurityFundamentalsPage = lazy(() => import('./pages/SecurityFundamentalsPage'));
const AiChallengeLabPage = lazy(() => import('./pages/AiChallengeLabPage'));
const OwaspPage = lazy(() => import('./pages/OwaspPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const VerificationPage = lazy(() => import('./pages/VerificationPage'));

function ModuleLoader() {
  return (
    <div className="flex flex-col justify-center items-center py-24 gap-4">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-[#3B82F6] animate-spin" style={{ animationDuration: '3s' }} />
        <span className="text-xl font-bold tracking-tight">
          CYBER<span className="text-[#3B82F6]">QUEST</span>
        </span>
      </div>
      <p className="text-xs text-[#9CA3AF] font-mono tracking-widest uppercase animate-pulse">
        Loading module secure environment...
      </p>
    </div>
  );
}

function AppContent() {
  const { user, loading, error } = useAuth();
  const [currentView, setCurrentView] = useState(() => {
    try {
      if (window.location.pathname === '/verify') {
        return 'verify';
      }
      const saved = localStorage.getItem('cyberquest_current_view');
      const validViews = ['dashboard', 'phishing-detective', 'security-fundamentals', 'ai-challenge-lab', 'owasp', 'profile', 'verify'];
      if (saved && validViews.includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return 'dashboard';
  });

  const handleNavigate = (view) => {
    console.log("[App] currentView before transition:", currentView);
    console.log("[App] Navigating to view:", view);
    setCurrentView(view);
    console.log("[App] currentView after transition scheduled:", view);
    try {
      localStorage.setItem('cyberquest_current_view', view);
      if (view !== 'verify' && window.location.pathname === '/verify') {
        window.history.pushState(null, '', '/');
      } else if (view === 'verify' && window.location.pathname !== '/verify') {
        window.history.pushState(null, '', '/verify');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger toast alert if auth/sync errors occur
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/verify') {
        setCurrentView('verify');
      } else {
        const saved = localStorage.getItem('cyberquest_current_view');
        const validViews = ['dashboard', 'phishing-detective', 'security-fundamentals', 'ai-challenge-lab', 'owasp', 'profile'];
        if (saved && validViews.includes(saved)) {
          setCurrentView(saved);
        } else {
          setCurrentView('dashboard');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Reset to dashboard if user logs out
  useEffect(() => {
    if (!user) {
      if (window.location.pathname !== '/verify') {
        setCurrentView('dashboard');
        try {
          localStorage.setItem('cyberquest_current_view', 'dashboard');
        } catch (e) {
          console.error(e);
        }
      } else {
        setCurrentView('verify');
      }
    }
  }, [user]);

  // 1. Loading State Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1115] text-[#F3F4F6] flex flex-col justify-center items-center gap-4">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#3B82F6] animate-pulse" />
          <span className="text-2xl font-bold tracking-tight">
            CYBER<span className="text-[#3B82F6]">QUEST</span>
          </span>
        </div>
        <p className="text-xs text-[#9CA3AF] font-mono tracking-widest uppercase animate-pulse">
          Decrypting session...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated state: Force Product Landing / LoginPage unless on /verify
  if (!user) {
    if (window.location.pathname === '/verify') {
      return (
        <div className="min-h-screen bg-[#0F1115] text-[#F3F4F6] flex flex-col justify-between selection:bg-[#3B82F6]/30 selection:text-white">
          <div>
            <header className="border-b border-[#1F242F] bg-[#171A21]/80 backdrop-blur-sm sticky top-0 z-40">
              <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <a href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                  <Shield className="w-6 h-6 text-[#3B82F6]" />
                  <span className="text-lg font-extrabold tracking-tight">
                    CYBER<span className="text-[#3B82F6]">QUEST</span>
                  </span>
                </a>
                <a 
                  href="/" 
                  className="inline-flex items-center justify-center bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded text-xs font-semibold transition-all cursor-pointer"
                >
                  Sign In
                </a>
              </div>
            </header>

            <main className="pb-12">
              <Suspense fallback={<ModuleLoader />}>
                <VerificationPage />
              </Suspense>
            </main>
          </div>

          <footer className="border-t border-[#1F242F] bg-[#171A21]/20 py-6 text-center text-xs text-[#9CA3AF]">
            <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>&copy; {new Date().getFullYear()} CyberQuest. Defensive Security Learning Platform.</p>
              <div className="flex gap-4">
                <a href="/" className="hover:text-[#F3F4F6] transition-colors">Platform</a>
                <a href="/verify" className="hover:text-[#F3F4F6] transition-colors">Verify Certificate</a>
                <a href="#" className="hover:text-[#F3F4F6] transition-colors">Documentation</a>
                <a href="#" className="hover:text-[#F3F4F6] transition-colors">Support</a>
              </div>
            </div>
          </footer>
        </div>
      );
    }

    return (
      <>
        <LoginPage />
      </>
    );
  }

  // 3. Authenticated State: Main Layout with Navigation
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F3F4F6] flex flex-col justify-between selection:bg-[#3B82F6]/30 selection:text-white">
      <div>
        <Navbar 
          currentView={currentView} 
          onNavigate={handleNavigate} 
        />
        
        <main className="pb-12">
          <Suspense fallback={<ModuleLoader />}>
            {currentView === 'dashboard' && (
              <DashboardPage onNavigate={handleNavigate} />
            )}
            {currentView === 'phishing-detective' && (
              <PhishingDetectivePage />
            )}
            {currentView === 'security-fundamentals' && (
              <SecurityFundamentalsPage />
            )}
            {currentView === 'ai-challenge-lab' && (
              <AiChallengeLabPage />
            )}
            {currentView === 'owasp' && (
              <OwaspPage />
            )}
            {currentView === 'profile' && (
              <ProfilePage />
            )}
            {currentView === 'verify' && (
              <VerificationPage />
            )}
          </Suspense>
        </main>
      </div>

      {/* Shared Footer */}
      <footer className="border-t border-[#1F242F] bg-[#171A21]/20 py-6 text-center text-xs text-[#9CA3AF]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; {new Date().getFullYear()} CyberQuest. Defensive Security Learning Platform.</p>
          <div className="flex gap-4">
            <button 
              onClick={() => handleNavigate('verify')} 
              className="hover:text-[#F3F4F6] transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs text-[#9CA3AF] font-sans"
            >
              Verify Certificate
            </button>
            <a href="#" className="hover:text-[#F3F4F6] transition-colors">Documentation</a>
            <a href="#" className="hover:text-[#F3F4F6] transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster theme="dark" position="bottom-right" richColors closeButton />
    </AuthProvider>
  );
}
