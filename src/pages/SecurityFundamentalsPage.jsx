/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { fundamentalsScenarios } from '../data/fundamentalsScenarios';
import { useAuth } from '../context/AuthContext';
import { getStorageKey } from '../utils/storage';
import { toast } from 'sonner';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  RotateCcw, 
  Info,
  ChevronRight,
  ShieldCheck,
  Award,
  Trophy,
  FileBadge
} from 'lucide-react';

/**
 * SecurityFundamentalsPage Component.
 * @param {Object} props
 */
export default function SecurityFundamentalsPage() {
  const { user, updateProgression } = useAuth();
  const scenarios = fundamentalsScenarios;
  const [selectedId, setSelectedId] = useState(scenarios[0]?.id || null);
  const [answers, setAnswers] = useState(() => {
    try {
      const key = getStorageKey('cyberquest_fundamentals_answers', user?.uid);
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Current selection before submission (null | 'choice-a' | 'choice-b')
  const [currentSelection, setCurrentSelection] = useState(null);
  
  // Track mobile view: 'list' or 'reader'
  const [mobileTab, setMobileTab] = useState('list');

  useEffect(() => {
    try {
      const key = getStorageKey('cyberquest_fundamentals_answers', user?.uid);
      const saved = localStorage.getItem(key);
      setAnswers(saved ? JSON.parse(saved) : {});
    } catch {
      setAnswers({});
    }
    setSelectedId(scenarios[0]?.id || null);
    setCurrentSelection(null);
    setMobileTab('list');
  }, [user?.uid, scenarios]);

  const selectedScenario = scenarios.find(s => s.id === selectedId);

  // Submit current answer
  const handleSubmit = async () => {
    if (!currentSelection || !selectedScenario) return;

    const chosenOption = selectedScenario.choices.find(c => c.id === currentSelection);
    const isCorrect = chosenOption ? chosenOption.isCorrect : false;

    const updatedAnswers = {
      ...answers,
      [selectedScenario.id]: {
        userChoice: currentSelection,
        submitted: true,
        isCorrect
      }
    };

    setAnswers(updatedAnswers);
    setCurrentSelection(null);

    try {
      const key = getStorageKey('cyberquest_fundamentals_answers', user?.uid);
      localStorage.setItem(key, JSON.stringify(updatedAnswers));
    } catch (e) {
      console.error(e);
    }

    if (isCorrect) {
      toast.success("Correct! +10 XP earned.");
    } else {
      toast.error("Not quite. Review the explanation.");
    }

    // Progression system integration
    try {
      const isFirstChallenge = Object.keys(answers).length === 0;
      const xpEarned = isCorrect ? 10 : 0;
      const badgeToUnlock = isFirstChallenge ? 'FirstInvestigation' : null;

      // Submit scenario score
      const res = await updateProgression(xpEarned, badgeToUnlock, { module: 'Security Fundamentals', detail: selectedScenario.topic });
      if (res) {
        handleProgressionToasts(res);
      }

      // Check if all 10 are solved for the completion bonuses
      const currentAnsweredCount = Object.keys(updatedAnswers).length;
      if (currentAnsweredCount === scenarios.length) {
        const correctCount = Object.values(updatedAnswers).filter(a => a.isCorrect).length;
        let completionXP = 0;
        let completionBadge = null;

        if (correctCount === 10) {
          completionXP = 50;
          completionBadge = 'SecurityGuardian';
        } else if (correctCount >= 8) {
          completionXP = 25;
          completionBadge = 'FundamentalsGraduate';
        }

        if (completionXP > 0 || completionBadge) {
          setTimeout(async () => {
            try {
              const compRes = await updateProgression(completionXP, completionBadge, {
                module: 'Security Fundamentals',
                isModuleCompletion: true,
                score: correctCount,
                accuracy: `${Math.round((correctCount / totalScenarios) * 100)}%`
              });
              if (compRes) {
                handleProgressionToasts(compRes);
              }
            } catch (err) {
              console.error("Fundamentals completion sync failed:", err);
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
      toast.success(`Level ${res.newLevel} Reached`, {
        icon: <Trophy className="w-4 h-4 text-[#F59E0B]" />
      });
    }

    if (res.badgesUnlocked && res.badgesUnlocked.length > 0) {
      const badgeTitles = {
        'FirstInvestigation': 'First Investigation',
        'CertifiedLearner': 'Certified Learner',
        'FundamentalsGraduate': 'Fundamentals Graduate',
        'SecurityGuardian': 'Security Guardian'
      };
      res.badgesUnlocked.forEach((badge, index) => {
        const title = badgeTitles[badge] || badge;
        setTimeout(() => {
          toast.success(`${title} Unlocked`, {
            icon: <Award className="w-4 h-4 text-[#3B82F6]" />
          });
        }, 800 * (index + 1));
      });
    }

    if (res.certificateEarned) {
      setTimeout(() => {
        toast.success(`Module Completed`, {
          icon: <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
        });
      }, 1000);
      setTimeout(() => {
        toast.success(`Certificate Earned`, {
          icon: <FileBadge className="w-4 h-4 text-[#10B981]" />
        });
      }, 1800);
    }
  };

  // Reset progress
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all your progress and try again?')) {
      setAnswers({});
      setCurrentSelection(null);
      setSelectedId(scenarios[0]?.id || null);
      setMobileTab('list');
      try {
        const key = getStorageKey('cyberquest_fundamentals_answers', user?.uid);
        localStorage.removeItem(key);
      } catch (e) {
        console.error(e);
      }
      toast.info('Fundamentals progress reset successfully.');
    }
  };

  // Next unsolved challenge
  const handleNext = () => {
    const currentIndex = scenarios.findIndex(s => s.id === selectedId);
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
    setMobileTab('reader');
  };

  // Calculations
  const totalScenarios = scenarios.length;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
  const isAllCompleted = answeredCount === totalScenarios;
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
          <h1 className="text-3xl font-extrabold text-[#F3F4F6] tracking-tight">Security Fundamentals</h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            Evaluate common situations, choose the secure action, and build defensive hygiene habits.
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

      {/* Main Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#1F242F] bg-[#171A21] border border-[#1F242F] rounded-lg overflow-hidden min-h-[620px]">
        
        {/* LEFT COLUMN: CHALLENGE LIST */}
        <div className={`col-span-1 flex flex-col ${mobileTab === 'reader' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-[#1F242F] bg-[#171A21] flex justify-between items-center">
            <span className="text-sm font-bold text-[#F3F4F6] tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
              Fundamentals Challenges ({answeredCount}/{totalScenarios})
            </span>
            {isAllCompleted && (
              <span className="text-[10px] font-bold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 px-2 py-0.5 rounded">
                Graduate
              </span>
            )}
          </div>

          {/* List Scroll Pane */}
          <div className="flex-grow overflow-y-auto divide-y divide-[#1F242F]/60 max-h-[550px] lg:max-h-[600px]">
            {scenarios.map((scenario, index) => {
              const answer = answers[scenario.id];
              const isSelected = scenario.id === selectedId;

              return (
                <button
                  key={scenario.id}
                  onClick={() => {
                    setSelectedId(scenario.id);
                    setMobileTab('reader');
                    setCurrentSelection(null);
                  }}
                  className={`w-full text-left p-4 flex flex-col gap-2 hover:bg-[#242936]/40 transition-colors focus:outline-none cursor-pointer ${
                    isSelected ? 'bg-[#0F1115]' : ''
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-xs font-semibold truncate ${isSelected ? 'text-[#3B82F6]' : 'text-[#F3F4F6]'}`}>
                      {index + 1}. {scenario.topic}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border capitalize ${difficultyBadge(scenario.difficulty)}`}>
                      {scenario.difficulty}
                    </span>
                  </div>
                  
                  <h4 className="text-xs font-medium text-[#9CA3AF] truncate max-w-[240px]">
                    {scenario.title}
                  </h4>
                  
                  <div className="flex justify-end items-center mt-1">
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

        {/* RIGHT COLUMN: BRIEFING CONSOLE READER */}
        <div className={`col-span-2 flex flex-col bg-[#0F1115] ${mobileTab === 'list' ? 'hidden lg:flex' : 'flex'}`}>
          {selectedScenario ? (
            <>
              {/* Reader Header */}
              <div className="p-4 border-b border-[#1F242F] bg-[#171A21] flex justify-between items-center gap-4">
                <button
                  onClick={() => setMobileTab('list')}
                  className="lg:hidden inline-flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors focus:outline-none cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to List
                </button>

                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-xs text-[#9CA3AF]">Interactive Threat Scenario</span>
                </div>

                <div className="text-xs font-semibold font-mono text-[#9CA3AF]">
                  Scenario {scenarios.findIndex(s => s.id === selectedId) + 1} of {totalScenarios}
                </div>
              </div>

              {/* Session Complete Card */}
              {isAllCompleted && (
                <div className="mx-6 mt-6 bg-[#171A21] border border-[#3B82F6]/20 p-5 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#3B82F6]/10 rounded-lg text-[#3B82F6]">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#F3F4F6]">Fundamentals Training Complete</h4>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">
                        You completed all 10 challenges. Final score: <strong className="text-[#F3F4F6] font-semibold">{correctCount} / {totalScenarios}</strong> correct.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="w-full md:w-auto text-xs font-semibold bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-md transition-colors cursor-pointer"
                  >
                    Reset & Retake
                  </button>
                </div>
              )}

              {/* Scenario Console Layout */}
              <div className="p-6 flex-grow overflow-y-auto max-h-[500px]">
                {/* Simulated Briefing Header */}
                <div className="border border-[#1F242F] bg-[#171A21] rounded-t-lg p-4 flex flex-col gap-2 font-sans border-b-0">
                  <div className="text-xs flex flex-wrap items-center gap-2 text-[#9CA3AF]">
                    <span className="font-semibold text-[#F3F4F6] w-16">Topic:</span>
                    <span className="text-[#3B82F6] font-bold font-mono uppercase bg-[#3B82F6]/5 border border-[#3B82F6]/10 px-2 py-0.5 rounded text-[10px]">
                      {selectedScenario.topic}
                    </span>
                  </div>
                  <div className="text-xs flex items-center gap-2 text-[#9CA3AF]">
                    <span className="font-semibold text-[#F3F4F6] w-16">Title:</span>
                    <span className="text-[#F3F4F6] font-semibold">{selectedScenario.title}</span>
                  </div>
                  <div className="text-xs flex items-center gap-2 text-[#9CA3AF] border-t border-[#1F242F]/60 pt-2 mt-1">
                    <span className="font-semibold text-[#F3F4F6] w-16">Security:</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${difficultyBadge(selectedScenario.difficulty)}`}>
                      Threat Level: {selectedScenario.difficulty}
                    </span>
                  </div>
                </div>

                {/* monospaced event text */}
                <div className="border border-[#1F242F] bg-[#171A21] rounded-b-lg p-6 font-mono text-xs leading-relaxed text-[#F3F4F6] break-words border-t border-[#1F242F]/50 flex flex-col gap-3">
                  <span className="text-[#3B82F6] font-bold text-[10px] tracking-wider uppercase">[SYSTEM INCIDENT RECORD]</span>
                  <p>{selectedScenario.scenarioText}</p>
                </div>

                {/* Interactive Decisions Panel */}
                <div className="mt-6">
                  {!currentAnswer ? (
                    <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col gap-4">
                      <h4 className="text-xs font-semibold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-[#3B82F6]" /> Action Decision Required
                      </h4>
                      <p className="text-xs text-[#9CA3AF] -mt-1 leading-snug">
                        Evaluate the scenario carefully. Choose your action:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                        {selectedScenario.choices.map((choice) => {
                          const isSelected = currentSelection === choice.id;

                          return (
                            <button
                              key={choice.id}
                              type="button"
                              onClick={() => setCurrentSelection(choice.id)}
                              className={`inline-flex items-center justify-center text-center p-3 rounded-md border text-xs font-semibold transition-all cursor-pointer focus:outline-none min-h-[50px] ${
                                isSelected
                                  ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6] scale-[1.01]'
                                  : 'bg-[#0F1115] border-[#1F242F] hover:border-[#3B82F6]/30 text-[#9CA3AF] hover:text-[#F3F4F6]'
                              }`}
                            >
                              {choice.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleSubmit}
                          disabled={!currentSelection}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#242936] disabled:text-[#6B7280] disabled:border-[#1F242F] text-white px-6 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                          Submit Decision
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* FEEDBACK AND EXPLANATION */
                    <div className="flex flex-col gap-4">
                      {/* Banner */}
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
                            {currentAnswer.isCorrect ? 'Correct Decision!' : 'Unsafe Decision'}
                          </h4>
                          <p className="text-[#9CA3AF] leading-relaxed">
                            {currentAnswer.isCorrect 
                              ? 'Your selected action keeps the account and systems secure.' 
                              : 'This action introduces a security vulnerability.'}
                          </p>
                        </div>
                      </div>

                      {/* Explanation card */}
                      <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-[#F3F4F6] uppercase tracking-wider">
                          Defensive Analysis
                        </h4>
                        <p className="text-xs text-[#9CA3AF] leading-relaxed">
                          {selectedScenario.explanation}
                        </p>
                      </div>

                      {/* Next button */}
                      <div className="flex justify-end gap-3 mt-2">
                        {!isAllCompleted && (
                          <button
                            onClick={handleNext}
                            className="inline-flex items-center gap-1 bg-[#171A21] hover:bg-[#242936] text-[#F3F4F6] border border-[#1F242F] hover:border-[#3B82F6]/30 px-5 py-2.5 rounded-md text-sm font-semibold transition-colors cursor-pointer"
                          >
                            Next Scenario <ChevronRight className="w-4 h-4" />
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
              <Shield className="w-12 h-12 text-[#9CA3AF] animate-pulse" />
              <p className="text-sm text-[#9CA3AF]">Select a scenario from the checklist to start your learning session.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
