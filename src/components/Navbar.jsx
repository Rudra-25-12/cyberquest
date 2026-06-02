import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Menu, X, LogOut, User, LayoutDashboard, Terminal, Mail, ShieldCheck } from 'lucide-react';

/**
 * Navbar Component.
 * @param {Object} props
 * @param {string} props.currentView - The current route state ('dashboard' | 'profile')
 * @param {function(string):void} props.onNavigate - Navigation route updater
 * @param {function(string, string):void} props.onShowToast - Toast trigger callback
 */
export default function Navbar({ currentView, onNavigate, onShowToast }) {
  const { user, userProfile, logout, isFallbackMode } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      onShowToast('Logged out successfully.', 'info');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to log out.', 'error');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'security-fundamentals', label: 'Security Fundamentals', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'phishing-detective', label: 'Phishing Detective', icon: <Mail className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <nav className="border-b border-[#1F242F] bg-[#171A21] text-[#F3F4F6] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Nav Items */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onNavigate('dashboard')} 
              className="flex items-center gap-2 cursor-pointer focus:outline-none"
            >
              <Shield className="w-6 h-6 text-[#3B82F6]" />
              <span className="font-bold tracking-tight text-lg">
                CYBER<span className="text-[#3B82F6]">QUEST</span>
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    currentView === item.id
                      ? 'bg-[#0F1115] text-[#3B82F6] border border-[#1F242F]'
                      : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#242936]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Fallback Mode Indicator */}
            {isFallbackMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                <Terminal className="w-3 h-3" /> MOCK AUTH
              </span>
            )}

            {/* Level Indicator */}
            {userProfile && (
              <div className="text-xs font-semibold px-2.5 py-1 rounded bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">
                Lvl {userProfile.level}
              </div>
            )}

            {/* User Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#171A21] focus:ring-[#3B82F6] cursor-pointer"
              >
                <img
                  className="h-8 w-8 rounded-full border border-[#1F242F] object-cover"
                  src={user?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback'}
                  alt={user?.displayName || 'Avatar'}
                  onError={(e) => {
                    e.target.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=avatar';
                  }}
                />
              </button>

              {dropdownOpen && (
                <>
                  {/* Backdrop overlay for closing */}
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                  
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-[#171A21] border border-[#1F242F] shadow-lg py-1 z-20 origin-top-right">
                    <div className="px-4 py-2 border-b border-[#1F242F] text-xs">
                      <p className="font-semibold text-[#F3F4F6] truncate">{userProfile?.displayName || user?.displayName}</p>
                      <p className="text-[#9CA3AF] truncate mt-0.5">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#242936] text-left transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      Your Profile
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#EF4444] hover:bg-[#EF4444]/10 text-left transition-colors cursor-pointer border-t border-[#1F242F]"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="-mr-2 flex items-center md:hidden gap-3">
            {isFallbackMode && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                MOCK
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#242936] focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1F242F] bg-[#171A21] px-2 pt-2 pb-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium transition-colors cursor-pointer ${
                currentView === item.id
                  ? 'bg-[#0F1115] text-[#3B82F6] border border-[#1F242F]'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#242936]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <div className="border-t border-[#1F242F] pt-4 mt-4 px-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img
                className="h-10 w-10 rounded-full border border-[#1F242F] object-cover"
                src={user?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback'}
                alt="Avatar"
              />
              <div>
                <p className="text-sm font-semibold text-[#F3F4F6]">{userProfile?.displayName || user?.displayName}</p>
                <p className="text-xs text-[#9CA3AF]">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/20 text-[#EF4444] font-medium px-4 py-2 rounded-md transition-colors text-sm cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
