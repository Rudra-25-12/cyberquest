import { useAuth, calculateLevelProgress } from '../context/AuthContext';
import { Award, BookOpen, Lock, ShieldCheck, Zap, Key, Eye } from 'lucide-react';

/**
 * DashboardPage Component.
 * @param {Object} props
 * @param {function(string):void} props.onNavigate - Page router utility
 */
export default function DashboardPage({ onNavigate, onShowToast }) {
  const { userProfile } = useAuth();
  const xp = userProfile?.xp || 0;
  const { level, maxXp, percent } = calculateLevelProgress(xp);

  // Basic learning tracks info to mock learning structure
  const learningTracks = [
    {
      id: 'fundamentals',
      title: 'Security Fundamentals',
      desc: 'Master basic network security, threat modeling, and defensive system principles.',
      xp: 200,
      challenges: 5,
      status: 'in_development',
      badgeColor: 'text-[#9CA3AF] bg-[#171A21] border-[#1F242F]',
      icon: <ShieldCheck className="w-5 h-5 text-[#9CA3AF]" />
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
      id: 'owasp',
      title: 'OWASP Top 10 Defenses',
      desc: 'Investigate injection flaws, XSS exploits, and broken authentication scenarios.',
      xp: 500,
      challenges: 12,
      status: 'coming_soon',
      badgeColor: 'text-[#9CA3AF] bg-[#171A21] border-[#1F242F]',
      icon: <Key className="w-5 h-5 text-[#9CA3AF]" />
    }
  ];

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
            <span className="text-3xl font-extrabold text-[#F3F4F6]">0</span>
            <span className="text-sm text-[#9CA3AF]">/ {learningTracks.filter(t => t.status !== 'coming_soon').length} Completed</span>
          </div>
          <span className="text-[11px] text-[#9CA3AF] mt-1">Fundamentals lab active.</span>
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
                        if (track.id === 'phishing') {
                          onNavigate('phishing-detective');
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
