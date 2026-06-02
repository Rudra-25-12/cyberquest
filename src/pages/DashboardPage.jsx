import { useMemo } from 'react';
import { useAuth, calculateLevelProgress } from '../context/AuthContext';
import { Award, BookOpen, Lock, ShieldCheck, Zap, Key, Eye, Sparkles, Trophy, Percent, CheckSquare, ArrowRight, Clock } from 'lucide-react';
import { getStorageKey } from '../utils/storage';

/**
 * DashboardPage Component.
 * @param {Object} props
 * @param {function(string):void} props.onNavigate - Page router utility
 */
export default function DashboardPage({ onNavigate, onShowToast }) {
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
  const totalBadges = userProfile?.badges?.length || 0;

  const completedModulesCount = 
    (stats.completedPhishing === 10 ? 1 : 0) + 
    (stats.completedFundamentals === 10 ? 1 : 0) + 
    (stats.completedAi >= 5 ? 1 : 0) +
    (stats.completedOwasp === 10 ? 1 : 0);

  // Time formatter helper (pure to avoid react-hooks/purity errors)
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

  // Basic learning tracks info to mock learning structure
  const learningTracks = [
    {
      id: 'fundamentals',
      title: 'Security Fundamentals',
      desc: 'Master basic network security, threat modeling, and defensive system principles.',
      xp: 150,
      challenges: 10,
      status: 'available',
      badgeColor: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20',
      icon: <ShieldCheck className="w-5 h-5 text-[#3B82F6]" />
    },
    {
      id: 'phishing',
      title: 'Phishing Detective',
      desc: 'Analyze headers, investigate link redirects, and identify phishing scams in mock inbox scenarios.',
      xp: 350,
      challenges: 10,
      status: 'available',
      badgeColor: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20',
      icon: <Eye className="w-5 h-5 text-[#3B82F6]" />
    },
    {
      id: 'ai-challenge-lab',
      title: 'AI Challenge Lab',
      desc: 'Generate unlimited custom security challenges on demand using Gemini.',
      xp: '10 XP / lab',
      challenges: 'Unlimited',
      status: 'available',
      badgeColor: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20',
      icon: <Sparkles className="w-5 h-5 text-[#F59E0B]" />
    },
    {
      id: 'owasp',
      title: 'OWASP Top 10 Defenses',
      desc: 'Investigate injection flaws, XSS exploits, and broken authentication scenarios.',
      xp: 500,
      challenges: 10,
      status: 'available',
      badgeColor: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20',
      icon: <Key className="w-5 h-5 text-[#3B82F6]" />
    }
  ];

  const getRecommendation = () => {
    if (stats.completedPhishing < 10) {
      return {
        title: "Phishing Detective",
        desc: "Analyze headers, link redirects, and body contents in simulated inboxes to spot email threat vectors.",
        icon: <Eye className="w-5 h-5 text-[#3B82F6]" />,
        path: "phishing-detective",
        actionText: "Start Training",
        disabled: false
      };
    } else if (stats.completedFundamentals < 10) {
      return {
        title: "Security Fundamentals",
        desc: "Evaluate critical network concepts, USB safety protocols, MFA fatigue attacks, and browser permissions.",
        icon: <ShieldCheck className="w-5 h-5 text-[#3B82F6]" />,
        path: "security-fundamentals",
        actionText: "Start Training",
        disabled: false
      };
    } else if (stats.completedAi < 5) {
      return {
        title: "AI Challenge Lab",
        desc: "Generate and solve dynamic, customized threat scenarios powered by Gemini AI to test your defensive limits.",
        icon: <Sparkles className="w-5 h-5 text-[#F59E0B]" />,
        path: "ai-challenge-lab",
        actionText: "Start Training",
        disabled: false
      };
    } else if (stats.completedOwasp < 10) {
      return {
        title: "OWASP Top 10 Defenses",
        desc: "Master defenses against modern web vulnerabilities like SQL Injection, XSS, and broken access controls.",
        icon: <Key className="w-5 h-5 text-[#3B82F6]" />,
        path: "owasp",
        actionText: "Start Training",
        disabled: false
      };
    } else {
      return {
        title: "All Modules Completed",
        desc: "Congratulations! You have completed all active learning modules on CyberQuest.",
        icon: <Trophy className="w-5 h-5 text-[#22C55E]" />,
        path: "dashboard",
        actionText: "Training Complete",
        disabled: true
      };
    }
  };

  const recommendation = getRecommendation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
      
      {/* Welcome Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1F242F] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#F3F4F6] tracking-tight">
            Security Dashboard
          </h1>
          <p className="text-[#9CA3AF] mt-1 text-sm">
            Welcome back, <span className="text-[#F3F4F6] font-medium">{userProfile?.displayName || 'Cadet'}</span>. Continue your training challenges below.
          </p>
        </div>
        <button
          onClick={() => onNavigate('profile')}
          className="text-xs font-semibold px-3 py-1.5 rounded-md border border-[#1F242F] hover:border-[#3B82F6]/30 bg-[#171A21] text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors cursor-pointer"
        >
          View Profile & Achievements
        </button>
      </section>

      {/* Progress Cards Overview Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Experience Tracker */}
        <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Level Progress</span>
            <Zap className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-2xl font-bold text-[#F3F4F6]">Level {level}</span>
              <span className="text-xs text-[#9CA3AF]">{xp} / {maxXp} XP</span>
            </div>
            {/* Progress Bar container */}
            <div className="w-full bg-[#0F1115] h-2 rounded-full overflow-hidden border border-[#1F242F]">
              <div 
                className="bg-[#3B82F6] h-full rounded-full transition-all duration-500" 
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 2: Labs Completed */}
        <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Completed Labs</span>
            <BookOpen className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F3F4F6]">{completedModulesCount}</span>
            <span className="text-sm text-[#9CA3AF]">/ {learningTracks.filter(t => t.status !== 'coming_soon').length} Completed</span>
          </div>
          <span className="text-[11px] text-[#9CA3AF] mt-1">
            {completedModulesCount === 3 ? 'All modules completed!' : 'Training active.'}
          </span>
        </div>

        {/* Card 3: Badges Earned */}
        <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Earned Badges</span>
            <Award className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#F3F4F6]">{userProfile?.badges?.length || 1}</span>
            <span className="text-sm text-[#9CA3AF]">Badges Earned</span>
          </div>
          <span className="text-[11px] text-[#9CA3AF] mt-1">Current badge: {userProfile?.badges?.[0] || 'Initiate'}</span>
        </div>

      </section>

      <div className="border-t border-[#1F242F]"></div>

      {/* Analytics Overview Section */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-[#F3F4F6] tracking-tight">Analytics Overview</h2>
          <p className="text-sm text-[#9CA3AF] mt-1">Detailed performance metrics across all active modules.</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card: Total XP */}
          <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col justify-between min-h-[120px] shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Total XP</span>
              <Trophy className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-[#F3F4F6]">{totalXp} XP</div>
              <span className="text-[10px] text-[#9CA3AF] mt-1 block">Accumulated training score</span>
            </div>
          </div>

          {/* Card: Accuracy */}
          <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col justify-between min-h-[120px] shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Accuracy</span>
              <Percent className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-[#F3F4F6]">{accuracyPercent}%</div>
              <span className="text-[10px] text-[#9CA3AF] mt-1 block">Correct decisions ratio</span>
            </div>
          </div>

          {/* Card: Total Completed */}
          <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col justify-between min-h-[120px] shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Completed</span>
              <CheckSquare className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-[#F3F4F6]">{totalCompleted}</div>
              <span className="text-[10px] text-[#9CA3AF] mt-1 block">Total scenarios evaluated</span>
            </div>
          </div>

          {/* Card: Badges Earned */}
          <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col justify-between min-h-[120px] shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Badges</span>
              <Award className="w-4 h-4 text-[#A855F7]" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-[#F3F4F6]">{totalBadges}</div>
              <span className="text-[10px] text-[#9CA3AF] mt-1 block">Earned achievements</span>
            </div>
          </div>
        </div>
      </section>

      {/* Progress, Activity & Recommendations Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column (Modules & Recommendation) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Progress by Module */}
          <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-6">
            <h3 className="text-lg font-bold text-[#F3F4F6] tracking-tight">Progress by Module</h3>
            
            <div className="flex flex-col gap-5">
              {/* Phishing Detective */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#F3F4F6]">Phishing Detective</span>
                  <span className="text-[#9CA3AF] font-mono">{stats.completedPhishing} / 10 Completed</span>
                </div>
                <div className="w-full bg-[#0F1115] h-2 rounded-full overflow-hidden border border-[#1F242F]">
                  <div 
                    className="bg-[#3B82F6] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(stats.completedPhishing / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Security Fundamentals */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#F3F4F6]">Security Fundamentals</span>
                  <span className="text-[#9CA3AF] font-mono">{stats.completedFundamentals} / 10 Completed</span>
                </div>
                <div className="w-full bg-[#0F1115] h-2 rounded-full overflow-hidden border border-[#1F242F]">
                  <div 
                    className="bg-[#3B82F6] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(stats.completedFundamentals / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* AI Challenge Lab */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#F3F4F6]">AI Challenge Lab</span>
                  <span className="text-[#9CA3AF] font-mono">{stats.completedAi} / 5 Completed</span>
                </div>
                <div className="w-full bg-[#0F1115] h-2 rounded-full overflow-hidden border border-[#1F242F]">
                  <div 
                    className="bg-[#3B82F6] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (stats.completedAi / 5) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* OWASP Top 10 Defenses */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#F3F4F6]">OWASP Top 10 Defenses</span>
                  <span className="text-[#9CA3AF] font-mono">{stats.completedOwasp} / 10 Completed</span>
                </div>
                <div className="w-full bg-[#0F1115] h-2 rounded-full overflow-hidden border border-[#1F242F]">
                  <div 
                    className="bg-[#3B82F6] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(stats.completedOwasp / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Recommendation Card */}
          <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Learning Recommendation</span>
              <div className="flex items-center gap-3 mt-2">
                <div className="p-2 bg-[#0F1115] border border-[#1F242F] rounded-md">
                  {recommendation.icon}
                </div>
                <h4 className="font-bold text-[#F3F4F6] text-base">{recommendation.title}</h4>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">
                {recommendation.desc}
              </p>
            </div>
            <button
              onClick={() => !recommendation.disabled && onNavigate(recommendation.path)}
              disabled={recommendation.disabled}
              className={`w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all cursor-pointer ${
                recommendation.disabled
                  ? 'bg-[#0F1115] text-[#6B7280] border border-[#1F242F] cursor-not-allowed'
                  : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white hover:shadow-md'
              }`}
            >
              {recommendation.actionText}
              {!recommendation.disabled && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Right column (Timeline) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Recent Activity</span>
              <Clock className="w-4 h-4 text-[#9CA3AF]" />
            </div>
            
            <div className="mt-2 flex flex-col gap-4 overflow-y-auto max-h-[480px] pr-1">
              {userProfile?.activities && userProfile.activities.length > 0 ? (
                <div className="relative border-l border-[#1F242F] ml-3 pl-5 flex flex-col gap-5 py-2">
                  {userProfile.activities.map((activity) => {
                    let dotColor = 'bg-[#3B82F6]'; // default
                    if (activity.type === 'badge_unlock') dotColor = 'bg-[#A855F7]';
                    else if (activity.type === 'level_up') dotColor = 'bg-[#F59E0B]';
                    else if (activity.type === 'module_completion') dotColor = 'bg-[#22C55E]';
                    else if (activity.type === 'certificate_earned') dotColor = 'bg-[#3B82F6]';

                    return (
                      <div key={activity.id} className="relative flex flex-col gap-1">
                        {/* Timeline dot */}
                        <span className={`absolute -left-[26px] top-1.5 w-3 h-3 rounded-full border border-[#0F1115] ${dotColor}`}></span>
                        
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="text-xs font-semibold text-[#F3F4F6]">{activity.title}</span>
                          <span className="text-[10px] text-[#9CA3AF] font-mono whitespace-nowrap">
                            {formatActivityTime(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-[#9CA3AF] leading-relaxed pr-2">
                          {activity.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-[#1F242F] rounded-lg">
                  <Clock className="w-8 h-8 text-[#1F242F] mb-2 animate-pulse" />
                  <p className="text-xs text-[#9CA3AF] px-4 leading-normal">
                    No recent training events recorded. Start a challenge to begin your activity log.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </section>

      <div className="border-t border-[#1F242F]"></div>

      {/* Learning Tracks List */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-[#F3F4F6] tracking-tight">Cybersecurity Challenges</h2>
          <p className="text-sm text-[#9CA3AF] mt-1">Complete labs to practice your skills and level up.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningTracks.map((track) => {
            const isAvailable = track.status === 'available';
            const isInDevelopment = track.status === 'in_development';

            return (
              <div 
                key={track.id}
                className={`bg-[#171A21] border p-6 rounded-lg flex flex-col justify-between gap-6 transition-all duration-300 ${
                  isAvailable 
                    ? 'border-[#1F242F] hover:border-[#3B82F6]/20' 
                    : 'border-[#1F242F]/60 opacity-80'
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className={`p-2.5 rounded-lg border ${
                      isAvailable ? 'bg-[#3B82F6]/5 border-[#3B82F6]/10' : 'bg-[#0F1115]/50 border-[#1F242F]/50'
                    }`}>
                      {track.icon}
                    </div>
                    {isAvailable && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                        Active
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-base ${isAvailable ? 'text-[#F3F4F6]' : 'text-[#9CA3AF]'}`}>
                      {track.title}
                    </h3>
                    <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed min-h-[60px]">
                      {track.desc}
                    </p>
                    <div className="flex items-center gap-3 mt-4 text-xs text-[#9CA3AF] font-mono border-t border-[#1F242F]/60 pt-4">
                      <span>XP: <strong className="text-[#F3F4F6]">{track.xp}</strong></span>
                      <span>•</span>
                      <span>Labs: <strong className="text-[#F3F4F6]">{track.challenges}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="w-full mt-2">
                  {isAvailable ? (
                    <button
                      onClick={() => {
                        console.log("[DashboardPage] Start Path clicked for track:", track.id);
                        if (track.id === 'phishing') {
                          onNavigate('phishing-detective');
                        } else if (track.id === 'fundamentals') {
                          onNavigate('security-fundamentals');
                        } else if (track.id === 'ai-challenge-lab') {
                          onNavigate('ai-challenge-lab');
                        } else if (track.id === 'owasp') {
                          onNavigate('owasp');
                        } else if (onShowToast) {
                          onShowToast("Lab loading...", "info");
                        }
                      }}
                      className="w-full px-4 py-2 text-sm font-semibold rounded bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-all cursor-pointer shadow-sm hover:shadow-md text-center block"
                    >
                      Start Path
                    </button>
                  ) : isInDevelopment ? (
                    <span className="w-full inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#1F242F] text-xs font-semibold text-[#9CA3AF] bg-[#0F1115]/50 justify-center">
                      <Lock className="w-3.5 h-3.5" /> In Development
                    </span>
                  ) : (
                    <span className="w-full inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#1F242F] text-xs font-semibold text-[#9CA3AF] bg-[#0F1115]/50 justify-center">
                      <Lock className="w-3.5 h-3.5" /> Coming Soon
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
