import { useState, useEffect, useRef } from 'react';
import { useAuth, calculateLevelProgress } from '../context/AuthContext';
import { Award, Mail, Calendar, User, Save, ShieldAlert, BadgeCheck, FileText, Download, Eye, X } from 'lucide-react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../components/ui/HoverCard';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Progress } from '../components/ui/Progress';

/**
 * Reusable Certificate Template Component (Single Source of Truth).
 */
function CertificateTemplate({ cert, userProfile, isExport = false }) {
  const dateFormatted = new Date(cert.issuedAt).toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div 
      className={`relative w-full bg-[#171A21] border border-[#1F242F] rounded-lg flex flex-col items-center justify-between text-center overflow-hidden font-sans select-none
        ${isExport ? 'p-12 h-full' : 'p-6 sm:p-8 aspect-[4/3] max-h-[50vh] sm:max-h-[55vh] md:max-h-[60vh]'}`}
      style={isExport ? { width: '1200px', height: '900px' } : {}}
    >
      {/* Accent border frame line */}
      <div className={`absolute border border-[#3B82F6]/30 rounded pointer-events-none ${isExport ? 'inset-6' : 'inset-3 sm:inset-4'}`}></div>

      {/* Logo & Seal Top Row */}
      <div className="flex items-center justify-between w-full border-b border-[#1F242F]/60 pb-3 z-10">
        <div className={`font-extrabold text-[#3B82F6] tracking-widest uppercase ${isExport ? 'text-lg' : 'text-xs sm:text-sm'}`}>
          CYBER<span className="text-[#F3F4F6]">QUEST</span>
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#22C55E]/15 bg-[#22C55E]/2 text-[#22C55E] font-mono uppercase tracking-wider font-medium ${isExport ? 'text-[10px]' : 'text-[8px] sm:text-[9px]'}`}>
          <BadgeCheck className={isExport ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5 sm:w-3 sm:h-3'} /> CYBERQUEST VERIFIED
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1 z-10">
        <h3 className={`text-[#9CA3AF] uppercase tracking-widest font-mono font-semibold ${isExport ? 'text-sm' : 'text-[9px] sm:text-[10px]'}`}>
          Certificate of Completion
        </h3>
        <span className={`text-[#9CA3AF] italic font-serif ${isExport ? 'text-base' : 'text-[10px] sm:text-xs'}`}>
          This certificate is proudly awarded to
        </span>
      </div>

      {/* Learner Name */}
      <div className="z-10">
        <h2 className={`font-extrabold text-white tracking-wide uppercase ${isExport ? 'text-4xl mt-2' : 'text-xl sm:text-2xl md:text-3xl'}`}>
          {userProfile?.displayName || 'Cyber Cadet'}
        </h2>
      </div>

      {/* Professional Statement */}
      <p className={`text-[#9CA3AF] max-w-md mx-auto leading-relaxed z-10 ${isExport ? 'text-sm px-6' : 'text-[9px] sm:text-[10px] px-2'}`}>
        has met all required standards and successfully demonstrated proficiency in the curriculum of
      </p>

      {/* Module Completed */}
      <div className="z-10">
        <h1 className={`font-bold text-[#3B82F6] uppercase tracking-tight ${isExport ? 'text-2xl' : 'text-sm sm:text-base md:text-lg'}`}>
          {cert.module}
        </h1>
      </div>

      {/* Score & Status Panel */}
      <div className={`w-full bg-[#0F1115] border border-[#1F242F] rounded-lg grid grid-cols-2 text-center max-w-md z-10 ${isExport ? 'p-4 gap-4' : 'p-2 sm:p-3 gap-2 sm:gap-4'}`}>
        <div className="border-r border-[#1F242F]">
          <span className={`uppercase tracking-wider text-[#6B7280] font-mono block ${isExport ? 'text-xs' : 'text-[8px] sm:text-[9px]'}`}>Final Score</span>
          <span className={`font-bold font-mono text-[#22C55E] ${isExport ? 'text-xl' : 'text-xs sm:text-sm'}`}>{cert.score} / 10</span>
        </div>
        <div>
          <span className={`uppercase tracking-wider text-[#6B7280] font-mono block ${isExport ? 'text-xs' : 'text-[8px] sm:text-[9px]'}`}>Path Status</span>
          <span className={`font-bold font-mono text-[#3B82F6] ${isExport ? 'text-xl' : 'text-xs sm:text-sm'}`}>SECURE</span>
        </div>
      </div>

      {/* Subtle Certification Seal */}
      <div className={`flex flex-col items-center justify-center border border-[#22C55E]/30 bg-[#22C55E]/5 rounded-full select-none z-10
        ${isExport ? 'w-24 h-24' : 'w-14 h-14 sm:w-16 sm:h-16'}`}>
        <BadgeCheck className={`text-[#22C55E] ${isExport ? 'w-8 h-8' : 'w-5 h-5 sm:w-6 sm:h-6'}`} />
        <span className={`font-mono font-bold tracking-wider text-[#22C55E] text-center leading-none ${isExport ? 'text-[8px] mt-1' : 'text-[6px] mt-0.5'}`}>
          CYBERQUEST<br />VERIFIED
        </span>
      </div>

      {/* Metadata */}
      <div className={`grid grid-cols-2 gap-4 w-full border-t border-[#1F242F] z-10 text-left font-mono text-[#9CA3AF] ${isExport ? 'pt-4 text-xs' : 'pt-2 text-[8px] sm:text-[9px]'}`}>
        <div>
          <span className="text-[#6B7280] block uppercase tracking-wider font-semibold">Date Issued</span>
          <span className="text-[#F3F4F6] block">{dateFormatted}</span>
        </div>
        <div className="text-right">
          <span className="text-[#6B7280] block uppercase tracking-wider font-semibold">Certificate ID</span>
          <span className="text-[#3B82F6] font-bold tracking-wider block">{cert.id}</span>
        </div>
      </div>
    </div>
  );
}

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
  const [activeCert, setActiveCert] = useState(null);
  const [exportCert, setExportCert] = useState(null);
  const exportRef = useRef(null);

  useEffect(() => {
    const scrollToCertificates = localStorage.getItem('cyberquest_scroll_to_certificates');
    if (scrollToCertificates) {
      localStorage.removeItem('cyberquest_scroll_to_certificates');
      const element = document.getElementById('earned-certificates-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  const triggerExport = async (cert, format) => {
    setExportCert(cert);
    
    // Give React time to render the off-screen DOM element
    setTimeout(async () => {
      try {
        const element = exportRef.current;
        if (!element) {
          console.error("Export element not found");
          return;
        }

        // Capture with high pixelRatio for 200% zoom crispness
        const dataUrl = await toPng(element, {
          quality: 1.0,
          pixelRatio: 2, // 1200x900 base becomes 2400x1800 for high resolution
          style: {
            transform: 'none',
            opacity: '1',
            visibility: 'visible'
          }
        });

        if (format === 'png') {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `Certificate_${cert.module.replace(/\s+/g, '_')}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else if (format === 'pdf') {
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [2400, 1800],
            compress: true
          });
          pdf.addImage(dataUrl, 'PNG', 0, 0, 2400, 1800, undefined, 'FAST');
          pdf.save(`Certificate_${cert.module.replace(/\s+/g, '_')}.pdf`);
        }
      } catch (error) {
        console.error("Failed to generate export file:", error);
      } finally {
        setExportCert(null);
      }
    }, 200);
  };

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
      requirement: 'Created a CyberQuest account.',
      earned: userProfile?.badges?.includes('Initiate') || false,
    },
    {
      id: 'FirstInvestigation',
      title: 'First Investigation',
      desc: 'Completed your first phishing analysis lab.',
      requirement: 'Complete your first Phishing Detective challenge.',
      earned: userProfile?.badges?.includes('FirstInvestigation') || false,
    },
    {
      id: 'PhishingInvestigator',
      title: 'Phishing Investigator',
      desc: 'Scored 8/10 or higher in the Phishing Detective lab.',
      requirement: 'Score 8/10 or higher in Phishing Detective.',
      earned: userProfile?.badges?.includes('PhishingInvestigator') || false,
    },
    {
      id: 'PerfectAnalyst',
      title: 'Perfect Analyst',
      desc: 'Scored a perfect 10/10 in the Phishing Detective lab.',
      requirement: 'Score 10/10 in Phishing Detective.',
      earned: userProfile?.badges?.includes('PerfectAnalyst') || false,
    },
    {
      id: 'FundamentalsGraduate',
      title: 'Fundamentals Graduate',
      desc: 'Scored 8/10 or higher in the Security Fundamentals lab.',
      requirement: 'Score 8/10 or higher in Security Fundamentals.',
      earned: userProfile?.badges?.includes('FundamentalsGraduate') || false,
    },
    {
      id: 'SecurityGuardian',
      title: 'Security Guardian',
      desc: 'Scored a perfect 10/10 in the Security Fundamentals lab.',
      requirement: 'Score 10/10 in Security Fundamentals.',
      earned: userProfile?.badges?.includes('SecurityGuardian') || false,
    },
    {
      id: 'AIExplorer',
      title: 'AI Explorer',
      desc: 'Generated your first AI challenge using Gemini.',
      requirement: 'Generate your first AI challenge in AI Challenge Lab.',
      earned: userProfile?.badges?.includes('AIExplorer') || false,
    },
    {
      id: 'CertifiedLearner',
      title: 'Certified Learner',
      desc: 'Earned your first training completion certificate on CyberQuest.',
      requirement: 'Earn your first training completion certificate.',
      earned: userProfile?.badges?.includes('CertifiedLearner') || false,
    },
    {
      id: 'OWASPExplorer',
      title: 'OWASP Explorer',
      desc: 'Completed the OWASP Top 10 Defenses learning path.',
      requirement: 'Complete the OWASP Top 10 Defenses path.',
      earned: userProfile?.badges?.includes('OWASPExplorer') || false,
    },
    {
      id: 'ThreatHunter',
      title: 'Threat Hunter',
      desc: 'Scored 8/10 or higher in the OWASP Top 10 Defenses lab.',
      requirement: 'Score 8/10 or higher in OWASP Top 10 Defenses.',
      earned: userProfile?.badges?.includes('ThreatHunter') || false,
    },
    {
      id: 'ApplicationGuardian',
      title: 'Application Guardian',
      desc: 'Scored a perfect 10/10 in the OWASP Top 10 Defenses lab.',
      requirement: 'Score 10/10 in OWASP Top 10 Defenses.',
      earned: userProfile?.badges?.includes('ApplicationGuardian') || false,
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
          <div className="bg-gradient-to-br from-[#1E2330] to-[#171A21] border border-[#3B82F6]/30 p-6 rounded-lg flex flex-col gap-4 shadow-[0_4px_20px_-2px_rgba(59,130,246,0.15)] ring-1 ring-[#3B82F6]/10 relative overflow-hidden group hover:border-[#3B82F6]/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex justify-between items-center z-10">
              <h3 className="text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Level Progress</h3>
              <span className="text-xs font-extrabold text-[#3B82F6] font-mono">{percent}% completed</span>
            </div>
            <div className="flex justify-between items-baseline z-10 mt-1">
              <span className="text-lg font-bold text-[#F3F4F6]">Level {level}</span>
              <span className="text-xs text-[#9CA3AF] font-mono">{xp} / {maxXp} XP</span>
            </div>
            
            {/* Reusable Progress bar */}
            <Progress 
              value={percent} 
              className="h-3 shadow-[0_0_12px_rgba(59,130,246,0.1)] z-10" 
              indicatorClassName="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] shadow-[0_0_8px_rgba(6,182,212,0.6)]" 
            />

            <div className="text-[10px] text-[#9CA3AF] font-medium leading-normal border-t border-[#1F242F] pt-2 mt-1 z-10">
              {level < 5 ? (
                <span className="flex items-center gap-1">
                  <span className="text-[#3B82F6] font-semibold">{maxXp - xp} XP</span> remaining to reach Level {level + 1}
                </span>
              ) : (
                <span className="text-[10px] text-[#22C55E] font-semibold">
                  Maximum Level Achieved!
                </span>
              )}
            </div>
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
                <HoverCard key={badge.id} openDelay={150}>
                  <HoverCardTrigger asChild>
                    <div
                      tabIndex={0}
                      className={`border p-4 rounded-lg flex flex-col gap-3 transition-colors focus:ring-1 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] focus:outline-none cursor-pointer ${
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
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2.5 items-center">
                          <div className={`p-1.5 rounded-md ${badge.earned ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#0F1115] text-[#9CA3AF]'}`}>
                            <Award className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#F3F4F6]">{badge.title}</h4>
                            <p className="text-[11px] text-[#9CA3AF] mt-0.5 leading-relaxed">{badge.desc}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-[#1F242F] pt-2.5 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider text-[#6B7280] font-mono">Status</span>
                          {badge.earned ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] flex items-center gap-1">
                              <BadgeCheck className="w-3 h-3" /> Earned
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#9CA3AF]/10 border border-[#1F242F] text-[#9CA3AF] flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Locked
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="text-[10px] uppercase tracking-wider text-[#6B7280] font-mono font-semibold">Unlock Requirement</span>
                          <p className="text-xs text-[#3B82F6] font-medium leading-normal bg-[#0F1115] border border-[#1F242F] p-2.5 rounded-md">
                            {badge.requirement}
                          </p>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>
          </div>

          {/* Certificates List Section */}
          <div id="earned-certificates-section" className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4">
            <h3 className="font-bold text-lg text-[#F3F4F6] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#3B82F6]" /> Earned Certificates
            </h3>
            <p className="text-xs text-[#9CA3AF] -mt-1 leading-relaxed">
              Verify your defensive security certifications and export them as high-resolution credentials.
            </p>

            {userProfile?.certificates && userProfile.certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {userProfile.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col justify-between gap-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm text-[#F3F4F6]">{cert.module}</h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">
                          {cert.score} / 10
                        </span>
                      </div>
                      <div className="text-[10px] text-[#9CA3AF] font-mono mt-1">
                        Issued: {new Date(cert.issuedAt).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF] font-mono mt-0.5 border-t border-[#1F242F]/60 pt-2 flex items-baseline gap-1">
                        <span className="text-[#6B7280]">Verification ID:</span>
                        <span className="text-[#3B82F6] font-semibold tracking-wider">{cert.id}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        onClick={() => setActiveCert(cert)}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md border border-[#1F242F] hover:border-[#3B82F6]/30 bg-[#0F1115] text-[11px] font-semibold text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button
                        onClick={() => triggerExport(cert, 'png')}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md border border-[#1F242F] hover:border-[#3B82F6]/30 bg-[#0F1115] text-[11px] font-semibold text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-[#1F242F] rounded-lg mt-3">
                <FileText className="w-8 h-8 text-[#1F242F] mb-2" />
                <p className="text-xs text-[#9CA3AF] px-4 leading-normal">
                  No certificates issued yet. Complete Phishing Detective, Security Fundamentals, or OWASP Top 10 Defenses to earn your certificate of completion.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Certificate Modal */}
      {activeCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1115]/90 p-4 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl flex flex-col gap-3 max-h-[95vh] justify-between">
            
            {/* External Controls Top Bar */}
            <div className="flex justify-end items-center px-1 flex-shrink-0">
              <button
                onClick={() => setActiveCert(null)}
                className="p-1.5 rounded-md border border-[#1F242F] hover:border-[#EF4444]/30 bg-[#171A21] text-[#9CA3AF] hover:text-[#EF4444] transition-colors cursor-pointer focus:outline-none"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Certificate Document (Self-contained responsive component) */}
            <div className="flex-grow flex items-center justify-center min-h-0">
              <CertificateTemplate cert={activeCert} userProfile={userProfile} isExport={false} />
            </div>

            {/* External Download Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full flex-shrink-0 mt-2">
              <button
                onClick={() => triggerExport(activeCert, 'png')}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer shadow-lg hover:shadow-xl border border-[#3B82F6]/10"
              >
                <Download className="w-4 h-4" /> Download PNG
              </button>
              <button
                onClick={() => triggerExport(activeCert, 'pdf')}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0F1115] hover:bg-[#1F242F] text-[#F3F4F6] px-4 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer shadow-lg border border-[#1F242F]"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Hidden high-resolution container for exports */}
      {exportCert && (
        <div className="absolute left-[-9999px] top-[-9999px]" style={{ pointerEvents: 'none' }}>
          <div ref={exportRef} style={{ width: '1200px', height: '900px', position: 'relative' }}>
            <CertificateTemplate cert={exportCert} userProfile={userProfile} isExport={true} />
          </div>
        </div>
      )}

    </div>
  );
}
