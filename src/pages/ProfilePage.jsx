import { useState } from 'react';
import { useAuth, calculateLevelProgress } from '../context/AuthContext';
import { Award, Mail, Calendar, User, Save, ShieldAlert, BadgeCheck, FileText, Download, Eye, X } from 'lucide-react';

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

  const handleDownloadPNG = (cert) => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 1600; // high res width
    canvas.height = 1200; // high res height
    const ctx = canvas.getContext('2d');

    // Fill background: dark slate (#0F1115)
    ctx.fillStyle = '#0F1115';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw inner card: #171A21
    ctx.fillStyle = '#171A21';
    ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);

    // Draw border: #1F242F
    ctx.strokeStyle = '#1F242F';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    // Draw frame: #3B82F6
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 1. Logo
    ctx.fillStyle = '#3B82F6';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('CYBERQUEST', canvas.width / 2, 180);

    // 2. Main title
    ctx.fillStyle = '#F3F4F6';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, 280);

    // 3. Awarded to text
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '500 24px sans-serif';
    ctx.fillText('This certificate is proudly awarded to', canvas.width / 2, 420);

    // 4. User name
    ctx.fillStyle = '#F3F4F6';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText(userProfile?.displayName || user?.displayName || 'Cyber Cadet', canvas.width / 2, 510);

    // 5. For completing text
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '500 24px sans-serif';
    ctx.fillText('for successfully completing the learning path', canvas.width / 2, 620);

    // 6. Module Name
    ctx.fillStyle = '#3B82F6';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(cert.module, canvas.width / 2, 700);

    // 7. Score
    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(`Score: ${cert.score}/10`, canvas.width / 2, 800);

    // 8. Issued Date & ID
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '22px monospace';
    const dateFormatted = new Date(cert.issuedAt).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    ctx.fillText(`Issued: ${dateFormatted}`, canvas.width / 2, 940);
    ctx.fillText(`Certificate ID: ${cert.id}`, canvas.width / 2, 990);

    // Export as download
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate_${cert.module.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
    {
      id: 'AIExplorer',
      title: 'AI Explorer',
      desc: 'Generated your first AI challenge using Gemini.',
      earned: userProfile?.badges?.includes('AIExplorer') || false,
    },
    {
      id: 'CertifiedLearner',
      title: 'Certified Learner',
      desc: 'Earned your first training completion certificate on CyberQuest.',
      earned: userProfile?.badges?.includes('CertifiedLearner') || false,
    },
    {
      id: 'OWASPExplorer',
      title: 'OWASP Explorer',
      desc: 'Completed the OWASP Top 10 Defenses learning path.',
      earned: userProfile?.badges?.includes('OWASPExplorer') || false,
    },
    {
      id: 'ThreatHunter',
      title: 'Threat Hunter',
      desc: 'Scored 8/10 or higher in the OWASP Top 10 Defenses lab.',
      earned: userProfile?.badges?.includes('ThreatHunter') || false,
    },
    {
      id: 'ApplicationGuardian',
      title: 'Application Guardian',
      desc: 'Scored a perfect 10/10 in the OWASP Top 10 Defenses lab.',
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

          {/* Certificates List Section */}
          <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4">
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
                        onClick={() => handleDownloadPNG(cert)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1115]/80 p-4 animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#171A21] border border-[#1F242F] rounded-lg p-8 md:p-12 shadow-lg flex flex-col items-center text-center gap-6">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveCert(null)}
              className="absolute top-4 right-4 p-1.5 rounded-md border border-[#1F242F] hover:border-[#EF4444]/30 bg-[#0F1115] text-[#9CA3AF] hover:text-[#EF4444] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Accent border frame line */}
            <div className="absolute inset-4 border border-[#3B82F6]/30 rounded pointer-events-none"></div>

            {/* Logo */}
            <div className="text-sm font-extrabold text-[#3B82F6] tracking-widest uppercase">
              CYBER<span className="text-[#F3F4F6]">QUEST</span>
            </div>

            {/* Main Header */}
            <div className="flex flex-col gap-1 mt-2">
              <h3 className="text-xl md:text-2xl font-black text-[#F3F4F6] tracking-tight">
                CERTIFICATE OF COMPLETION
              </h3>
              <p className="text-[10px] text-[#9CA3AF] uppercase tracking-widest font-mono">
                Defensive Cybersecurity Training
              </p>
            </div>

            {/* Awarded To */}
            <div className="flex flex-col gap-2 mt-4">
              <span className="text-xs text-[#9CA3AF] italic">
                This certificate is proudly awarded to
              </span>
              <span className="text-2xl font-bold text-[#F3F4F6] border-b border-[#1F242F] pb-2 px-8 min-w-[200px]">
                {userProfile?.displayName || user?.displayName || 'Cyber Cadet'}
              </span>
            </div>

            {/* Module Completed */}
            <div className="flex flex-col gap-1.5 mt-2">
              <span className="text-xs text-[#9CA3AF]">
                for successfully completing the training path
              </span>
              <span className="text-lg font-bold text-[#3B82F6]">
                {activeCert.module}
              </span>
            </div>

            {/* Score */}
            <div className="text-xs font-semibold px-3 py-1 rounded bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] font-mono mt-1">
              Score: {activeCert.score} / 10
            </div>

            {/* Metadata (Date & Prominent Certificate ID) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full border-t border-[#1F242F] pt-6 mt-4 text-left font-mono text-[11px] text-[#9CA3AF]">
              <div>
                <span className="text-[#6B7280] block text-[9px] uppercase tracking-wider">Date Issued</span>
                <span className="text-[#F3F4F6]">
                  {new Date(activeCert.issuedAt).toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="md:text-right">
                <span className="text-[#6B7280] block text-[9px] uppercase tracking-wider font-mono">Verification Code</span>
                <span className="text-[#3B82F6] font-bold tracking-wider">
                  {activeCert.id}
                </span>
              </div>
            </div>

            {/* Download Action */}
            <div className="flex gap-3 mt-6 w-full justify-center">
              <button
                onClick={() => handleDownloadPNG(activeCert)}
                className="inline-flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <Download className="w-4 h-4" /> Download Certificate PNG
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
