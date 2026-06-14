import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Shield, Menu, X, LogOut, User, LayoutDashboard, Terminal, Mail, ShieldCheck, Sparkles, Key, Award, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from './ui/DropdownMenu';
import { Avatar, AvatarImage, AvatarFallback } from './ui/Avatar';

/**
 * Navbar Component.
 * @param {Object} props
 * @param {string} props.currentView - The current route state ('dashboard' | 'profile')
 * @param {function(string):void} props.onNavigate - Navigation route updater
 */
export default function Navbar({ currentView, onNavigate }) {
  const { user, userProfile, logout, isFallbackMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getFallbackInitials = (name) => {
    if (!name) return 'C';
    return name.trim().charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('Logged out successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to log out.');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'security-fundamentals', label: 'Security Fundamentals', shortLabel: 'Fundamentals', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'phishing-detective', label: 'Phishing Detective', shortLabel: 'Phishing', icon: <Mail className="w-4 h-4" /> },
    { id: 'owasp', label: 'OWASP Defenses', shortLabel: 'OWASP', icon: <Key className="w-4 h-4" /> },
    { id: 'ai-challenge-lab', label: 'AI Challenge Lab', shortLabel: 'AI Lab', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', shortLabel: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  const renderDropdownContent = (alignVal = 'end') => (
    <DropdownMenuContent className="w-[260px] mt-2 z-50" align={alignVal} sideOffset={8}>
      <DropdownMenuLabel className="font-normal">
        <div className="flex items-center gap-3 px-1 py-1.5 text-xs">
          <Avatar className="h-9 w-9 border border-[#1F242F] flex-shrink-0">
            <AvatarImage 
              src={userProfile?.photoURL || user?.photoURL} 
              alt={userProfile?.displayName || user?.displayName || 'Avatar'} 
              className="object-cover"
            />
            <AvatarFallback className="text-xs bg-[#0F1115] text-[#3B82F6]">
              {getFallbackInitials(userProfile?.displayName || user?.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-[#F3F4F6] truncate">
              {userProfile?.displayName || user?.displayName}
            </span>
            <span className="text-[#9CA3AF] truncate mt-0.5 break-all" title={user?.email}>
              {user?.email}
            </span>
          </div>
        </div>
      </DropdownMenuLabel>
      
      <DropdownMenuSeparator />
      
      <DropdownMenuItem
        onSelect={() => {
          onNavigate('profile');
        }}
        className="gap-2 h-11 sm:h-auto"
      >
        <User className="w-4 h-4 text-[#9CA3AF]" />
        <span>Profile</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onSelect={() => {
          localStorage.setItem('cyberquest_scroll_to_certificates', 'true');
          onNavigate('profile');
        }}
        className="gap-2 h-11 sm:h-auto"
      >
        <Award className="w-4 h-4 text-[#9CA3AF]" />
        <span>Certificates</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onSelect={() => {
          onNavigate('dashboard');
        }}
        className="gap-2 h-11 sm:h-auto"
      >
        <LayoutDashboard className="w-4 h-4 text-[#9CA3AF]" />
        <span>Dashboard</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        onSelect={() => {
          onNavigate('settings');
        }}
        className="gap-2 h-11 sm:h-auto"
      >
        <Settings className="w-4 h-4 text-[#9CA3AF]" />
        <span>Settings</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onSelect={() => {
          handleLogout();
        }}
        className="gap-2 text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10 focus:text-[#EF4444] focus:bg-[#EF4444]/10 h-11 sm:h-auto"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

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
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="inline lg:hidden">{item.shortLabel}</span>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#171A21] focus:ring-[#3B82F6] cursor-pointer"
                >
                  <Avatar className="h-8 w-8 border border-[#1F242F]">
                    <AvatarImage 
                      src={userProfile?.photoURL || user?.photoURL} 
                      alt={userProfile?.displayName || user?.displayName || 'Avatar'} 
                      className="object-cover"
                    />
                    <AvatarFallback className="text-[10px] bg-[#0F1115] text-[#3B82F6]">
                      {getFallbackInitials(userProfile?.displayName || user?.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              {renderDropdownContent('end')}
            </DropdownMenu>
          </div>

          {/* Mobile hamburger menu & user dropdown toggle */}
          <div className="-mr-2 flex items-center md:hidden gap-3">
            {isFallbackMode && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                MOCK
              </span>
            )}

            {/* Avatar Dropdown on Mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#171A21] focus:ring-[#3B82F6] cursor-pointer"
                >
                  <Avatar className="h-8 w-8 border border-[#1F242F]">
                    <AvatarImage 
                      src={userProfile?.photoURL || user?.photoURL} 
                      alt={userProfile?.displayName || user?.displayName || 'Avatar'} 
                      className="object-cover"
                    />
                    <AvatarFallback className="text-[10px] bg-[#0F1115] text-[#3B82F6]">
                      {getFallbackInitials(userProfile?.displayName || user?.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              {renderDropdownContent('end')}
            </DropdownMenu>

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
              className={`flex w-full items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors cursor-pointer ${
                currentView === item.id
                  ? 'bg-[#0F1115] text-[#3B82F6] border border-[#1F242F]'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#242936]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          
          {/* Explicit mobile equivalents for Certificates and Settings in Drawer */}
          <button
            onClick={() => {
              localStorage.setItem('cyberquest_scroll_to_certificates', 'true');
              onNavigate('profile');
              setMobileMenuOpen(false);
            }}
            className={`flex w-full items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors cursor-pointer ${
              currentView === 'profile' && localStorage.getItem('cyberquest_scroll_to_certificates') === 'true'
                ? 'bg-[#0F1115] text-[#3B82F6] border border-[#1F242F]'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#242936]'
            }`}
          >
            <Award className="w-4 h-4 text-[#9CA3AF]" />
            <span>Certificates</span>
          </button>
          <button
            onClick={() => {
              onNavigate('settings');
              setMobileMenuOpen(false);
            }}
            className={`flex w-full items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors cursor-pointer ${
              currentView === 'settings'
                ? 'bg-[#0F1115] text-[#3B82F6] border border-[#1F242F]'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#242936]'
            }`}
          >
            <Settings className="w-4 h-4 text-[#9CA3AF]" />
            <span>Settings</span>
          </button>

          <div className="border-t border-[#1F242F] pt-4 mt-4 px-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-[#1F242F] flex-shrink-0">
                <AvatarImage 
                  src={userProfile?.photoURL || user?.photoURL} 
                  alt={userProfile?.displayName || user?.displayName || 'Avatar'} 
                  className="object-cover"
                />
                <AvatarFallback className="text-sm bg-[#0F1115] text-[#3B82F6]">
                  {getFallbackInitials(userProfile?.displayName || user?.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#F3F4F6] truncate max-w-[220px]">{userProfile?.displayName || user?.displayName}</p>
                <p className="text-xs text-[#9CA3AF] break-all max-w-[220px]">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/20 text-[#EF4444] font-medium px-4 py-3 rounded-md transition-colors text-sm cursor-pointer"
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
