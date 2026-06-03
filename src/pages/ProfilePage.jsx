import { useState, useEffect } from 'react';
import { useAuth, calculateLevelProgress } from '../context/AuthContext';
import { Award, Mail, Calendar, User, Save, ShieldAlert, BadgeCheck, FileText, Download, Eye, X } from 'lucide-react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../components/ui/HoverCard';

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

  const handleDownloadPNG = (cert) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1200;
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

    // 1. Logo (CYBERQUEST)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#3B82F6';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('CYBERQUEST', canvas.width / 2, 160);

    // 2. Certificate of Completion Title
    ctx.fillStyle = '#9CA3AF';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, 230);

    // 3. Awarded to Statement
    ctx.fillStyle = '#9CA3AF';
    ctx.font = 'italic 22px Georgia, serif';
    ctx.fillText('This certificate is proudly awarded to', canvas.width / 2, 320);

    // 4. Learner Name (Largest visual element, Solid White)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 68px sans-serif';
    ctx.fillText(userProfile?.displayName || user?.displayName || 'Cyber Cadet', canvas.width / 2, 420);

    // 5. Professional Certification Statement
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '22px sans-serif';
    ctx.fillText('has met all required standards and successfully demonstrated proficiency in the curriculum of', canvas.width / 2, 530);

    // 6. Module Name (Accent-colored element, prominent but de-emphasized size)
    ctx.fillStyle = '#3B82F6';
    ctx.font = 'bold 46px sans-serif';
    ctx.fillText(cert.module.toUpperCase(), canvas.width / 2, 620);

    // 7. Achievement Summary Panel Box
    const boxWidth = 520;
    const boxHeight = 110;
    const boxX = (canvas.width - boxWidth) / 2;
    const boxY = 700;

    // Draw Box Background
    ctx.fillStyle = '#0F1115';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    // Draw Box Border
    ctx.strokeStyle = '#1F242F';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Draw Box Divider Line
    ctx.strokeStyle = '#1F242F';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, boxY);
    ctx.lineTo(canvas.width / 2, boxY + boxHeight);
    ctx.stroke();

    // Draw Left Half (Final Score)
    ctx.fillStyle = '#6B7280';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('FINAL SCORE', boxX + boxWidth / 4, boxY + 30);
    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 30px monospace';
    ctx.fillText(`${cert.score} / 10`, boxX + boxWidth / 4, boxY + 70);

    // Draw Right Half (Path Status)
    ctx.fillStyle = '#6B7280';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('PATH STATUS', boxX + (boxWidth * 3) / 4, boxY + 30);
    ctx.fillStyle = '#3B82F6';
    ctx.font = 'bold 30px monospace';
    ctx.fillText('SECURE', boxX + (boxWidth * 3) / 4, boxY + 70);

    // 8. CyberQuest Verified Badge stamp on the bottom-right quadrant
    const sealX = 1360;
    const sealY = 755;
    
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 70, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(sealX, sealY, 62, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('CYBERQUEST', sealX, sealY - 15);
    ctx.fillText('VERIFIED', sealX, sealY + 15);

    // 9. Subtle centered Certification Seal near lower section
    const centerSealX = 800;
    const centerSealY = 900;
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
    ctx.lineWidth = 2;
    
    // Outer circle
    ctx.beginPath();
    ctx.arc(centerSealX, centerSealY, 56, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner circle
    ctx.beginPath();
    ctx.arc(centerSealX, centerSealY, 50, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('CYBERQUEST', centerSealX, centerSealY - 18);
    ctx.fillText('VERIFIED', centerSealX, centerSealY + 2);
    
    ctx.fillStyle = '#9CA3AF';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(new Date(cert.issuedAt).getFullYear().toString(), centerSealX, centerSealY + 22);

    // 10. Left Side Metadata columns (Date Issued, Certificate ID)
    const dateFormatted = new Date(cert.issuedAt).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    ctx.textAlign = 'left';
    ctx.fillStyle = '#6B7280';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('DATE ISSUED', 150, 940);
    ctx.fillStyle = '#F3F4F6';
    ctx.font = '22px monospace';
    ctx.fillText(dateFormatted, 150, 975);

    ctx.fillStyle = '#6B7280';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('CERTIFICATE ID', 150, 1035);
    ctx.fillStyle = '#F3F4F6';
    ctx.font = '22px monospace';
    ctx.fillText(cert.id, 150, 1070);

    // 11. Right Side Metadata columns (Verification Code, Verification URL)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#6B7280';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('VERIFICATION CODE', 1450, 940);
    ctx.fillStyle = '#3B82F6';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(cert.id, 1450, 975);

    ctx.fillStyle = '#6B7280';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('VERIFICATION LINK', 1450, 1035);
    ctx.fillStyle = '#3B82F6';
    ctx.font = '22px monospace';
    ctx.fillText('cyberquest.verify', 1450, 1070);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1115]/80 p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl flex flex-col gap-4">
            
            {/* External Controls Top Bar */}
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-mono font-bold text-[#6B7280] tracking-wider">CREDENTIAL PREVIEW</span>
              <button
                onClick={() => setActiveCert(null)}
                className="p-1.5 rounded-md border border-[#1F242F] hover:border-[#EF4444]/30 bg-[#171A21] text-[#9CA3AF] hover:text-[#EF4444] transition-colors cursor-pointer focus:outline-none"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Certificate Document (Self-contained credential card) */}
            <div className="relative w-full bg-[#171A21] border border-[#1F242F] rounded-lg p-8 md:p-12 shadow-2xl flex flex-col items-center text-center gap-6 overflow-hidden">
              {/* Accent border frame line */}
              <div className="absolute inset-4 border border-[#3B82F6]/30 rounded pointer-events-none"></div>

              {/* Logo & Seal */}
              <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 border-b border-[#1F242F]/60 pb-4">
                <div className="text-sm font-extrabold text-[#3B82F6] tracking-widest uppercase">
                  CYBER<span className="text-[#F3F4F6]">QUEST</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/5 text-[#22C55E] text-[10px] font-mono uppercase tracking-wider font-semibold">
                  <BadgeCheck className="w-3.5 h-3.5" /> CYBERQUEST VERIFIED
                </div>
              </div>

              {/* Main Header */}
              <div className="flex flex-col gap-1 mt-2">
                <h3 className="text-xs text-[#9CA3AF] uppercase tracking-widest font-mono font-semibold">
                  Certificate of Completion
                </h3>
              </div>

              {/* Awarded To */}
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-xs text-[#9CA3AF] italic font-serif">
                  This certificate is proudly awarded to
                </span>
              </div>

              {/* Learner Name (Largest visual element, Solid White) */}
              <div className="mt-1">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide uppercase">
                  {userProfile?.displayName || user?.displayName || 'Cyber Cadet'}
                </h2>
              </div>

              {/* Professional Statement */}
              <p className="text-xs text-[#9CA3AF] max-w-md mx-auto leading-relaxed mt-1">
                has met all required standards and successfully demonstrated proficiency in the curriculum of
              </p>

              {/* Module Completed (Accent-colored element, prominent but de-emphasized size text-lg md:text-xl) */}
              <div className="mt-1">
                <h1 className="text-lg md:text-xl font-bold text-[#3B82F6] uppercase tracking-tight">
                  {activeCert.module}
                </h1>
              </div>

              {/* Achievement Summary Panel (Score & Status) */}
              <div className="w-full bg-[#0F1115] border border-[#1F242F] rounded-lg p-4 grid grid-cols-2 gap-4 text-center max-w-md mt-2">
                <div className="border-r border-[#1F242F]">
                  <span className="text-[10px] uppercase tracking-wider text-[#6B7280] font-mono block">Final Score</span>
                  <span className="text-sm font-bold font-mono text-[#22C55E]">{activeCert.score} / 10</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#6B7280] font-mono block">Path Status</span>
                  <span className="text-sm font-bold font-mono text-[#3B82F6]">SECURE</span>
                </div>
              </div>

              {/* Subtle Certification Seal near lower section */}
              <div className="flex flex-col items-center justify-center border border-[#22C55E]/30 bg-[#22C55E]/5 rounded-full w-20 h-20 mt-2 select-none">
                <BadgeCheck className="w-6 h-6 text-[#22C55E]" />
                <span className="text-[7px] font-mono font-bold tracking-wider text-[#22C55E] mt-0.5 text-center leading-none">
                  CYBERQUEST<br />VERIFIED
                </span>
                <span className="text-[8px] font-mono font-bold text-[#9CA3AF] mt-0.5">{new Date(activeCert.issuedAt).getFullYear()}</span>
              </div>

              {/* Metadata (Date & Prominent Certificate ID) */}
              <div className="grid grid-cols-2 gap-4 w-full border-t border-[#1F242F] pt-6 mt-4 text-left font-mono text-[11px] text-[#9CA3AF]">
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
                <div className="text-right">
                  <span className="text-[#6B7280] block text-[9px] uppercase tracking-widest font-mono font-semibold">Verification Code</span>
                  <span className="text-[#3B82F6] font-mono text-xs font-bold tracking-widest mt-1 block">
                    {activeCert.id}
                  </span>
                </div>
              </div>
            </div>

            {/* External Download Action (Separated below the card) */}
            <div className="flex justify-center w-full">
              <button
                onClick={() => handleDownloadPNG(activeCert)}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-3 rounded-md text-sm font-semibold transition-all cursor-pointer shadow-lg hover:shadow-xl border border-[#3B82F6]/10"
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
