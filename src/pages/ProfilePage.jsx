import { useState } from 'react';
import { useAuth, calculateLevelProgress } from '../context/AuthContext';
import { Award, Mail, Calendar, User, Save, ShieldAlert, BadgeCheck } from 'lucide-react';

/**
 * ProfilePage Component.
 * @param {Object} props
 * @param {function(string, string):void} props.onShowToast - Notification callback
 */
export default function ProfilePage({ onShowToast }) {
  const { user, userProfile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const xp = userProfile?.xp || 0;
  const { level, maxXp, percent } = calculateLevelProgress(xp);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      onShowToast('Display name cannot be empty.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim()
      });
      onShowToast('Profile updated successfully!', 'success');
    } catch (err) {
      onShowToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // List of all achievements/badges in the platform
  const badgesList = [
    {
      id: 'Initiate',
      title: 'Initiate Cadet',
      desc: 'Started your cybersecurity training on CyberQuest.',
      earned: userProfile?.badges?.includes('Initiate') || false,
    },
    {
      id: 'FirstInvestigation',
      title: 'First Investigation',
      desc: 'Completed your first phishing analysis lab.',
      earned: userProfile?.badges?.includes('FirstInvestigation') || false,
    },
    {
      id: 'PhishingInvestigator',
      title: 'Phishing Investigator',
      desc: 'Scored 8/10 or higher in the Phishing Detective lab.',
      earned: userProfile?.badges?.includes('PhishingInvestigator') || false,
    },
    {
      id: 'PerfectAnalyst',
      title: 'Perfect Analyst',
      desc: 'Scored a perfect 10/10 in the Phishing Detective lab.',
      earned: userProfile?.badges?.includes('PerfectAnalyst') || false,
    },
    {
      id: 'FundamentalsGraduate',
      title: 'Fundamentals Graduate',
      desc: 'Scored 8/10 or higher in the Security Fundamentals lab.',
      earned: userProfile?.badges?.includes('FundamentalsGraduate') || false,
    },
    {
      id: 'SecurityGuardian',
      title: 'Security Guardian',
      desc: 'Scored a perfect 10/10 in the Security Fundamentals lab.',
      earned: userProfile?.badges?.includes('SecurityGuardian') || false,
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header */}
      <div className="border-b border-[#1F242F] pb-6 mb-8">
        <h1 className="text-3xl font-extrabold text-[#F3F4F6] tracking-tight">Your Profile</h1>
        <p className="text-[#9CA3AF] text-sm mt-1">Manage your details and view your completed achievements.</p>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Account Details Summary */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* User Bio Card */}
          <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4 text-center items-center">
            <div className="relative">
              <img
                className="w-24 h-24 rounded-full border border-[#1F242F] object-cover bg-[#0F1115]"
                src={user?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=profile'}
                alt="Avatar"
                onError={(e) => {
                  e.target.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=profile';
                }}
              />
              <span className="absolute bottom-0 right-0 inline-flex items-center justify-center bg-[#3B82F6] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[#171A21]">
                LVL {level}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#F3F4F6]">{userProfile?.displayName || user?.displayName || 'Cyber Cadet'}</h2>
              <p className="text-xs text-[#3B82F6] font-semibold mt-0.5 uppercase tracking-wide">{userProfile?.role || 'Security Student'}</p>
            </div>

            <p className="text-xs text-[#9CA3AF] leading-relaxed italic border-t border-[#1F242F] pt-4 w-full">
              "{userProfile?.bio || 'No biography details provided yet.'}"
            </p>

            <div className="w-full flex flex-col gap-3 text-xs text-[#9CA3AF] border-t border-[#1F242F] pt-4 text-left font-mono">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                <span>Joined: {formatDate(userProfile?.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* XP Progress Card */}
          <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4">
            <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Level Progress</h3>
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-bold text-[#F3F4F6]">Level {level}</span>
              <span className="text-xs text-[#9CA3AF] font-mono">{xp} / {maxXp} XP</span>
            </div>
            <div className="w-full bg-[#0F1115] h-2 rounded-full overflow-hidden border border-[#1F242F]">
              <div 
                className="bg-[#3B82F6] h-full rounded-full transition-all duration-500" 
                style={{ width: `${percent}%` }}
              ></div>
            </div>
            {level < 5 ? (
              <span className="text-[10px] text-[#9CA3AF]">
                Earn {maxXp - xp} more XP to reach Level {level + 1}
              </span>
            ) : (
              <span className="text-[10px] text-[#22C55E] font-semibold">
                Maximum Level Achieved!
              </span>
            )}
          </div>
        </div>

        {/* Right Columns: Edit Form + Achievements */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          
          {/* Edit Profile Form */}
          <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4">
            <h3 className="font-bold text-lg text-[#F3F4F6] flex items-center gap-2">
              <User className="w-5 h-5 text-[#3B82F6]" /> Profile Details
            </h3>

            <form onSubmit={handleUpdate} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="displayName" className="text-xs font-semibold text-[#9CA3AF]">
                  Public Name
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
                <label htmlFor="bio" className="text-xs font-semibold text-[#9CA3AF]">
                  Biography / Learning Goal
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-[#0F1115] border border-[#1F242F] rounded-md px-3 py-2 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#3B82F6] transition-colors w-full resize-none"
                  placeholder="Share a short bio or security study goal..."
                />
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-md text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Achievements Cards */}
          <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4">
            <h3 className="font-bold text-lg text-[#F3F4F6] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#22C55E]" /> Achievements & Badges
            </h3>
            <p className="text-xs text-[#9CA3AF] -mt-1 leading-relaxed">
              These badges show which labs and security challenges you have completed.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              {badgesList.map((badge) => (
                <div
                  key={badge.id}
                  className={`border p-4 rounded-lg flex flex-col gap-3 transition-colors ${
                    badge.earned
                      ? 'bg-[#171A21] border-[#22C55E]/20 text-[#F3F4F6]'
                      : 'bg-[#171A21]/40 border-[#1F242F]/60 text-[#9CA3AF] opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className={`p-1.5 rounded-md ${badge.earned ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#0F1115] text-[#9CA3AF]'}`}>
                      <Award className="w-5 h-5" />
                    </div>
                    {badge.earned ? (
                      <BadgeCheck className="w-4 h-4 text-[#22C55E]" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-[#9CA3AF]" />
                    )}
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm ${badge.earned ? 'text-[#F3F4F6]' : 'text-[#9CA3AF]'}`}>
                      {badge.title}
                    </h4>
                    <p className="text-xs text-[#9CA3AF] mt-1 leading-snug">
                      {badge.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
