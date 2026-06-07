import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth, calculateLevelProgress } from '../context/AuthContext';
import { Award, Mail, Calendar, User, Save, ShieldAlert, BadgeCheck, FileText, Download, Eye, X, Trophy, BookOpen, Lock } from 'lucide-react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../components/ui/HoverCard';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/Tooltip';
import { getStorageKey } from '../utils/storage';

// Badge metadata map for tooltips (matching ProfilePage/DashboardPage)
const BADGE_DETAILS = {
  Initiate: {
    title: 'Initiate Cadet',
    desc: 'Started your cybersecurity training on CyberQuest.',
    requirement: 'Created a CyberQuest account.',
  },
  FirstInvestigation: {
    title: 'First Investigation',
    desc: 'Completed your first phishing analysis lab.',
    requirement: 'Complete your first Phishing Detective challenge.',
  },
  PhishingInvestigator: {
    title: 'Phishing Investigator',
    desc: 'Scored 8/10 or higher in the Phishing Detective lab.',
    requirement: 'Score 8/10 or higher in Phishing Detective.',
  },
  PerfectAnalyst: {
    title: 'Perfect Analyst',
    desc: 'Scored a perfect 10/10 in the Phishing Detective lab.',
    requirement: 'Score 10/10 in Phishing Detective.',
  },
  FundamentalsGraduate: {
    title: 'Fundamentals Graduate',
    desc: 'Scored 8/10 or higher in the Security Fundamentals lab.',
    requirement: 'Score 8/10 or higher in Security Fundamentals.',
  },
  SecurityGuardian: {
    title: 'Security Guardian',
    desc: 'Scored a perfect 10/10 in the Security Fundamentals lab.',
    requirement: 'Score 10/10 in Security Fundamentals.',
  },
  AIExplorer: {
    title: 'AI Explorer',
    desc: 'Generated your first AI challenge using Gemini.',
    requirement: 'Generate your first AI challenge in AI Challenge Lab.',
  },
  CertifiedLearner: {
    title: 'Certified Learner',
    desc: 'Earned your first training completion certificate on CyberQuest.',
    requirement: 'Earn your first training completion certificate.',
  },
  OWASPExplorer: {
    title: 'OWASP Explorer',
    desc: 'Completed the OWASP Top 10 Defenses learning path.',
    requirement: 'Complete the OWASP Top 10 Defenses path.',
  },
  ThreatHunter: {
    title: 'Threat Hunter',
    desc: 'Scored 8/10 or higher in the OWASP Top 10 Defenses lab.',
    requirement: 'Score 8/10 or higher in OWASP Top 10 Defenses.',
  },
  ApplicationGuardian: {
    title: 'Application Guardian',
    desc: 'Scored a perfect 10/10 in the OWASP Top 10 Defenses lab.',
    requirement: 'Score 10/10 in OWASP Top 10 Defenses.',
  },
};

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

  // Controlled active tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Sync profile details when changed externally
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setBio(userProfile.bio || '');
    }
  }, [userProfile]);

  useEffect(() => {
    const scrollToCertificates = localStorage.getItem('cyberquest_scroll_to_certificates');
    if (scrollToCertificates) {
      localStorage.removeItem('cyberquest_scroll_to_certificates');
      setActiveTab('certificates');
      setTimeout(() => {
        const element = document.getElementById('earned-certificates-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
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

  // Calculate Completed Modules from LocalStorage counts
  const completedModulesCount = useMemo(() => {
    let phishingCount = 0;
    let fundamentalsCount = 0;
    let aiCount = 0;
    let owaspCount = 0;

    try {
      const keyPhishing = getStorageKey('cyberquest_phishing_answers', user?.uid);
      const savedPhishing = localStorage.getItem(keyPhishing);
      if (savedPhishing) phishingCount = Object.keys(JSON.parse(savedPhishing)).length;

      const keyFundamentals = getStorageKey('cyberquest_fundamentals_answers', user?.uid);
      const savedFundamentals = localStorage.getItem(keyFundamentals);
      if (savedFundamentals) fundamentalsCount = Object.keys(JSON.parse(savedFundamentals)).length;

      const keyAi = getStorageKey('cyberquest_ai_answers', user?.uid);
      const savedAi = localStorage.getItem(keyAi);
      if (savedAi) aiCount = Object.keys(JSON.parse(savedAi)).length;

      const keyOwasp = getStorageKey('cyberquest_owasp_answers', user?.uid);
      const savedOwasp = localStorage.getItem(keyOwasp);
      if (savedOwasp) owaspCount = Object.keys(JSON.parse(savedOwasp)).length;
    } catch (e) {
      console.error("Failed calculating stats in ProfilePage:", e);
    }

    return (
      (phishingCount === 10 ? 1 : 0) +
      (fundamentalsCount === 10 ? 1 : 0) +
      (aiCount >= 5 ? 1 : 0) +
      (owaspCount === 10 ? 1 : 0)
    );
  }, [user?.uid]);

  // List of all achievements/badges in the platform
  const badgesList = useMemo(() => {
    return [
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
  }, [userProfile?.badges]);

  const earnedBadges = useMemo(() => {
    return userProfile?.badges || ['Initiate'];
  }, [userProfile?.badges]);

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
    <TooltipProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* Page Header */}
        <div className="border-b border-[#1F242F] pb-5">
          <h1 className="text-2xl font-extrabold text-[#F3F4F6] tracking-tight">Your Profile</h1>
          <p className="text-[#9CA3AF] text-xs mt-0.5">Manage your details, view earned certifications, and track achievements.</p>
        </div>

        {/* Tabs Container */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          {/* Tabs triggers */}
          <TabsList className="w-full sm:w-auto grid grid-cols-3 max-w-md mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview Tab */}
          <TabsContent value="overview" className="flex flex-col gap-6 animate-fadeIn">
            
            {/* Profile Header Hero (GitHub Style summary) */}
            <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
              <div className="relative flex-shrink-0">
                <img
                  className="w-20 h-20 rounded-full border border-[#1F242F] object-cover bg-[#0F1115]"
                  src={user?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=profile'}
                  alt="Avatar"
                  onError={(e) => {
                    e.target.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=profile';
                  }}
                />
              </div>

              <div className="flex-grow text-center sm:text-left flex flex-col items-center sm:items-start min-w-0">
                <h2 className="text-3xl font-black text-[#F3F4F6] tracking-tight">
                  {displayName || userProfile?.displayName || user?.displayName || 'Cyber Cadet'}
                </h2>
                <p className="text-sm font-semibold text-[#3B82F6] tracking-wide mt-1">
                  {userProfile?.role || 'Cyber Cadet'} • Level {level}
                </p>

                {/* GitHub style profile stat summaries */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3.5 gap-y-2 mt-3.5 text-xs font-mono select-none text-[#9CA3AF]">
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span className="text-[#F3F4F6] font-bold">{xp}</span> XP
                  </span>
                  <span className="text-[#1F242F] hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span className="text-[#F3F4F6] font-bold">{earnedBadges.length}</span> Badges
                  </span>
                  <span className="text-[#1F242F] hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span className="text-[#F3F4F6] font-bold">{userProfile?.certificates?.length || 0}</span> Certificates
                  </span>
                  <span className="text-[#1F242F] hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#A855F7]" />
                    <span className="text-[#F3F4F6] font-bold">{completedModulesCount}</span> Modules Completed
                  </span>
                </div>
                
                <p className="text-xs text-[#9CA3AF] leading-relaxed italic mt-4 max-w-3xl border-t border-[#1F242F]/60 pt-3 w-full break-words">
                  "{bio || userProfile?.bio || 'No biography details provided yet.'}"
                </p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-3 text-[10px] text-[#6B7280] font-mono w-full">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {user?.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Joined {formatDate(userProfile?.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* XP Progress Bar (Themed) */}
            <div className="bg-[#171A21] border border-[#3B82F6]/25 ring-1 ring-[#3B82F6]/5 p-6 rounded-lg flex flex-col gap-3">
              <div className="flex justify-between items-end text-xs font-mono select-none">
                <span className="text-[#F3F4F6] font-semibold">Level {level}</span>
                <span className="text-[#3B82F6] font-bold">{percent}%</span>
              </div>
              
              <Progress value={percent} className="h-3" indicatorClassName="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4]" />
              
              <div className="text-[10px] text-[#9CA3AF] font-mono flex justify-between items-center mt-1">
                <span>{xp} / {maxXp} XP</span>
                {level < 5 ? (
                  <span>{maxXp - xp} XP to Level {level + 1}</span>
                ) : (
                  <span className="text-[#22C55E] font-semibold">Maximum Level Achieved!</span>
                )}
              </div>
            </div>

            {/* Quick Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Stat 1: Total XP */}
              <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col justify-between min-h-[100px]">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Total XP</span>
                <div className="flex justify-between items-baseline mt-3">
                  <span className="text-xl font-extrabold text-[#F3F4F6]">{xp} XP</span>
                  <Trophy className="w-4 h-4 text-[#F59E0B]" />
                </div>
              </div>

              {/* Stat 2: Earned Badges */}
              <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col justify-between min-h-[100px]">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Earned Badges</span>
                <div className="flex justify-between items-baseline mt-3">
                  <span className="text-xl font-extrabold text-[#F3F4F6]">{earnedBadges.length}</span>
                  <Award className="w-4 h-4 text-[#22C55E]" />
                </div>
              </div>

              {/* Stat 3: Certificates Earned */}
              <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col justify-between min-h-[100px]">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Certificates</span>
                <div className="flex justify-between items-baseline mt-3">
                  <span className="text-xl font-extrabold text-[#F3F4F6]">{userProfile?.certificates?.length || 0}</span>
                  <FileText className="w-4 h-4 text-[#3B82F6]" />
                </div>
              </div>

              {/* Stat 4: Completed Modules */}
              <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col justify-between min-h-[100px]">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Completed Modules</span>
                <div className="flex justify-between items-baseline mt-3">
                  <span className="text-xl font-extrabold text-[#F3F4F6]">{completedModulesCount} / 4</span>
                  <BookOpen className="w-4 h-4 text-[#A855F7]" />
                </div>
              </div>
            </div>

            {/* Recent Achievements Section */}
            <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-[#1F242F]/60 pb-3">
                <h3 className="font-bold text-sm text-[#F3F4F6] flex items-center gap-2 uppercase tracking-wider select-none">
                  <Award className="w-4 h-4 text-[#22C55E]" /> Recent Achievements
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('achievements')}
                  className="text-xs text-[#3B82F6] font-semibold hover:underline cursor-pointer focus:outline-none bg-transparent border-0"
                >
                  View All Achievements
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
                {['SecurityGuardian', 'CertifiedLearner', 'AIExplorer'].map((badgeId) => {
                  const details = BADGE_DETAILS[badgeId];
                  if (!details) return null;
                  const isEarned = userProfile?.badges?.includes(badgeId) || false;
                  
                  return (
                    <Tooltip key={badgeId} delayDuration={150}>
                      <TooltipTrigger asChild>
                        <div className={`flex items-center justify-between gap-3 p-3.5 bg-[#0F1115] border rounded-lg text-xs cursor-pointer transition-all shadow-sm hover:scale-[1.01] ${
                          isEarned 
                            ? 'border-[#22C55E]/30 hover:border-[#22C55E]/50 text-[#F3F4F6]' 
                            : 'border-[#1F242F]/80 opacity-50 hover:opacity-75 text-[#9CA3AF]'
                        }`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-1.5 rounded-md flex-shrink-0 border ${
                              isEarned 
                                ? 'bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]' 
                                : 'bg-[#171A21]/60 border-[#1F242F] text-[#6B7280]'
                            }`}>
                              <Award className="w-4 h-4" />
                            </div>
                            <span className={`truncate font-bold tracking-tight ${isEarned ? 'text-[#22C55E]' : 'text-[#9CA3AF]'}`}>
                              {details.title}
                            </span>
                          </div>
                          <div className="flex-shrink-0">
                            {isEarned ? (
                              <BadgeCheck className="w-4 h-4 text-[#22C55E]" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-[#6B7280]" />
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <div className="flex flex-col gap-1 text-left select-none">
                          <span className="font-bold text-[#F3F4F6] text-xs flex items-center gap-1.5">
                            {details.title}
                            {isEarned ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E]">EARNED</span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#9CA3AF]/10 border border-[#1F242F] text-[#9CA3AF]">LOCKED</span>
                            )}
                          </span>
                          <p className="text-[10px] text-[#9CA3AF] mt-1 leading-normal">{details.desc}</p>
                          <span className="text-[9px] text-[#3B82F6] font-mono mt-1.5 border-t border-[#1F242F] pt-1 block">
                            Requirement: {details.requirement}
                          </span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Edit Profile Form (Moved to the bottom) */}
            <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4">
              <h3 className="font-bold text-sm text-[#F3F4F6] flex items-center gap-2 border-b border-[#1F242F]/60 pb-3 uppercase tracking-wider select-none">
                <User className="w-4 h-4 text-[#3B82F6]" /> Profile Details Settings
              </h3>

              <form onSubmit={handleUpdate} className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="displayName" className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                    Public Display Name
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
                    placeholder="Share a short bio or study goal..."
                  />
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

          </TabsContent>

          {/* Tab 2: Achievements Tab */}
          <TabsContent value="achievements" className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4 animate-fadeIn">
            <div className="border-b border-[#1F242F]/60 pb-3">
              <h3 className="font-bold text-sm text-[#F3F4F6] flex items-center gap-2 uppercase tracking-wider">
                <Award className="w-4 h-4 text-[#22C55E]" /> Achievements & Badges
              </h3>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                These badges show which labs and security challenges you have completed. Hover on any badge to inspect its details.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
              {badgesList.map((badge) => (
                <HoverCard key={badge.id} openDelay={150}>
                  <HoverCardTrigger asChild>
                    <div
                      tabIndex={0}
                      className={`border p-4 rounded-lg flex flex-col gap-3 transition-all focus:ring-1 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] focus:outline-none cursor-pointer hover:scale-[1.01] ${
                        badge.earned
                          ? 'bg-[#171A21] border-[#22C55E]/30 text-[#F3F4F6] shadow-sm shadow-[#22C55E]/5'
                          : 'bg-[#171A21]/40 border-[#1F242F]/60 text-[#9CA3AF] opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className={`p-1.5 rounded-md ${badge.earned ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20' : 'bg-[#0F1115] text-[#9CA3AF]'}`}>
                          <Award className="w-5 h-5" />
                        </div>
                        {badge.earned ? (
                          <BadgeCheck className="w-4 h-4 text-[#22C55E]" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-[#9CA3AF]" />
                        )}
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm leading-tight tracking-tight ${badge.earned ? 'text-[#22C55E]' : 'text-[#9CA3AF]'}`}>
                          {badge.title}
                        </h4>
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start select-none">
                        <div className="flex gap-2.5 items-center">
                          <div className={`p-1.5 rounded-md ${badge.earned ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20' : 'bg-[#0F1115] text-[#9CA3AF]'}`}>
                            <Award className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#F3F4F6]">{badge.title}</h4>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 text-xs select-none">
                        <span className="text-[10px] uppercase tracking-wider text-[#6B7280] font-mono font-semibold">Description</span>
                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">{badge.desc}</p>
                      </div>

                      <div className="border-t border-[#1F242F] pt-2.5 flex flex-col gap-1.5 select-none">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider text-[#6B7280] font-mono font-semibold">Status</span>
                          {badge.earned ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] flex items-center gap-1">
                              <BadgeCheck className="w-3 h-3" /> Earned
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#9CA3AF]/10 border border-[#1F242F] text-[#9CA3AF] flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Locked
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
          </TabsContent>

          {/* Tab 3: Certificates Tab */}
          <TabsContent value="certificates" className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4 animate-fadeIn">
            <div id="earned-certificates-section" className="border-b border-[#1F242F]/60 pb-3">
              <h3 className="font-bold text-sm text-[#F3F4F6] flex items-center gap-2 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#3B82F6]" /> Earned Certificates
              </h3>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                Verify your defensive security certifications and export them as high-resolution credentials.
              </p>
            </div>

            {userProfile?.certificates && userProfile.certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                {userProfile.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col justify-between gap-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3">
                      
                      {/* Simplified Thumbnail Card (Option B) */}
                      <div className="w-full h-32 bg-[#0F1115] border border-[#1F242F] rounded-md relative overflow-hidden select-none flex flex-col justify-between p-3.5 text-center">
                        {/* Accent border frame line */}
                        <div className="absolute inset-1.5 border border-[#3B82F6]/10 rounded pointer-events-none"></div>
                        
                        <div className="flex justify-between items-center w-full z-10">
                          <span className="text-[7px] font-extrabold text-[#3B82F6] tracking-wider font-mono">CYBERQUEST</span>
                          <span className="text-[5px] text-[#22C55E] font-mono border border-[#22C55E]/15 px-1 rounded bg-[#22C55E]/5 flex items-center gap-0.5">
                            <BadgeCheck className="w-2 h-2 text-[#22C55E]" /> VERIFIED
                          </span>
                        </div>

                        <div className="flex flex-col gap-0.5 z-10 my-auto">
                          <span className="text-[9px] font-medium text-[#9CA3AF] font-mono">
                            {userProfile?.displayName || user?.displayName || 'Cyber Cadet'}
                          </span>
                          <span className="text-[10px] font-extrabold text-white uppercase tracking-wider truncate max-w-full block mt-1">
                            {cert.module}
                          </span>
                        </div>

                        <div className="flex justify-between items-center w-full z-10 text-[6px] font-mono text-[#9CA3AF] border-t border-[#1F242F] pt-1">
                          <span>{new Date(cert.issuedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                          <span className="text-[#22C55E] font-bold">{cert.score} / 10 • SECURE</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h4 className="font-extrabold text-sm text-[#F3F4F6] tracking-tight">{cert.module}</h4>
                        
                        <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-[#9CA3AF]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
                            Issued {new Date(cert.issuedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                          </span>
                          <span className="font-bold px-2 py-0.5 rounded bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E]">
                            Score: {cert.score} / 10
                          </span>
                        </div>
                        
                        <div className="text-[10px] text-[#9CA3AF] font-mono mt-1 border-t border-[#1F242F]/60 pt-2 flex items-baseline gap-1">
                          <span className="text-[#6B7280]">Verification ID:</span>
                          <span className="text-[#3B82F6] font-semibold tracking-wider">{cert.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <button
                        onClick={() => setActiveCert(cert)}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-1 rounded-md border border-[#1F242F] hover:border-[#3B82F6]/30 bg-[#0F1115] text-[10px] font-semibold text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button
                        onClick={() => triggerExport(cert, 'png')}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-1 rounded-md border border-[#1F242F] hover:border-[#3B82F6]/30 bg-[#0F1115] text-[10px] font-semibold text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> PNG
                      </button>
                      <button
                        onClick={() => triggerExport(cert, 'pdf')}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-1 rounded-md border border-[#1F242F] hover:border-[#3B82F6]/30 bg-[#0F1115] text-[10px] font-semibold text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#1F242F] rounded-lg mt-3 bg-[#0F1115]/30">
                <FileText className="w-8 h-8 text-[#1F242F] mb-2" />
                <p className="text-xs text-[#9CA3AF] px-4 leading-normal">
                  No certificates issued yet. Complete Phishing Detective, Security Fundamentals, or OWASP Top 10 Defenses to earn your certificate of completion.
                </p>
              </div>
            )}
          </TabsContent>

        </Tabs>

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
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer border border-[#3B82F6]/10"
                >
                  <Download className="w-4 h-4" /> Download PNG
                </button>
                <button
                  onClick={() => triggerExport(activeCert, 'pdf')}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0F1115] hover:bg-[#1F242F] text-[#F3F4F6] px-4 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer border border-[#1F242F]"
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
    </TooltipProvider>
  );
}
