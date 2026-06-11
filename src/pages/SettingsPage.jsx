/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useAuth, getRankTitle } from '../context/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Switch } from '../components/ui/Switch';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/Avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../components/ui/Dialog';
import { getStorageKey } from '../utils/storage';
import { toast } from 'sonner';
import { 
  User, 
  Settings, 
  ShieldAlert, 
  Save, 
  FileDown, 
  FileUp, 
  RotateCcw, 
  Shield, 
  ExternalLink, 
  Mail, 
  Calendar,
  Terminal,
  LifeBuoy
} from 'lucide-react';

export default function SettingsPage() {
  const { user, userProfile, updateProfile } = useAuth();
  
  // Account tab states
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync profile details when loaded
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setBio(userProfile.bio || '');
      setAvatarUrl(userProfile.photoURL || '');
    }
  }, [userProfile]);

  // Preferences tab states
  const prefKey = user ? `cyberquest_preferences_${user.uid}` : 'cyberquest_preferences_guest';
  const [prefs, setPrefs] = useState({
    achievementToasts: true,
    certificateNotifications: true,
    dailyGoalReminders: true,
    progressAnimations: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(prefKey);
      if (saved) {
        setPrefs(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load preferences:', e);
    }
  }, [prefKey]);

  const handleTogglePref = (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      localStorage.setItem(prefKey, JSON.stringify(updated));
      toast.success('Preference updated!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save preference.');
    }
  };

  // Data Management tab states
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const getFallbackInitials = (name) => {
    if (!name) return 'C';
    return name.trim().charAt(0).toUpperCase();
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limit to 5 MB (5 * 1024 * 1024 bytes)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('Image must be smaller than 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 512;
        canvas.width = size;
        canvas.height = size;

        // Center crop and resize to 512x512
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        // Compress and encode as JPEG at 0.75 quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
        setAvatarUrl(compressedBase64);
        toast.success('Avatar updated! Save changes to persist.');
      };
      img.onerror = () => {
        toast.error('Invalid image file.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  // Account Save function
  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty.');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        photoURL: avatarUrl.trim() || null
      });
      toast.success('Account settings updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update account settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Export Data function
  const handleExportData = () => {
    if (!user || !userProfile) return;
    try {
      const keyPhishing = getStorageKey('cyberquest_phishing_answers', user.uid);
      const keyFundamentals = getStorageKey('cyberquest_fundamentals_answers', user.uid);
      const keyAiAnswers = getStorageKey('cyberquest_ai_answers', user.uid);
      const keyAiHistory = getStorageKey('cyberquest_ai_history', user.uid);
      const keyOwasp = getStorageKey('cyberquest_owasp_answers', user.uid);

      const phishingAnswers = JSON.parse(localStorage.getItem(keyPhishing) || '{}');
      const fundamentalsAnswers = JSON.parse(localStorage.getItem(keyFundamentals) || '{}');
      const aiAnswers = JSON.parse(localStorage.getItem(keyAiAnswers) || '{}');
      const aiHistory = JSON.parse(localStorage.getItem(keyAiHistory) || '[]');
      const owaspAnswers = JSON.parse(localStorage.getItem(keyOwasp) || '{}');

      const exportObj = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        profile: {
          displayName: userProfile.displayName,
          bio: userProfile.bio,
          photoURL: userProfile.photoURL,
          role: userProfile.role,
        },
        progression: {
          xp: userProfile.xp,
          level: userProfile.level,
          xpNeeded: userProfile.xpNeeded,
          badges: userProfile.badges || [],
          certificates: userProfile.certificates || [],
          activities: userProfile.activities || [],
        },
        progressData: {
          phishingAnswers,
          fundamentalsAnswers,
          aiAnswers,
          aiHistory,
          owaspAnswers
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `cyberquest_backup_${user.uid}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('User data exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export user data.');
    }
  };

  // Import Data function
  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Basic schema validation
        if (!data.profile || !data.progression || !data.progressData) {
          toast.error('Invalid backup file format.');
          return;
        }

        const keyPhishing = getStorageKey('cyberquest_phishing_answers', user.uid);
        const keyFundamentals = getStorageKey('cyberquest_fundamentals_answers', user.uid);
        const keyAiAnswers = getStorageKey('cyberquest_ai_answers', user.uid);
        const keyAiHistory = getStorageKey('cyberquest_ai_history', user.uid);
        const keyOwasp = getStorageKey('cyberquest_owasp_answers', user.uid);

        if (data.progressData.phishingAnswers) {
          localStorage.setItem(keyPhishing, JSON.stringify(data.progressData.phishingAnswers));
        }
        if (data.progressData.fundamentalsAnswers) {
          localStorage.setItem(keyFundamentals, JSON.stringify(data.progressData.fundamentalsAnswers));
        }
        if (data.progressData.aiAnswers) {
          localStorage.setItem(keyAiAnswers, JSON.stringify(data.progressData.aiAnswers));
        }
        if (data.progressData.aiHistory) {
          localStorage.setItem(keyAiHistory, JSON.stringify(data.progressData.aiHistory));
        }
        if (data.progressData.owaspAnswers) {
          localStorage.setItem(keyOwasp, JSON.stringify(data.progressData.owaspAnswers));
        }

        await updateProfile({
          displayName: data.profile.displayName,
          bio: data.profile.bio,
          photoURL: data.profile.photoURL,
          role: data.profile.role,
          xp: data.progression.xp,
          level: data.progression.level,
          xpNeeded: data.progression.xpNeeded,
          badges: data.progression.badges,
          certificates: data.progression.certificates,
          activities: data.progression.activities,
        });

        toast.success('User data imported successfully! Refreshing...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        console.error(err);
        toast.error('Failed to parse file or restore data.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Clear file input
  };

  // Reset Progress function
  const handleResetProgress = async () => {
    if (!user || !userProfile) return;
    try {
      const keyPhishing = getStorageKey('cyberquest_phishing_answers', user.uid);
      const keyFundamentals = getStorageKey('cyberquest_fundamentals_answers', user.uid);
      const keyAiAnswers = getStorageKey('cyberquest_ai_answers', user.uid);
      const keyAiHistory = getStorageKey('cyberquest_ai_history', user.uid);
      const keyOwasp = getStorageKey('cyberquest_owasp_answers', user.uid);

      localStorage.removeItem(keyPhishing);
      localStorage.removeItem(keyFundamentals);
      localStorage.removeItem(keyAiAnswers);
      localStorage.removeItem(keyAiHistory);
      localStorage.removeItem(keyOwasp);

      await updateProfile({
        xp: 25,
        level: 1,
        xpNeeded: 100,
        badges: ['Initiate'],
        certificates: [],
        activities: [
          {
            id: `reset-${Date.now()}`,
            type: 'badge_unlock',
            title: 'Account Reset',
            description: 'Your progress and achievements were reset to initial state.',
            timestamp: new Date().toISOString()
          }
        ]
      });

      setResetDialogOpen(false);
      toast.success('Your progress has been reset successfully! Refreshing...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error('Failed to reset progress.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const renderToggle = (key, label, description) => (
    <div 
      role="button"
      tabIndex={0}
      onClick={() => handleTogglePref(key)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleTogglePref(key);
        }
      }}
      className="flex items-center justify-between p-4 bg-[#0F1115] border border-[#1F242F] hover:border-[#3B82F6]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#171A21] rounded-lg cursor-pointer transition-all duration-200 group select-none outline-none"
    >
      <div className="flex flex-col gap-0.5 max-w-[80%]">
        <span className="text-sm font-semibold text-[#F3F4F6] group-hover:text-white transition-colors">{label}</span>
        <span className="text-xs text-[#9CA3AF] leading-relaxed">{description}</span>
      </div>
      <Switch
        checked={prefs[key]}
        onCheckedChange={() => {}}
        tabIndex={-1}
        aria-label={label}
        className="flex-shrink-0 ml-4 pointer-events-none"
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      
      {/* Page Header */}
      <div className="border-b border-[#1F242F] pb-5">
        <h1 className="text-2xl font-extrabold text-[#F3F4F6] tracking-tight">Settings</h1>
        <p className="text-[#9CA3AF] text-xs mt-0.5">Customize your learning environment and manage your profile data.</p>
      </div>

      {/* Tabs Container */}
      <Tabs defaultValue="account" className="w-full">
        
        {/* Tabs navigation */}
        <TabsList className="w-full sm:w-auto grid grid-cols-4 max-w-xl mb-8">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        {/* Tab 1: Account Tab */}
        <TabsContent value="account" className="flex flex-col gap-6 animate-fadeIn">
          <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4">
            <h3 className="font-bold text-sm text-[#F3F4F6] flex items-center gap-2 border-b border-[#1F242F]/60 pb-3 uppercase tracking-wider select-none">
              <User className="w-4 h-4 text-[#3B82F6]" /> Account Details
            </h3>

            <form onSubmit={handleSaveAccount} className="flex flex-col gap-5 mt-2">
              {/* Profile Avatar and Info Card */}
              <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-[#1F242F]/60 pb-5 select-none">
                <Avatar className="w-20 h-20 border border-[#1F242F] flex-shrink-0">
                  <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                  <AvatarFallback className="text-2xl font-bold bg-[#0F1115] text-[#3B82F6]">
                    {getFallbackInitials(displayName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2.5">
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-base font-bold text-[#F3F4F6]">{displayName || 'Guest Cadet'}</h4>
                    <p className="text-xs text-[#9CA3AF]">
                      {getRankTitle(userProfile?.level || 1)} &bull; Level {userProfile?.level || 1}
                    </p>
                  </div>
                  
                  <label className="inline-flex items-center gap-1.5 bg-[#0F1115] hover:bg-[#1F242F] text-[#F3F4F6] border border-[#1F242F] hover:border-[#3B82F6]/30 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer">
                    <FileUp className="w-3.5 h-3.5 text-[#3B82F6]" /> Change Photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="displayName" className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-[#0F1115] border border-[#1F242F] rounded-md px-3 py-2 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#3B82F6] transition-colors w-full"
                  placeholder="e.g. Cadet Rudra"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="bio" className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                  Biography / Learning Goals
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-[#0F1115] border border-[#1F242F] rounded-md px-3 py-2 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#3B82F6] transition-colors w-full resize-none"
                  placeholder="Share your cybersecurity study goals or bio..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-[#1F242F]/60 pt-4 mt-2">
                <div className="flex items-center gap-3 text-xs text-[#9CA3AF] font-mono">
                  <Mail className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                  <div>
                    <span className="text-[#6B7280] block text-[9px] uppercase tracking-wider font-bold">Email Address</span>
                    <span className="text-[#F3F4F6] font-semibold">{user?.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#9CA3AF] font-mono">
                  <Calendar className="w-4 h-4 text-[#6B7280] flex-shrink-0" />
                  <div>
                    <span className="text-[#6B7280] block text-[9px] uppercase tracking-wider font-bold">Joined Date</span>
                    <span className="text-[#F3F4F6] font-semibold">{formatDate(userProfile?.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-2 border-t border-[#1F242F]/40 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </TabsContent>

        {/* Tab 2: Preferences Tab */}
        <TabsContent value="preferences" className="flex flex-col gap-6 animate-fadeIn">
          <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4">
            <h3 className="font-bold text-sm text-[#F3F4F6] flex items-center gap-2 border-b border-[#1F242F]/60 pb-3 uppercase tracking-wider select-none">
              <Settings className="w-4 h-4 text-[#3B82F6]" /> User Preferences
            </h3>
            
            <div className="flex flex-col gap-4 mt-2">
              {renderToggle(
                'achievementToasts', 
                'Achievement Toasts', 
                'Show popup alerts instantly when you unlock new badges.'
              )}
              {renderToggle(
                'certificateNotifications', 
                'Certificate Notifications', 
                'Show success alerts when new certificates are generated.'
              )}
              {renderToggle(
                'dailyGoalReminders', 
                'Daily Goal Reminders', 
                'Prompt reminders to encourage daily cyber challenge practices.'
              )}
              {renderToggle(
                'progressAnimations', 
                'Progress Animations', 
                'Enable smooth graphic rendering and transitions inside progress tracks.'
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Data Management Tab */}
        <TabsContent value="data" className="flex flex-col gap-6 animate-fadeIn">
          <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4">
            <h3 className="font-bold text-sm text-[#F3F4F6] flex items-center gap-2 border-b border-[#1F242F]/60 pb-3 uppercase tracking-wider select-none">
              <ShieldAlert className="w-4 h-4 text-[#EF4444]" /> Data Management
            </h3>

            <p className="text-xs text-[#9CA3AF] leading-relaxed mt-1">
              Backup your platform achievements, module status records, and certifications. You can restore your profile status by uploading your data file.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              {/* Export Card */}
              <div className="p-4 bg-[#0F1115] border border-[#1F242F] rounded-lg flex flex-col gap-3 justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#F3F4F6]">Export Data</h4>
                  <p className="text-[11px] text-[#9CA3AF] mt-1 leading-relaxed">
                    Download profile data, completed answers, earned badges, and certificates as a JSON file.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="inline-flex items-center justify-center gap-2 bg-[#0F1115] hover:bg-[#1F242F] text-[#F3F4F6] border border-[#1F242F] hover:border-[#3B82F6]/30 px-3.5 py-2 rounded text-xs font-semibold transition-all cursor-pointer"
                >
                  <FileDown className="w-4 h-4" /> Export User Data
                </button>
              </div>

              {/* Import Card */}
              <div className="p-4 bg-[#0F1115] border border-[#1F242F] rounded-lg flex flex-col gap-3 justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#F3F4F6]">Import Data</h4>
                  <p className="text-[11px] text-[#9CA3AF] mt-1 leading-relaxed">
                    Upload a previously exported JSON backup file to restore your entire progress history.
                  </p>
                </div>
                <label className="inline-flex items-center justify-center gap-2 bg-[#0F1115] hover:bg-[#1F242F] text-[#F3F4F6] border border-[#1F242F] hover:border-[#3B82F6]/30 px-3.5 py-2 rounded text-xs font-semibold transition-all cursor-pointer text-center">
                  <FileUp className="w-4 h-4" /> Import User Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Reset Progress Row */}
            <div className="border-t border-[#1F242F]/60 pt-5 mt-4 flex items-center justify-between flex-wrap gap-4">
              <div className="max-w-md">
                <h4 className="text-sm font-semibold text-[#EF4444] uppercase tracking-tight">Reset Progress</h4>
                <p className="text-[11px] text-[#9CA3AF] mt-1 leading-relaxed">
                  Permanently delete all quiz completion records, certificates, badges, and XP. This action is irreversible.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetDialogOpen(true)}
                className="inline-flex items-center gap-2 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/25 hover:border-[#EF4444]/40 text-[#EF4444] px-4 py-2.5 rounded text-xs font-semibold transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Reset Progress
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: About Tab */}
        <TabsContent value="about" className="flex flex-col gap-6 animate-fadeIn">
          <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4">
            <h3 className="font-bold text-sm text-[#F3F4F6] flex items-center gap-2 border-b border-[#1F242F]/60 pb-3 uppercase tracking-wider select-none">
              <Shield className="w-4 h-4 text-[#3B82F6]" /> About CyberQuest
            </h3>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-baseline justify-between border-b border-[#1F242F]/40 pb-2">
                <span className="text-xs text-[#9CA3AF] font-semibold">Platform Version</span>
                <span className="text-xs text-[#3B82F6] font-mono font-bold">v1.2.4</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider font-mono">Platform Description</span>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  CyberQuest is an interactive, hands-on defensive security learning platform. It is designed to teach vital defensive skills including phishing analysis, security fundamentals, secure software development practices, and OWASP Top 10 vulnerabilities defense through real-time challenge sandboxes and AI-assisted challenge validation.
                </p>
              </div>

              {/* Resource Links Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#1F242F]/60 pt-5 mt-2">
                <a
                  href="#"
                  className="flex items-center justify-between p-3.5 bg-[#0F1115] border border-[#1F242F] hover:border-[#3B82F6]/30 rounded-lg text-xs text-[#F3F4F6] hover:text-[#3B82F6] font-semibold transition-all"
                >
                  <span className="flex items-center gap-2">
                    <LifeBuoy className="w-4 h-4" /> Platform Documentation
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 bg-[#0F1115] border border-[#1F242F] hover:border-[#3B82F6]/30 rounded-lg text-xs text-[#F3F4F6] hover:text-[#3B82F6] font-semibold transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> GitHub Repository
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="#"
                  className="flex items-center justify-between p-3.5 bg-[#0F1115] border border-[#1F242F] hover:border-[#EF4444]/30 rounded-lg text-xs text-[#F3F4F6] hover:text-[#EF4444] font-semibold transition-all"
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#EF4444]" /> Report Platform Bug
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </TabsContent>

      </Tabs>

      {/* Reset Progress Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#EF4444]">
              <ShieldAlert className="w-5 h-5" /> Confirm Progress Reset
            </DialogTitle>
            <DialogDescription className="text-[#9CA3AF] text-xs leading-relaxed mt-2">
              Are you absolutely sure you want to reset your progress? This will permanently erase all XP, levels, unlocked badges, certificates, and completed answers. You cannot undo this action.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 mt-4 justify-end">
            <DialogClose asChild>
              <button
                type="button"
                className="bg-[#0F1115] hover:bg-[#1F242F] text-[#F3F4F6] border border-[#1F242F] px-4 py-2.5 rounded text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="button"
              onClick={handleResetProgress}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white border border-[#EF4444]/10 px-4 py-2.5 rounded text-xs font-semibold transition-all cursor-pointer"
            >
              Yes, Reset Everything
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
