import { useMemo } from 'react';
import { useAuth, calculateLevelProgress } from '../context/AuthContext';
import { Award, Lock, ShieldCheck, Zap, Key, Eye, Sparkles, Trophy, Percent, CheckSquare, ArrowRight, Clock, Target } from 'lucide-react';
import { getStorageKey } from '../utils/storage';
import { Progress } from '../components/ui/Progress';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/Tooltip';

// Badge metadata map for tooltips (matching ProfilePage)
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
 * DashboardPage Component.
 * @param {Object} props
 * @param {function(string):void} props.onNavigate - Page router utility
 */
export default function DashboardPage({ onNavigate }) {
  const { user, userProfile } = useAuth();
  const xp = userProfile?.xp || 0;
  const { level, maxXp, percent } = calculateLevelProgress(xp);

  const stats = useMemo(() => {
    // 1. Phishing Answers
    let completedPhishing = 0;
    let correctPhishing = 0;
    try {
      const keyPhishing = getStorageKey('cyberquest_phishing_answers', user?.uid);
      const savedPhishing = localStorage.getItem(keyPhishing);
      if (savedPhishing) {
        const parsed = JSON.parse(savedPhishing);
        const entries = Object.values(parsed);
        completedPhishing = entries.length;
        correctPhishing = entries.filter((a) => a.isCorrect).length;
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Fundamentals Answers
    let completedFundamentals = 0;
    let correctFundamentals = 0;
    try {
      const keyFundamentals = getStorageKey('cyberquest_fundamentals_answers', user?.uid);
      const savedFundamentals = localStorage.getItem(keyFundamentals);
      if (savedFundamentals) {
        const parsed = JSON.parse(savedFundamentals);
        const entries = Object.values(parsed);
        completedFundamentals = entries.length;
        correctFundamentals = entries.filter((a) => a.isCorrect).length;
      }
    } catch (e) {
      console.error(e);
    }

    // 3. AI Challenge Lab Answers
    let completedAi = 0;
    let correctAi = 0;
    try {
      const keyAi = getStorageKey('cyberquest_ai_answers', user?.uid);
      const savedAi = localStorage.getItem(keyAi);
      if (savedAi) {
        const parsed = JSON.parse(savedAi);
        const entries = Object.values(parsed);
        completedAi = entries.length;
        correctAi = entries.filter((a) => a.isCorrect).length;
      }
    } catch (e) {
      console.error(e);
    }

    // 4. OWASP Top 10 Defenses Answers
    let completedOwasp = 0;
    let correctOwasp = 0;
    try {
      const keyOwasp = getStorageKey('cyberquest_owasp_answers', user?.uid);
      const savedOwasp = localStorage.getItem(keyOwasp);
      if (savedOwasp) {
        const parsed = JSON.parse(savedOwasp);
        const entries = Object.values(parsed);
        completedOwasp = entries.length;
        correctOwasp = entries.filter((a) => a.isCorrect).length;
      }
    } catch (e) {
      console.error(e);
    }

    return {
      completedPhishing,
      correctPhishing,
      completedFundamentals,
      correctFundamentals,
      completedAi,
      correctAi,
      completedOwasp,
      correctOwasp,
    };
  }, [user?.uid]);

  const totalCompleted = stats.completedPhishing + stats.completedFundamentals + stats.completedAi + stats.completedOwasp;
  const totalCorrect = stats.correctPhishing + stats.correctFundamentals + stats.correctAi + stats.correctOwasp;
  const accuracyPercent = totalCompleted > 0 ? Math.round((totalCorrect / totalCompleted) * 100) : 0;
  const totalXp = userProfile?.xp || 0;

  // Format activity timestamp
  const formatActivityTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  // Configurable Daily Goal System
  const dailyGoalConfig = useMemo(() => ({
    type: 'xp', // 'xp' | 'phishing' | 'owasp' | 'fundamentals' | 'ai'
    target: 50,
    title: 'Daily Training Mission',
    description: 'Earn 50 XP today to maintain your cybersecurity skill readiness.',
    rewardText: 'Reward: +25 Bonus XP'
  }), []);

  // Compute daily progress from local activities logs
  const dailyProgress = useMemo(() => {
    if (!userProfile?.activities) return 0;
    const todayStr = new Date().toDateString();

    const activitiesToday = userProfile.activities.filter(activity => {
      if (!activity.timestamp) return false;
      return new Date(activity.timestamp).toDateString() === todayStr;
    });

    if (dailyGoalConfig.type === 'xp') {
      return activitiesToday
        .filter(a => a.type === 'xp_earned')
        .reduce((sum, a) => {
          const match = a.description?.match(/\+(\d+)\s*XP/i);
          const xpVal = match ? parseInt(match[1], 10) : 0;
          return sum + xpVal;
        }, 0);
    }
    
    // Configurable fallbacks:
    if (dailyGoalConfig.type === 'phishing') {
      return activitiesToday.filter(a => a.type === 'xp_earned' && a.description?.toLowerCase().includes('phishing')).length;
    }
    if (dailyGoalConfig.type === 'owasp') {
      return activitiesToday.filter(a => a.type === 'xp_earned' && a.description?.toLowerCase().includes('owasp')).length;
    }
    if (dailyGoalConfig.type === 'fundamentals') {
      return activitiesToday.filter(a => a.type === 'xp_earned' && a.description?.toLowerCase().includes('fundamentals')).length;
    }
    if (dailyGoalConfig.type === 'ai') {
      return activitiesToday.filter(a => a.type === 'xp_earned' && a.description?.toLowerCase().includes('ai challenge')).length;
    }
    
    return 0;
  }, [userProfile?.activities, dailyGoalConfig]);

  const dailyProgressPercent = Math.min(100, Math.round((dailyProgress / dailyGoalConfig.target) * 100));
  const dailyGoalCompleted = dailyProgress >= dailyGoalConfig.target;

  // Recommended next module details
  const getRecommendationDetails = () => {
    if (stats.completedPhishing < 10) {
      return {
        id: 'phishing',
        title: "Phishing Detective",
        desc: "Analyze headers, link redirects, and body contents in simulated inboxes to spot email threat vectors.",
        icon: <Eye className="w-6 h-6 text-[#3B82F6]" />,
        path: "phishing-detective",
        actionText: "Resume Training",
        completedCount: stats.completedPhishing,
        totalCount: 10,
        percent: Math.round((stats.completedPhishing / 10) * 100),
        status: stats.completedPhishing > 0 ? "In Progress" : "Not Started",
        statusColor: stats.completedPhishing > 0 ? "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20" : "text-[#9CA3AF] bg-[#0F1115] border-[#1F242F]",
        difficulty: "Medium",
        estTime: "20–30 min"
      };
    } else if (stats.completedFundamentals < 10) {
      return {
        id: 'fundamentals',
        title: "Security Fundamentals",
        desc: "Evaluate critical network concepts, USB safety protocols, MFA fatigue attacks, and browser permissions.",
        icon: <ShieldCheck className="w-6 h-6 text-[#3B82F6]" />,
        path: "security-fundamentals",
        actionText: stats.completedFundamentals > 0 ? "Resume Training" : "Start Training",
        completedCount: stats.completedFundamentals,
        totalCount: 10,
        percent: Math.round((stats.completedFundamentals / 10) * 100),
        status: stats.completedFundamentals > 0 ? "In Progress" : "Not Started",
        statusColor: stats.completedFundamentals > 0 ? "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20" : "text-[#9CA3AF] bg-[#0F1115] border-[#1F242F]",
        difficulty: "Easy",
        estTime: "15–20 min"
      };
    } else if (stats.completedAi < 5) {
      return {
        id: 'ai-challenge-lab',
        title: "AI Challenge Lab",
        desc: "Generate and solve dynamic, customized threat scenarios powered by Gemini AI to test your defensive limits.",
        icon: <Sparkles className="w-6 h-6 text-[#F59E0B]" />,
        path: "ai-challenge-lab",
        actionText: stats.completedAi > 0 ? "Resume Training" : "Start Training",
        completedCount: stats.completedAi,
        totalCount: 5,
        percent: Math.min(100, Math.round((stats.completedAi / 5) * 100)),
        status: stats.completedAi > 0 ? "In Progress" : "Not Started",
        statusColor: stats.completedAi > 0 ? "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20" : "text-[#9CA3AF] bg-[#0F1115] border-[#1F242F]",
        difficulty: "Dynamic",
        estTime: "Self-paced"
      };
    } else if (stats.completedOwasp < 10) {
      return {
        id: 'owasp',
        title: "OWASP Top 10 Defenses",
        desc: "Master defenses against modern web vulnerabilities like SQL Injection, XSS, and broken access controls.",
        icon: <Key className="w-6 h-6 text-[#3B82F6]" />,
        path: "owasp",
        actionText: stats.completedOwasp > 0 ? "Resume Training" : "Start Training",
        completedCount: stats.completedOwasp,
        totalCount: 10,
        percent: Math.round((stats.completedOwasp / 10) * 100),
        status: stats.completedOwasp > 0 ? "In Progress" : "Not Started",
        statusColor: stats.completedOwasp > 0 ? "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20" : "text-[#9CA3AF] bg-[#0F1115] border-[#1F242F]",
        difficulty: "Hard",
        estTime: "30–45 min"
      };
    } else {
      return {
        id: 'all',
        title: "All Modules Completed",
        desc: "Congratulations! You have completed all active learning modules on CyberQuest.",
        icon: <Trophy className="w-6 h-6 text-[#22C55E]" />,
        path: "dashboard",
        actionText: "Training Complete",
        completedCount: 4,
        totalCount: 4,
        percent: 100,
        status: "Completed",
        statusColor: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20",
        disabled: true,
        difficulty: "N/A",
        estTime: "N/A"
      };
    }
  };

  const recDetails = getRecommendationDetails();

  // Badges preview logic
  const earnedBadges = useMemo(() => {
    return userProfile?.badges || ['Initiate'];
  }, [userProfile?.badges]);

  const reversedBadges = useMemo(() => {
    return [...earnedBadges].reverse();
  }, [earnedBadges]);

  const badgesPreviewList = useMemo(() => {
    return reversedBadges.slice(0, 4); // show up to 4 recent badges
  }, [reversedBadges]);

  const remainingBadgesCount = reversedBadges.length - badgesPreviewList.length;

  const nextLockedBadge = useMemo(() => {
    const badgesOrder = [
      'FirstInvestigation',
      'PhishingInvestigator',
      'PerfectAnalyst',
      'FundamentalsGraduate',
      'SecurityGuardian',
      'AIExplorer',
      'CertifiedLearner',
      'OWASPExplorer',
      'ThreatHunter',
      'ApplicationGuardian'
    ];
    const firstUnearned = badgesOrder.find(id => !earnedBadges.includes(id));
    if (firstUnearned && BADGE_DETAILS[firstUnearned]) {
      return {
        id: firstUnearned,
        ...BADGE_DETAILS[firstUnearned]
      };
    }
    return null;
  }, [earnedBadges]);

  // Unified modules mapping
  const modulesProgress = useMemo(() => {
    return [
      {
        id: 'fundamentals',
        title: 'Security Fundamentals',
        completed: stats.completedFundamentals,
        total: 10,
        percent: Math.round((stats.completedFundamentals / 10) * 100),
        status: stats.completedFundamentals === 10 ? 'Completed' : stats.completedFundamentals > 0 ? 'In Progress' : 'Not Started',
        statusColor: stats.completedFundamentals === 10 ? 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20' : stats.completedFundamentals > 0 ? 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' : 'text-[#9CA3AF] bg-[#0F1115] border-[#1F242F]',
        icon: <ShieldCheck className="w-5 h-5 text-[#3B82F6]" />,
        path: 'security-fundamentals',
        actionText: stats.completedFundamentals === 10 ? 'Review Labs' : stats.completedFundamentals > 0 ? 'Resume Training' : 'Start Training',
      },
      {
        id: 'phishing',
        title: 'Phishing Detective',
        completed: stats.completedPhishing,
        total: 10,
        percent: Math.round((stats.completedPhishing / 10) * 100),
        status: stats.completedPhishing === 10 ? 'Completed' : stats.completedPhishing > 0 ? 'In Progress' : 'Not Started',
        statusColor: stats.completedPhishing === 10 ? 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20' : stats.completedPhishing > 0 ? 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' : 'text-[#9CA3AF] bg-[#0F1115] border-[#1F242F]',
        icon: <Eye className="w-5 h-5 text-[#3B82F6]" />,
        path: 'phishing-detective',
        actionText: stats.completedPhishing === 10 ? 'Review Labs' : stats.completedPhishing > 0 ? 'Resume Training' : 'Start Training',
      },
      {
        id: 'owasp',
        title: 'OWASP Top 10 Defenses',
        completed: stats.completedOwasp,
        total: 10,
        percent: Math.round((stats.completedOwasp / 10) * 100),
        status: stats.completedOwasp === 10 ? 'Completed' : stats.completedOwasp > 0 ? 'In Progress' : 'Not Started',
        statusColor: stats.completedOwasp === 10 ? 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20' : stats.completedOwasp > 0 ? 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' : 'text-[#9CA3AF] bg-[#0F1115] border-[#1F242F]',
        icon: <Key className="w-5 h-5 text-[#3B82F6]" />,
        path: 'owasp',
        actionText: stats.completedOwasp === 10 ? 'Review Labs' : stats.completedOwasp > 0 ? 'Resume Training' : 'Start Training',
      },
      {
        id: 'ai-challenge-lab',
        title: 'AI Challenge Lab',
        completed: stats.completedAi,
        total: 5,
        percent: Math.min(100, Math.round((stats.completedAi / 5) * 100)),
        status: stats.completedAi >= 5 ? 'Completed' : stats.completedAi > 0 ? 'In Progress' : 'Not Started',
        statusColor: stats.completedAi >= 5 ? 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20' : stats.completedAi > 0 ? 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20' : 'text-[#9CA3AF] bg-[#0F1115] border-[#1F242F]',
        icon: <Sparkles className="w-5 h-5 text-[#F59E0B]" />,
        path: 'ai-challenge-lab',
        actionText: stats.completedAi >= 5 ? 'Review Labs' : stats.completedAi > 0 ? 'Resume Training' : 'Start Training',
      }
    ];
  }, [stats]);

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Welcome Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1F242F] pb-5">
          <div className="w-full md:w-auto">
            <h1 className="text-2xl font-extrabold text-[#F3F4F6] tracking-tight">
              Security Dashboard
            </h1>
            <p className="text-[#9CA3AF] mt-0.5 text-xs">
              Welcome back, <span className="text-[#F3F4F6] font-medium">{userProfile?.displayName || 'Cadet'}</span>. Ready for your next training challenge?
            </p>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="w-full md:w-auto text-center justify-center inline-flex items-center text-xs font-semibold px-4 py-2.5 h-11 md:h-auto rounded-md border border-[#1F242F] hover:border-[#3B82F6]/30 bg-[#171A21] text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors cursor-pointer"
          >
            View Profile & Achievements
          </button>
        </section>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Left Column (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Section 1: Continue Learning Card (Hero Area) */}
            <section className="bg-[#171A21] border border-[#1F242F] p-6 sm:p-8 rounded-lg relative overflow-hidden flex flex-col justify-between min-h-[240px]">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">Recommended Next Step</span>
                  <h2 className="text-xl font-bold text-[#F3F4F6] flex items-center gap-2 mt-1">
                    {recDetails.icon}
                    {recDetails.title}
                  </h2>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${recDetails.statusColor}`}>
                  {recDetails.status}
                </span>
              </div>

              <p className="text-xs text-[#9CA3AF] mt-3 leading-relaxed max-w-2xl">
                {recDetails.desc}
              </p>

              {/* Path Metadata Badges */}
              <div className="flex flex-wrap items-center gap-3 mt-4 text-[10px] text-[#9CA3AF] font-mono select-none">
                <span className="px-2 py-1 rounded bg-[#0F1115] border border-[#1F242F]">
                  Completed: <strong className="text-[#F3F4F6]">{recDetails.completedCount} / {recDetails.totalCount}</strong>
                </span>
                <span className="px-2 py-1 rounded bg-[#0F1115] border border-[#1F242F]">
                  Estimated Time: <strong className="text-[#F3F4F6]">{recDetails.estTime}</strong>
                </span>
                <span className="px-2 py-1 rounded bg-[#0F1115] border border-[#1F242F]">
                  Difficulty: <strong className={
                    recDetails.difficulty === 'Easy' ? 'text-[#22C55E]' :
                    recDetails.difficulty === 'Medium' ? 'text-[#F59E0B]' :
                    recDetails.difficulty === 'Hard' ? 'text-[#EF4444]' : 'text-[#3B82F6]'
                  }>{recDetails.difficulty}</strong>
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex justify-between items-end text-xs font-mono">
                  <span className="text-[#9CA3AF]">Progress Tracker</span>
                  <span className="text-[#3B82F6] font-bold">
                    {recDetails.percent}% Completed
                  </span>
                </div>
                <Progress value={recDetails.percent} className="h-2.5" />
              </div>

              <div className="mt-5 flex justify-start">
                <button
                  onClick={() => !recDetails.disabled && onNavigate(recDetails.path)}
                  disabled={recDetails.disabled}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 h-11 sm:h-auto rounded text-xs font-bold transition-all cursor-pointer ${
                    recDetails.disabled
                      ? 'bg-[#0F1115] text-[#6B7280] border border-[#1F242F] cursor-not-allowed'
                      : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white'
                  }`}
                >
                  {recDetails.actionText}
                  {!recDetails.disabled && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </section>

            {/* Section 2 & 3: Level Progress & Daily Goal Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Level Progress Card - Visually Enhanced */}
              <div className="bg-[#171A21] border border-[#3B82F6]/30 ring-1 ring-[#3B82F6]/10 p-6 rounded-lg flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
                <div className="flex justify-between items-center">
                  <Tooltip delayDuration={150}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 cursor-help select-none">
                        <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">Level Progress</span>
                        <span className="text-[9px] text-[#6B7280] border border-[#1F242F] px-1.5 rounded-sm font-mono">?</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>XP is earned by completing labs, investigations, challenges, and certifications.</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#3B82F6]/10 border border-[#3B82F6]/25 text-[#3B82F6] text-[9px] font-mono font-bold">
                    <Zap className="w-3 h-3 text-[#3B82F6] animate-pulse" /> ACTIVE CADET
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                    <span className="text-3xl font-black text-[#F3F4F6] tracking-tight">Level {level}</span>
                    <span className="text-sm font-semibold font-mono text-[#3B82F6]">{xp} / {maxXp} XP</span>
                  </div>
                  <Progress value={percent} className="h-3.5" indicatorClassName="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4]" />
                </div>

                <div className="text-[10px] text-[#9CA3AF] font-mono border-t border-[#1F242F]/60 pt-2 mt-2">
                  {level < 5 ? (
                    <span>{maxXp - xp} XP remaining to reach Level {level + 1}</span>
                  ) : (
                    <span className="text-[#22C55E] font-semibold">Maximum Level Achieved!</span>
                  )}
                </div>
              </div>

              {/* Daily Goal Card */}
              <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 font-bold text-[#9CA3AF] text-[10px] uppercase tracking-wider">
                    <Target className="w-3.5 h-3.5 text-[#F59E0B]" /> Daily Mission
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${
                    dailyGoalCompleted 
                      ? 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20' 
                      : 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20'
                  }`}>
                    {dailyGoalCompleted ? 'Completed' : 'Active'}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-[#F3F4F6]">{dailyGoalConfig.description}</span>
                    <div className="text-[10px] text-[#F59E0B] font-mono font-bold flex items-center">
                      <span className="px-1.5 py-0.5 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/20">{dailyGoalConfig.rewardText}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-[10px] font-mono text-[#9CA3AF]">Objective Progress</span>
                    <span className="text-xs font-mono text-[#9CA3AF]">
                      {dailyProgress} / {dailyGoalConfig.target} XP
                    </span>
                  </div>
                  <Progress value={dailyProgressPercent} className="h-2" indicatorClassName="bg-[#F59E0B]" />
                </div>

                <div className="text-[10px] text-[#9CA3AF] font-mono border-t border-[#1F242F]/60 pt-2 mt-2">
                  {dailyGoalCompleted ? (
                    <span className="text-[#22C55E] font-semibold">Training mission completed!</span>
                  ) : (
                    <span>Earn {dailyGoalConfig.target - dailyProgress} more XP today to clear this objective.</span>
                  )}
                </div>
              </div>

            </div>

            {/* Section 5: Module Progress & Challenges Section */}
            <section className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#F3F4F6] tracking-tight">Module Progress & Challenges</h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Explore security paths and track your curriculum completion status.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modulesProgress.map((mod) => (
                  <div key={mod.id} className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#0F1115] border border-[#1F242F] rounded-md">
                          {mod.icon}
                        </div>
                        <h4 className="font-bold text-sm text-[#F3F4F6] leading-tight">{mod.title}</h4>
                      </div>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase font-mono ${mod.statusColor}`}>
                        {mod.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 mt-1">
                      <div className="flex justify-between text-[10px] font-mono text-[#9CA3AF]">
                        <span>Completed: {mod.completed} / {mod.total}</span>
                        <span className="text-[#3B82F6] font-bold">{mod.percent}%</span>
                      </div>
                      <Progress value={mod.percent} className="h-1.5" />
                    </div>

                    <button
                      onClick={() => onNavigate(mod.path)}
                      className="w-full text-center py-3 sm:py-2 h-11 sm:h-auto flex items-center justify-center text-xs font-semibold rounded bg-[#0F1115] hover:bg-[#1E2330] border border-[#1F242F] hover:border-[#3B82F6]/30 text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors cursor-pointer mt-1"
                    >
                      {mod.actionText}
                    </button>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar Right Column (1/3 width) */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            
            {/* Section 4: Recent Activity (Elevated) */}
            <section className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-[#1F242F]/60 pb-3">
                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#3B82F6]" /> Recent Training Logs
                </span>
              </div>
              
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[360px] pr-1 mt-1">
                {userProfile?.activities && userProfile.activities.length > 0 ? (
                  <div className="relative border-l border-[#1F242F] ml-2.5 pl-4 flex flex-col gap-4 py-1">
                    {userProfile.activities.map((activity) => {
                      let dotColor = 'bg-[#3B82F6]';
                      if (activity.type === 'badge_unlock') dotColor = 'bg-[#A855F7]';
                      else if (activity.type === 'level_up') dotColor = 'bg-[#F59E0B]';
                      else if (activity.type === 'module_completion') dotColor = 'bg-[#22C55E]';
                      else if (activity.type === 'certificate_earned') dotColor = 'bg-[#3B82F6]';

                      return (
                        <div key={activity.id} className="relative flex flex-col gap-0.5">
                          {/* Timeline dot */}
                          <span className={`absolute -left-[21px] top-1.5 w-2 h-2 rounded-full border border-[#0F1115] ${dotColor}`}></span>
                          
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="text-[11px] font-semibold text-[#F3F4F6]">{activity.title}</span>
                            <span className="text-[9px] text-[#6B7280] font-mono whitespace-nowrap">
                              {formatActivityTime(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#9CA3AF] leading-normal pr-1">
                            {activity.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-[#1F242F] rounded-lg">
                    <Clock className="w-6 h-6 text-[#1F242F] mb-1.5 animate-pulse" />
                    <p className="text-[10px] text-[#9CA3AF] px-3 leading-normal">
                      No recent activities recorded.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Section 7: Achievement Showcase (Upgraded) */}
            <section className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-[#1F242F]/60 pb-3">
                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                  <Award className="w-3.5 h-3.5 text-[#22C55E]" /> Achievement Showcase
                </span>
                <button
                  onClick={() => onNavigate('profile')}
                  className="text-[10px] text-[#3B82F6] font-semibold hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="flex flex-col gap-3 mt-1">
                {badgesPreviewList.map((badgeId) => {
                  const details = BADGE_DETAILS[badgeId];
                  if (!details) return null;
                  return (
                    <Tooltip key={badgeId} delayDuration={150}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between p-3 bg-[#0F1115] border border-[#22C55E]/30 hover:border-[#22C55E]/50 rounded-lg text-xs text-[#F3F4F6] cursor-pointer transition-all shadow-sm shadow-[#22C55E]/5 hover:scale-[1.01]">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-1 rounded bg-[#22C55E]/10 border border-[#22C55E]/20 flex-shrink-0">
                              <Award className="w-5 h-5 text-[#22C55E]" />
                            </div>
                            <span className="truncate font-bold text-xs text-[#22C55E] tracking-tight">{details.title}</span>
                          </div>
                          <span className="text-[9px] text-[#22C55E] font-mono font-bold bg-[#22C55E]/10 border border-[#22C55E]/20 px-1.5 py-0.5 rounded">Earned</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <div className="flex flex-col gap-1 text-left">
                          <span className="font-bold text-[#F3F4F6] text-xs">{details.title}</span>
                          <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-normal">{details.desc}</p>
                          <span className="text-[9px] text-[#3B82F6] font-mono mt-1.5 border-t border-[#1F242F] pt-1">
                            Requirement: {details.requirement}
                          </span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}

                {/* Next Target Locked Badge */}
                {nextLockedBadge && (
                  <Tooltip delayDuration={150}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-between p-3 bg-[#0F1115]/30 border border-[#1F242F]/60 rounded-lg text-xs text-[#9CA3AF] opacity-70 cursor-pointer hover:border-[#3B82F6]/20 transition-all hover:scale-[1.01]">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-1 rounded bg-[#0F1115] border border-[#1F242F] flex-shrink-0">
                            <Lock className="w-5 h-5 text-[#6B7280]" />
                          </div>
                          <span className="truncate font-medium text-xs text-[#9CA3AF] tracking-tight">{nextLockedBadge.title}</span>
                        </div>
                        <span className="text-[9px] text-[#6B7280] font-mono bg-[#0F1115] border border-[#1F242F] px-1.5 py-0.5 rounded">Locked</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <div className="flex flex-col gap-1 text-left">
                        <span className="font-bold text-[#E5E7EB] text-xs flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-[#9CA3AF]" /> {nextLockedBadge.title}
                        </span>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5 leading-normal">{nextLockedBadge.desc}</p>
                        <span className="text-[9px] text-[#F59E0B] font-mono mt-1.5 border-t border-[#1F242F] pt-1 font-semibold">
                          Target: {nextLockedBadge.requirement}
                        </span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* More indicator */}
                {remainingBadgesCount > 0 && (
                  <button
                    onClick={() => onNavigate('profile')}
                    className="w-full text-center py-3 sm:py-2 h-11 sm:h-auto flex items-center justify-center bg-[#0F1115]/20 hover:bg-[#0F1115]/50 border border-[#1F242F] rounded text-[10px] font-mono text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors cursor-pointer"
                  >
                    + {remainingBadgesCount} More Achievements
                  </button>
                )}
              </div>
            </section>

          </div>

        </div>

        {/* Section 6: Analytics Overview (Supporting Information at the Bottom) */}
        <section className="flex flex-col gap-4 border-t border-[#1F242F] pt-6 mt-4">
          <div>
            <h3 className="text-sm font-bold text-[#9CA3AF] uppercase tracking-wider">Analytics Overview</h3>
            <p className="text-[11px] text-[#6B7280] mt-0.5">Supporting learning metrics and security statistics.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Card: Total XP */}
            <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col justify-between min-h-[90px]">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Total XP</span>
              <div className="flex justify-between items-baseline mt-2">
                <div className="text-xl font-extrabold text-[#F3F4F6]">{totalXp} XP</div>
                <Trophy className="w-4 h-4 text-[#F59E0B]" />
              </div>
            </div>

            {/* Card: Accuracy */}
            <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col justify-between min-h-[90px]">
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-help w-max select-none">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Accuracy</span>
                    <span className="text-[8px] text-[#6B7280] border border-[#1F242F] px-1 rounded-sm font-mono">?</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Calculated as: (Correct Decisions / Total Scenarios Evaluated) * 100</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex justify-between items-baseline mt-2">
                <div className="text-xl font-extrabold text-[#F3F4F6]">{accuracyPercent}%</div>
                <Percent className="w-4 h-4 text-[#3B82F6]" />
              </div>
            </div>

            {/* Card: Completed Scenarios */}
            <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col justify-between min-h-[90px]">
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-help w-max select-none">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Completed Scenarios</span>
                    <span className="text-[8px] text-[#6B7280] border border-[#1F242F] px-1 rounded-sm font-mono">?</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Total number of lab and quiz questions answered successfully.</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex justify-between items-baseline mt-2">
                <div className="text-xl font-extrabold text-[#F3F4F6]">{totalCompleted}</div>
                <CheckSquare className="w-4 h-4 text-[#22C55E]" />
              </div>
            </div>

          </div>
        </section>

      </div>
    </TooltipProvider>
  );
}
