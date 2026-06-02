import { useState } from 'react';
import { mockScenarios } from '../data/mockScenarios';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Mail, 
  RotateCcw, 
  Info,
  ChevronRight,
  Eye,
  User,
  Globe,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

/**
 * PhishingDetectivePage Component.
 * @param {Object} props
 * @param {function(string, string):void} props.onShowToast - Notification callback
 */
export default function PhishingDetectivePage({ onShowToast }) {
  const { updateProgression } = useAuth();
  const scenarios = mockScenarios;
  const [selectedId, setSelectedId] = useState(scenarios[0]?.id || null);
  const [answers, setAnswers] = useState(() => {
    // Initialise from localStorage if exists
    try {
      const saved = localStorage.getItem('cyberquest_phishing_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  
  // Selected choice before submitting (null | 'safe' | 'phishing')
  const [currentSelection, setCurrentSelection] = useState(null);
  
  // Track mobile view: 'list' or 'reader'
  const [mobileTab, setMobileTab] = useState('list');

  // Investigation Mode states
  const [revealedTools, setRevealedTools] = useState({
    sender: false,
    domain: false,
    link: false
  });
  const [inspectedClues, setInspectedClues] = useState([]);

  const toggleTool = (toolKey) => {
    setRevealedTools(prev => {
      const isOpening = !prev[toolKey];
      if (isOpening && !inspectedClues.includes(toolKey) && !answers[selectedId]) {
        setInspectedClues(curr => [...curr, toolKey]);
      }
      return { ...prev, [toolKey]: isOpening };
    });
  };

  const selectedScenario = scenarios.find(s => s.id === selectedId);

  // Submit current answer
  const handleSubmit = async () => {
    if (!currentSelection || !selectedScenario) return;

    const isUserClaimingPhishing = currentSelection === 'phishing';
    const isCorrect = isUserClaimingPhishing === selectedScenario.isPhishing;

    const updatedAnswers = {
      ...answers,
      [selectedScenario.id]: {
        userChoice: currentSelection,
        submitted: true,
        isCorrect,
        cluesInspectedCount: inspectedClues.length
      }
    };

    setAnswers(updatedAnswers);
    setCurrentSelection(null);
    
    try {
      localStorage.setItem('cyberquest_phishing_answers', JSON.stringify(updatedAnswers));
    } catch (e) {
      console.error(e);
    }

    if (isCorrect) {
      onShowToast('Correct answer! Good analysis.', 'success');
    } else {
      onShowToast('Incorrect analysis. Review the red flags.', 'error');
    }

    // Progression System Integration (XP and Badges)
    try {
      const isFirstChallenge = Object.keys(answers).length === 0;
      const xpEarned = isCorrect ? 10 : 0;
      const badgeToUnlock = isFirstChallenge ? 'FirstInvestigation' : null;

      // 1. Submit single challenge score
      const res = await updateProgression(xpEarned, badgeToUnlock);
      if (res) {
        handleProgressionToasts(res);
      }

      // 2. Submit completion score bonus when all 10 labs are answered
      const currentAnsweredCount = Object.keys(updatedAnswers).length;
      if (currentAnsweredCount === scenarios.length) {
        const correctCount = Object.values(updatedAnswers).filter(a => a.isCorrect).length;
        let completionXP = 0;
        let completionBadge = null;

        if (correctCount === 10) {
          completionXP = 50;
          completionBadge = 'PerfectAnalyst';
        } else if (correctCount >= 8) {
          completionXP = 25;
          completionBadge = 'PhishingInvestigator';
        }

        if (completionXP > 0 || completionBadge) {
          setTimeout(async () => {
            try {
              const compRes = await updateProgression(completionXP, completionBadge);
              if (compRes) {
                handleProgressionToasts(compRes);
              }
            } catch (err) {
              console.error("Completion bonus sync failed:", err);
            }
          }, 2200);
        }
      }
    } catch (err) {
      console.error("Progression updates failed:", err);
    }
  };

  const handleProgressionToasts = (res) => {
    if (!res) return;

    if (res.levelUp) {
      onShowToast(`Level Up! You are now Level ${res.newLevel}!`, 'success');
    } else if (res.xpEarned > 0) {
      onShowToast(`+${res.xpEarned} XP Earned`, 'info');
    }

    if (res.badgeUnlocked) {
      const badgeTitles = {
        'FirstInvestigation': 'First Investigation',
        'PhishingInvestigator': 'Phishing Investigator',
        'PerfectAnalyst': 'Perfect Analyst'
      };
      const title = badgeTitles[res.badgeUnlocked] || res.badgeUnlocked;
      setTimeout(() => {
        onShowToast(`Achievement Unlocked: ${title}!`, 'success');
      }, 1000);
    }
  };

  // Reset all progress
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all your progress and try again?')) {
      setAnswers({});
      setCurrentSelection(null);
      setSelectedId(scenarios[0]?.id || null);
      setRevealedTools({
        sender: false,
        domain: false,
        link: false
      });
      setInspectedClues([]);
      setMobileTab('list');
      try {
        localStorage.removeItem('cyberquest_phishing_answers');
      } catch (e) {
        console.error(e);
      }
      onShowToast('Progress reset successfully.', 'info');
    }
  };

  // Proceed to the next uncompleted scenario
  const handleNext = () => {
    const currentIndex = scenarios.findIndex(s => s.id === selectedId);
    
    // Find next unsubmitted scenario starting from current index
    let nextIndex = (currentIndex + 1) % scenarios.length;

    for (let i = 0; i < scenarios.length; i++) {
      const checkIndex = (currentIndex + 1 + i) % scenarios.length;
      if (!answers[scenarios[checkIndex].id]) {
        nextIndex = checkIndex;
        break;
      }
    }

    setSelectedId(scenarios[nextIndex].id);
    setCurrentSelection(null);
    setRevealedTools({
      sender: false,
      domain: false,
      link: false
    });
    setInspectedClues([]);
    setMobileTab('reader');
  };

  // Total statistics
  const totalScenarios = scenarios.length;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
  const isAllCompleted = answeredCount === totalScenarios;

  // Selected item answer status
  const currentAnswer = answers[selectedId];

  // Colors for difficulty badges
  const difficultyBadge = (difficulty) => {
    const classes = {
      easy: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
      medium: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
      hard: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
    };
    return classes[difficulty] || classes.easy;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1F242F] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#F3F4F6] tracking-tight">Phishing Detective</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            Analyze each email below, spot potential red flags, and classify them as Safe or Phishing.
          </p>
        </div>
        
        {answeredCount > 0 && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md border border-[#1F242F] hover:border-[#EF4444]/30 bg-[#171A21] text-[#9CA3AF] hover:text-[#EF4444] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Progress
          </button>
        )}
      </section>

      {/* Main UI Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#1F242F] bg-[#171A21] border border-[#1F242F] rounded-lg overflow-hidden min-h-[620px]">
        
        {/* LEFT COLUMN: INBOX LIST (Visible always on desktop, hidden on mobile depending on active tab) */}
        <div className={`col-span-1 flex flex-col ${mobileTab === 'reader' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-[#1F242F] bg-[#171A21] flex justify-between items-center">
            <span className="text-sm font-bold text-[#F3F4F6] tracking-tight flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#3B82F6]" />
              Inbox ({answeredCount}/{totalScenarios})
            </span>
            {isAllCompleted && (
              <span className="text-[10px] font-bold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 px-2 py-0.5 rounded">
                All Solved
              </span>
            )}
          </div>

          {/* Inbox Items Scroll Pane */}
          <div className="flex-grow overflow-y-auto divide-y divide-[#1F242F]/60 max-h-[550px] lg:max-h-[600px]">
            {scenarios.map((scenario) => {
              const answer = answers[scenario.id];
              const isSelected = scenario.id === selectedId;

              return (
                <button
                  key={scenario.id}
                  onClick={() => {
                    setSelectedId(scenario.id);
                    setMobileTab('reader');
                    setCurrentSelection(null);
                    setRevealedTools({
                      sender: false,
                      domain: false,
                      link: false
                    });
                    setInspectedClues([]);
                  }}
                  className={`w-full text-left p-4 flex flex-col gap-2 hover:bg-[#242936]/40 transition-colors focus:outline-none cursor-pointer ${
                    isSelected ? 'bg-[#0F1115]' : ''
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-xs font-semibold truncate ${isSelected ? 'text-[#3B82F6]' : 'text-[#F3F4F6]'}`}>
                      {scenario.senderName}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF] font-mono whitespace-nowrap">
                      {scenario.date}
                    </span>
                  </div>
                  
                  <h4 className="text-xs font-medium text-[#F3F4F6] truncate max-w-[240px]">
                    {scenario.subject}
                  </h4>
                  
                  <div className="flex justify-between items-center mt-1">
                    {/* Difficulty Badge */}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border capitalize ${difficultyBadge(scenario.difficulty)}`}>
                      {scenario.difficulty}
                    </span>

                    {/* Status indicator */}
                    <div className="flex items-center">
                      {answer ? (
                        answer.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#EF4444]" />
                        )
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: EMAIL READER PANE */}
        <div className={`col-span-2 flex flex-col bg-[#0F1115] ${mobileTab === 'list' ? 'hidden lg:flex' : 'flex'}`}>
          {selectedScenario ? (
            <>
              {/* Reader Header */}
              <div className="p-4 border-b border-[#1F242F] bg-[#171A21] flex justify-between items-center gap-4">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setMobileTab('list')}
                  className="lg:hidden inline-flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors focus:outline-none cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Inbox
                </button>

                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-xs text-[#9CA3AF]">Vulnerability Lab Scenario</span>
                </div>

                <div className="text-xs font-semibold font-mono text-[#9CA3AF]">
                  Email {scenarios.findIndex(s => s.id === selectedId) + 1} of {totalScenarios}
                </div>
              </div>

              {/* Scorecard Box if everything completed */}
              {isAllCompleted && (
                <div className="mx-6 mt-6 bg-[#171A21] border border-[#3B82F6]/20 p-5 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#3B82F6]/10 rounded-lg text-[#3B82F6]">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#F3F4F6]">Lab Session Completed</h4>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        You analyzed all 10 emails. Final score: <strong className="text-[#F3F4F6] font-semibold">{correctCount} / {totalScenarios}</strong> correct.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="w-full md:w-auto text-xs font-semibold bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-md transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Email Content Container */}
              <div className="p-6 flex-grow overflow-y-auto max-h-[480px]">
                {/* Simulated Email Envelope Headers */}
                <div className="border border-[#1F242F] bg-[#171A21] rounded-t-lg p-4 flex flex-col gap-2 font-sans border-b-0">
                  <div className="text-xs flex flex-wrap items-baseline gap-1 text-[#9CA3AF]">
                    <span className="font-semibold text-[#F3F4F6] w-12 flex-shrink-0">From:</span>
                    <span className="text-[#F3F4F6] font-medium">{selectedScenario.senderName}</span>
                    <span className="text-[#9CA3AF]">&lt;{selectedScenario.senderEmail}&gt;</span>
                  </div>
                  <div className="text-xs flex items-baseline gap-1 text-[#9CA3AF]">
                    <span className="font-semibold text-[#F3F4F6] w-12 flex-shrink-0">To:</span>
                    <span>workspace-cadet@cyberquest.local</span>
                  </div>
                  <div className="text-xs flex items-baseline gap-1 text-[#9CA3AF]">
                    <span className="font-semibold text-[#F3F4F6] w-12 flex-shrink-0">Date:</span>
                    <span>{selectedScenario.date}</span>
                  </div>
                  <div className="text-xs flex items-baseline gap-1 text-[#9CA3AF] border-t border-[#1F242F]/60 pt-2 mt-1">
                    <span className="font-semibold text-[#F3F4F6] w-12 flex-shrink-0">Subject:</span>
                    <span className="text-[#F3F4F6] font-semibold">{selectedScenario.subject}</span>
                  </div>
                </div>

                {/* Email Body Panel */}
                <div className="border border-[#1F242F] bg-[#171A21] rounded-b-lg p-6 font-mono text-xs leading-relaxed whitespace-pre-wrap text-[#F3F4F6] break-words border-t border-[#1F242F]/50">
                  {selectedScenario.body}
                </div>

                {/* Investigation Tools Panel */}
                {selectedScenario.investigation && (
                  <div className="mt-6 bg-[#171A21] border border-[#1F242F] rounded-lg p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-semibold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-[#3B82F6]" /> Investigation Tools
                      </h4>
                      {!currentAnswer && inspectedClues.length > 0 && (
                        <span className="text-[10px] bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 px-2 py-0.5 rounded-full font-mono font-semibold">
                          {inspectedClues.length} / 3 Clues Inspected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#9CA3AF] -mt-1 leading-snug">
                      Analyze the message details below to discover potential warning signs or verify safety.
                    </p>

                    <div className="flex flex-col gap-3">
                      {/* Tool 1: Inspect Sender */}
                      <div className="border border-[#1F242F] rounded-md overflow-hidden bg-[#0F1115]">
                        <button
                          type="button"
                          onClick={() => toggleTool('sender')}
                          className="w-full flex items-center justify-between p-3 text-xs font-semibold text-[#F3F4F6] hover:bg-[#242936]/40 transition-colors focus:outline-none cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#3B82F6]" />
                            <span>Inspect Sender Address</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {inspectedClues.includes('sender') && (
                              <span className="text-[9px] font-mono bg-[#3B82F6]/10 text-[#3B82F6] px-1.5 py-0.5 rounded font-medium">Inspected</span>
                            )}
                            {revealedTools.sender ? (
                              <ChevronUp className="w-4 h-4 text-[#9CA3AF]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
                            )}
                          </div>
                        </button>
                        
                        {revealedTools.sender && selectedScenario.investigation.sender && (
                          <div className="p-4 border-t border-[#1F242F] bg-[#171A21]/40 text-xs flex flex-col gap-3">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block mb-1">What You See</span>
                              <div className="font-sans text-[#F3F4F6] bg-[#0F1115] border border-[#1F242F] px-3 py-2 rounded">
                                {selectedScenario.investigation.sender.see}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block mb-1">Actual Underlying Value</span>
                              <div className="font-mono text-[#3B82F6] bg-[#0F1115] border border-[#1F242F] px-3 py-2 rounded break-all">
                                {selectedScenario.investigation.sender.value}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block mb-1">
                                {selectedScenario.isPhishing ? 'Why it is Suspicious' : 'Why it is Safe'}
                              </span>
                              <div className="text-[#9CA3AF] leading-relaxed">
                                {selectedScenario.investigation.sender.why}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tool 2: Inspect Domain */}
                      <div className="border border-[#1F242F] rounded-md overflow-hidden bg-[#0F1115]">
                        <button
                          type="button"
                          onClick={() => toggleTool('domain')}
                          className="w-full flex items-center justify-between p-3 text-xs font-semibold text-[#F3F4F6] hover:bg-[#242936]/40 transition-colors focus:outline-none cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-[#3B82F6]" />
                            <span>Inspect Domain Security</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {inspectedClues.includes('domain') && (
                              <span className="text-[9px] font-mono bg-[#3B82F6]/10 text-[#3B82F6] px-1.5 py-0.5 rounded font-medium">Inspected</span>
                            )}
                            {revealedTools.domain ? (
                              <ChevronUp className="w-4 h-4 text-[#9CA3AF]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
                            )}
                          </div>
                        </button>
                        
                        {revealedTools.domain && selectedScenario.investigation.domain && (
                          <div className="p-4 border-t border-[#1F242F] bg-[#171A21]/40 text-xs flex flex-col gap-3">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block mb-1">What You See</span>
                              <div className="font-sans text-[#F3F4F6] bg-[#0F1115] border border-[#1F242F] px-3 py-2 rounded">
                                {selectedScenario.investigation.domain.see}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block mb-1">Actual Underlying Value</span>
                              <div className="font-mono text-[#3B82F6] bg-[#0F1115] border border-[#1F242F] px-3 py-2 rounded break-all">
                                {selectedScenario.investigation.domain.value}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block mb-1">
                                {selectedScenario.isPhishing ? 'Why it is Suspicious' : 'Why it is Safe'}
                              </span>
                              <div className="text-[#9CA3AF] leading-relaxed">
                                {selectedScenario.investigation.domain.why}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Tool 3: Inspect Link */}
                      <div className="border border-[#1F242F] rounded-md overflow-hidden bg-[#0F1115]">
                        <button
                          type="button"
                          onClick={() => toggleTool('link')}
                          className="w-full flex items-center justify-between p-3 text-xs font-semibold text-[#F3F4F6] hover:bg-[#242936]/40 transition-colors focus:outline-none cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-[#3B82F6]" />
                            <span>Inspect Hyperlinks & Redirects</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {inspectedClues.includes('link') && (
                              <span className="text-[9px] font-mono bg-[#3B82F6]/10 text-[#3B82F6] px-1.5 py-0.5 rounded font-medium">Inspected</span>
                            )}
                            {revealedTools.link ? (
                              <ChevronUp className="w-4 h-4 text-[#9CA3AF]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
                            )}
                          </div>
                        </button>
                        
                        {revealedTools.link && selectedScenario.investigation.link && (
                          <div className="p-4 border-t border-[#1F242F] bg-[#171A21]/40 text-xs flex flex-col gap-3">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block mb-1">What You See</span>
                              <div className="font-sans text-[#F3F4F6] bg-[#0F1115] border border-[#1F242F] px-3 py-2 rounded">
                                {selectedScenario.investigation.link.see}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block mb-1">Actual Underlying Value</span>
                              <div className="font-mono text-[#3B82F6] bg-[#0F1115] border border-[#1F242F] px-3 py-2 rounded break-all">
                                {selectedScenario.investigation.link.value}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#9CA3AF] block mb-1">
                                {selectedScenario.isPhishing ? 'Why it is Suspicious' : 'Why it is Safe'}
                              </span>
                              <div className="text-[#9CA3AF] leading-relaxed">
                                {selectedScenario.investigation.link.why}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Form / Feedback Block */}
                <div className="mt-6">
                  {!currentAnswer ? (
                    /* NOT SUBMITTED SECTION */
                    <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col gap-4">
                      <h4 className="text-xs font-semibold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-[#3B82F6]" /> Your Classification
                      </h4>
                      <p className="text-xs text-[#9CA3AF] -mt-1 leading-snug">
                        Analyze the sender domain, hyperlinks, and wording. Choose your verification claim:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                        <button
                          type="button"
                          onClick={() => setCurrentSelection('safe')}
                          className={`inline-flex items-center justify-center gap-2 py-3 px-4 rounded-md border text-sm font-semibold transition-colors cursor-pointer focus:outline-none ${
                            currentSelection === 'safe'
                              ? 'bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]'
                              : 'bg-[#0F1115] border-[#1F242F] hover:border-[#22C55E]/30 text-[#9CA3AF] hover:text-[#F3F4F6]'
                          }`}
                        >
                          <Shield className="w-4 h-4" />
                          Mark as Safe
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentSelection('phishing')}
                          className={`inline-flex items-center justify-center gap-2 py-3 px-4 rounded-md border text-sm font-semibold transition-colors cursor-pointer focus:outline-none ${
                            currentSelection === 'phishing'
                              ? 'bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444]'
                              : 'bg-[#0F1115] border-[#1F242F] hover:border-[#EF4444]/30 text-[#9CA3AF] hover:text-[#F3F4F6]'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Mark as Phishing
                        </button>
                      </div>

                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleSubmit}
                          disabled={!currentSelection}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#242936] disabled:text-[#6B7280] disabled:border-[#1F242F] text-white px-6 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                          Submit Answer
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* SUBMITTED FEEDBACK SECTION */
                    <div className="flex flex-col gap-4">
                      {/* Feedback Banner */}
                      <div className={`p-4 border rounded-lg flex items-start gap-3 ${
                        currentAnswer.isCorrect
                          ? 'bg-[#22C55E]/5 border-[#22C55E]/20 text-[#22C55E]'
                          : 'bg-[#EF4444]/5 border-[#EF4444]/20 text-[#EF4444]'
                      }`}>
                        <div className="flex-shrink-0 mt-0.5">
                          {currentAnswer.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <XCircle className="w-5 h-5" />
                          )}
                        </div>
                        <div className="text-xs">
                          <h4 className="font-bold text-sm mb-1">
                            {currentAnswer.isCorrect ? 'Correct Analysis!' : 'Incorrect Analysis'}
                          </h4>
                          <p className="text-[#9CA3AF] leading-relaxed">
                            {selectedScenario.isPhishing 
                              ? 'This email is a Phishing Attempt.' 
                              : 'This email is a legitimate, Safe communication.'}
                          </p>
                        </div>
                      </div>

                      {/* Explanation Content */}
                      <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-[#F3F4F6] uppercase tracking-wider">
                          Analysis Explanation
                        </h4>
                        <p className="text-xs text-[#9CA3AF] leading-relaxed">
                          {selectedScenario.explanation}
                        </p>
                      </div>

                      {/* Red Flags Indicators (Only show if scenario is phishing) */}
                      {selectedScenario.isPhishing && selectedScenario.phishingIndicators?.length > 0 && (
                        <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col gap-3">
                          <h4 className="text-xs font-bold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-1 text-[#EF4444]">
                            <AlertTriangle className="w-4 h-4" /> Identified Red Flags
                          </h4>
                          <div className="flex flex-col gap-2 mt-1">
                            {selectedScenario.phishingIndicators.map((ind, index) => (
                              <div key={index} className="flex gap-3 text-xs bg-[#0F1115] border border-[#1F242F] p-3 rounded-md">
                                <span className="font-mono text-[10px] bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 px-2 py-0.5 rounded self-start">
                                  {ind.type}
                                </span>
                                <div>
                                  <strong className="text-[#F3F4F6] block text-xs">{ind.label}</strong>
                                  <code className="text-[11px] text-[#3B82F6] block mt-0.5 font-mono break-all">{ind.value}</code>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Proceed Controls */}
                      <div className="flex justify-end gap-3 mt-2">
                        {!isAllCompleted && (
                          <button
                            onClick={handleNext}
                            className="inline-flex items-center gap-1 bg-[#171A21] hover:bg-[#242936] text-[#F3F4F6] border border-[#1F242F] hover:border-[#3B82F6]/30 px-5 py-2.5 rounded-md text-sm font-semibold transition-colors cursor-pointer"
                          >
                            Next Email <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 gap-3">
              <Mail className="w-12 h-12 text-[#9CA3AF] animate-pulse" />
              <p className="text-sm text-[#9CA3AF]">Select an email from the inbox list to start your investigation.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
