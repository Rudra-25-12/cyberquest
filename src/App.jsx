/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import { Shield } from 'lucide-react';

const PhishingDetectivePage = lazy(() => import('./pages/PhishingDetectivePage'));
const SecurityFundamentalsPage = lazy(() => import('./pages/SecurityFundamentalsPage'));
const AiChallengeLabPage = lazy(() => import('./pages/AiChallengeLabPage'));
const OwaspPage = lazy(() => import('./pages/OwaspPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

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
      const saved = localStorage.getItem('cyberquest_current_view');
      const validViews = ['dashboard', 'phishing-detective', 'security-fundamentals', 'ai-challenge-lab', 'owasp', 'profile'];
      if (saved && validViews.includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return 'dashboard';
  });
  const [toast, setToast] = useState(null);

  // Helper to trigger floating toast alerts
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleNavigate = (view) => {
    console.log("[App] currentView before transition:", currentView);
    console.log("[App] Navigating to view:", view);
    setCurrentView(view);
    console.log("[App] currentView after transition scheduled:", view);
    try {
      localStorage.setItem('cyberquest_current_view', view);
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger toast alert if auth/sync errors occur
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error]);

  // Reset to dashboard if user logs out
  useEffect(() => {
    if (!user) {
      setCurrentView('dashboard');
      try {
        localStorage.setItem('cyberquest_current_view', 'dashboard');
      } catch (e) {
        console.error(e);
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

  // 2. Unauthenticated state: Force Product Landing / LoginPage
  if (!user) {
    return (
      <>
        <LoginPage onShowToast={showToast} />
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
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
          onShowToast={showToast} 
        />
        
        <main className="pb-12">
          <Suspense fallback={<ModuleLoader />}>
            {currentView === 'dashboard' && (
              <DashboardPage onNavigate={handleNavigate} onShowToast={showToast} />
            )}
            {currentView === 'phishing-detective' && (
              <PhishingDetectivePage onShowToast={showToast} />
            )}
            {currentView === 'security-fundamentals' && (
              <SecurityFundamentalsPage onShowToast={showToast} />
            )}
            {currentView === 'ai-challenge-lab' && (
              <AiChallengeLabPage onShowToast={showToast} />
            )}
            {currentView === 'owasp' && (
              <OwaspPage onShowToast={showToast} />
            )}
            {currentView === 'profile' && (
              <ProfilePage onShowToast={showToast} />
            )}
          </Suspense>
        </main>
      </div>

      {/* Shared Footer */}
      <footer className="border-t border-[#1F242F] bg-[#171A21]/20 py-6 text-center text-xs text-[#9CA3AF]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; {new Date().getFullYear()} CyberQuest. Defensive Security Learning Platform.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#F3F4F6] transition-colors">Documentation</a>
            <a href="#" className="hover:text-[#F3F4F6] transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {/* Floating Notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
