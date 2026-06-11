/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { generateChallenge } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { mockScenarios } from '../data/mockScenarios';
import { getStorageKey } from '../utils/storage';
import { fundamentalsScenarios } from '../data/fundamentalsScenarios';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Shield, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Info, 
  ArrowLeft, 
  RefreshCw, 
  Play, 
  History, 
  Brain,
  Trophy,
  Award,
  ShieldCheck,
  FileBadge
} from 'lucide-react';

/**
 * AiChallengeLabPage Component.
 * @param {Object} props
 */
export default function AiChallengeLabPage() {
  const { user, userProfile, updateProgression } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState('Phishing');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [chosenChoice, setChosenChoice] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // 1. Cooldown State (10 seconds)
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown(c => c - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // 2. Local History state (last 5 challenges generated)
  const [history, setHistory] = useState(() => {
    try {
      const key = getStorageKey('cyberquest_ai_history', user?.uid);
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const key = getStorageKey('cyberquest_ai_history', user?.uid);
      const saved = localStorage.getItem(key);
      setHistory(saved ? JSON.parse(saved) : []);
    } catch {
      setHistory([]);
    }
    setChallenge(null);
    setChosenChoice(null);
    setSubmitted(false);
    setError(null);
  }, [user?.uid]);

  const saveChallengeToHistory = (newChallenge) => {
    // Avoid duplicate history records (matching title and scenario)
    const exists = history.some(h => h.title === newChallenge.title && h.scenario === newChallenge.scenario);
    if (exists) return;

    const updatedHistory = [newChallenge, ...history].slice(0, 5);
    setHistory(updatedHistory);
    try {
      const key = getStorageKey('cyberquest_ai_history', user?.uid);
      localStorage.setItem(key, JSON.stringify(updatedHistory));
    } catch (e) {
      console.error(e);
    }
  };

  // Generate challenge trigger
  const handleGenerate = async () => {
    if (cooldown > 0) return;

    setLoading(true);
    setError(null);
    setChallenge(null);
    setChosenChoice(null);
    setSubmitted(false);

    // Set 10s cooldown
    setCooldown(10);

    try {
      const result = await generateChallenge(selectedTopic, selectedDifficulty);
      setChallenge(result);
      saveChallengeToHistory(result);

      // Award "AI Explorer" badge on first successful AI generation
      if (userProfile && !userProfile.badges?.includes('AIExplorer')) {
        const res = await updateProgression(0, 'AIExplorer', { module: 'AI Challenge Lab', detail: 'Generated first challenge' });
        if (res) {
          handleProgressionToasts(res);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to reach Gemini. Check your API key or connection.");
    } finally {
      setLoading(false);
    }
  };

  // Load a challenge directly from local history
  const handleLoadFromHistory = (histChallenge) => {
    setChallenge(histChallenge);
    setChosenChoice(null);
    setSubmitted(false);
    setError(null);
  };

  // Offline fallback: load a random scenario from local database
  const handleLoadOffline = () => {
    setLoading(true);
    setError(null);
    setChosenChoice(null);
    setSubmitted(false);

    try {
      const usePhishing = Math.random() > 0.5;
      let selected;
      let adapted;

      if (usePhishing) {
        selected = mockScenarios[Math.floor(Math.random() * mockScenarios.length)];
        adapted = {
          title: `${selected.senderName} Alert`,
          topic: "Phishing",
          difficulty: selected.difficulty.charAt(0).toUpperCase() + selected.difficulty.slice(1),
          scenario: selected.body,
          question: "How would you classify this email?",
          choices: [
            "Treat as Safe",
            "Treat as Phishing"
          ],
          correctAnswer: selected.isPhishing ? 1 : 0,
          explanation: selected.explanation
        };
      } else {
        selected = fundamentalsScenarios[Math.floor(Math.random() * fundamentalsScenarios.length)];
        adapted = {
          title: selected.title,
          topic: selected.topic,
          difficulty: selected.difficulty.charAt(0).toUpperCase() + selected.difficulty.slice(1),
          scenario: selected.scenarioText,
          question: "Evaluate the scenario carefully. Choose your action:",
          choices: [
            selected.choices[0].label,
            selected.choices[1].label
          ],
          correctAnswer: selected.choices[0].isCorrect ? 0 : 1,
          explanation: selected.explanation
        };
      }

      setChallenge(adapted);
      toast.info("Offline challenge loaded from local database.");
    } catch {
      setError("Failed to load local offline scenario.");
    } finally {
      setLoading(false);
    }
  };

  // Submit selected decision
  const handleSubmit = async () => {
    if (chosenChoice === null || !challenge) return;

    const userCorrect = chosenChoice === challenge.correctAnswer;
    setIsCorrect(userCorrect);
    setSubmitted(true);

    // Save submission to cyberquest_ai_answers in localStorage for analytics completion & accuracy tracking
    try {
      const key = getStorageKey('cyberquest_ai_answers', user?.uid);
      const savedAnswers = JSON.parse(localStorage.getItem(key) || '{}');
      savedAnswers[challenge.title] = {
        isCorrect: userCorrect,
        submitted: true,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(savedAnswers));
    } catch (e) {
      console.error("Failed to save AI challenge to localStorage:", e);
    }

    if (userCorrect) {
      toast.success("Correct! +10 XP earned.");
    } else {
      toast.error("Not quite. Review the explanation.");
    }

    try {
      const xpEarned = userCorrect ? 10 : 0;
      const res = await updateProgression(xpEarned, null, { module: 'AI Challenge Lab', detail: challenge.title });
      if (res) {
        handleProgressionToasts(res);
      }
    } catch (err) {
      console.error(err);
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
        'AIExplorer': 'AI Explorer'
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

  // Reset to configuration view
  const handleBackToSetup = () => {
    setChallenge(null);
    setChosenChoice(null);
    setSubmitted(false);
    setError(null);
  };

  const difficultyBadge = (difficulty) => {
    const classes = {
      Easy: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
      Medium: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
      Hard: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
    };
    return classes[difficulty] || classes.Medium;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1F242F] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#F3F4F6] tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-[#3B82F6]" /> AI Challenge Lab
          </h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            Generate customized, interactive cybersecurity awareness scenarios on-demand using Gemini.
          </p>
        </div>
      </section>

      {/* 1. CONFIGURATION VIEW */}
      {!loading && !error && !challenge && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls Panel */}
          <div className="lg:col-span-2 bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-6">
            <h3 className="font-bold text-lg text-[#F3F4F6] flex items-center gap-2 border-b border-[#1F242F] pb-3">
              <Brain className="w-5 h-5 text-[#3B82F6]" /> Configure Scenario Generator
            </h3>

            {/* Select Topic */}
            <div className="flex flex-col gap-2">
              <label htmlFor="topic-select" className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                Select Threat Topic
              </label>
              <select
                id="topic-select"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-[#0F1115] border border-[#1F242F] rounded-md px-3 py-2.5 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#3B82F6] transition-colors w-full cursor-pointer"
              >
                <option value="Phishing">Phishing Simulation</option>
                <option value="Password Security">Password Security</option>
                <option value="Social Engineering">Social Engineering</option>
                <option value="Public WiFi">Public WiFi Safety</option>
                <option value="Browser Permissions">Browser Permissions</option>
              </select>
            </div>

            {/* Select Difficulty */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                Select Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`py-2 px-4 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                      selectedDifficulty === diff
                        ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]'
                        : 'bg-[#0F1115] border-[#1F242F] hover:border-[#3B82F6]/30 text-[#9CA3AF] hover:text-[#F3F4F6]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Trigger */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={cooldown > 0}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#242936] disabled:text-[#6B7280] disabled:border-[#1F242F] text-white px-6 py-3 rounded-md text-sm font-semibold transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                {cooldown > 0 ? `Generation Cooldown (${cooldown}s)` : 'Generate Challenge'}
              </button>
            </div>
          </div>

          {/* History Panel */}
          <div className="lg:col-span-1 bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4">
            <h3 className="font-bold text-sm text-[#F3F4F6] flex items-center gap-2 border-b border-[#1F242F] pb-3">
              <History className="w-4 h-4 text-[#9CA3AF]" /> Recent AI Challenges
            </h3>
            {history.length > 0 ? (
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px]">
                {history.map((hist, index) => (
                  <div 
                    key={index}
                    className="border border-[#1F242F] bg-[#0F1115] p-3 rounded-md flex flex-col gap-2 hover:border-[#3B82F6]/20 transition-all"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-[#3B82F6] font-mono">{hist.topic}</span>
                      <span className={`text-[8px] font-bold px-1 py-0.5 rounded border capitalize ${difficultyBadge(hist.difficulty)}`}>
                        {hist.difficulty}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-[#F3F4F6] truncate">{hist.title}</h4>
                    <button
                      type="button"
                      onClick={() => handleLoadFromHistory(hist)}
                      className="inline-flex items-center gap-1 text-[10px] text-[#3B82F6] hover:text-[#2563EB] transition-colors cursor-pointer w-max self-end font-semibold focus:outline-none"
                    >
                      <Play className="w-3 h-3" /> Reload Challenge
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center py-8 text-center text-[#9CA3AF] border border-[#1F242F] border-dashed rounded-lg">
                <History className="w-8 h-8 text-[#1F242F] mb-2" />
                <p className="text-xs">No recently generated challenges found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. LOADING STATE VIEW */}
      {loading && (
        <div className="bg-[#171A21] border border-[#1F242F] rounded-lg p-12 flex flex-col items-center justify-center text-center gap-6 min-h-[400px]">
          <div className="relative">
            <div className="p-4 bg-[#3B82F6]/10 rounded-full border border-[#3B82F6]/20 animate-pulse text-[#3B82F6]">
              <Sparkles className="w-10 h-10 animate-spin duration-1000" />
            </div>
            <Shield className="w-6 h-6 text-[#22C55E] absolute -bottom-1 -right-1" />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg text-[#F3F4F6] tracking-tight">Consulting Gemini Model</h3>
            <p className="text-xs text-[#9CA3AF] max-w-sm leading-relaxed">
              Vite is securely querying the Gemini API to formulate a unique, educational cyber incident scenario.
            </p>
          </div>
          <div className="w-48 bg-[#0F1115] h-1.5 rounded-full overflow-hidden border border-[#1F242F]">
            <div className="bg-[#3B82F6] h-full rounded-full animate-progress duration-3000"></div>
          </div>
          <span className="text-[10px] text-[#9CA3AF] font-mono uppercase tracking-widest animate-pulse">
            Compiling Threat Vector...
          </span>
        </div>
      )}

      {/* 3. ERROR / FALLBACK STATE VIEW */}
      {error && !loading && (
        <div className="bg-[#171A21] border border-[#EF4444]/20 rounded-lg p-8 flex flex-col items-center justify-center text-center gap-6 max-w-2xl mx-auto">
          <div className="p-3 bg-[#EF4444]/10 rounded-full border border-[#EF4444]/20 text-[#EF4444]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg text-[#F3F4F6] tracking-tight">Gemini Connection Failed</h3>
            <p className="text-xs text-[#EF4444] font-mono leading-relaxed bg-[#0F1115] border border-[#EF4444]/10 p-3 rounded break-all max-w-md">
              {error}
            </p>
            <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">
              Verify that you have defined a valid `VITE_GEMINI_API_KEY` inside your `.env` configuration file or use our offline backup loop.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
            <button
              onClick={handleLoadOffline}
              className="px-5 py-2 rounded-md border border-[#1F242F] text-xs font-semibold bg-[#0F1115] text-[#F3F4F6] hover:bg-[#242936]/40 cursor-pointer transition-colors focus:outline-none"
            >
              Load Offline Challenge
            </button>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center justify-center gap-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer focus:outline-none"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Generation
            </button>
          </div>
          <button
            onClick={handleBackToSetup}
            className="text-xs text-[#9CA3AF] hover:text-[#F3F4F6] underline mt-2 focus:outline-none cursor-pointer"
          >
            Go Back
          </button>
        </div>
      )}

      {/* 4. LAB SIMULATION CONSOLE */}
      {challenge && !loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#1F242F] bg-[#171A21] border border-[#1F242F] rounded-lg overflow-hidden min-h-[550px]">
          
          {/* LEFT COLUMN: SCENARIO INFO CARD */}
          <div className="col-span-1 p-6 flex flex-col gap-6 bg-[#171A21]">
            <button
              onClick={handleBackToSetup}
              className="inline-flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors focus:outline-none cursor-pointer w-max font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Setup
            </button>

            <div className="flex flex-col gap-3 mt-2 border-t border-[#1F242F] pt-4">
              <span className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider">Lab Meta details</span>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#9CA3AF]">Category:</span>
                  <span className="text-[#F3F4F6] font-semibold">{challenge.topic}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#9CA3AF]">Difficulty:</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border capitalize ${difficultyBadge(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#9CA3AF]">Source:</span>
                  <span className="text-[#3B82F6] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Gemini AI
                  </span>
                </div>
              </div>
            </div>

            {submitted && (
              <div className="flex flex-col gap-3 border-t border-[#1F242F] pt-4 mt-auto">
                <span className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider">Next Step</span>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={cooldown > 0}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#242936] disabled:text-[#6B7280] disabled:border-[#1F242F] text-white px-4 py-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {cooldown > 0 ? `Next Challenge (${cooldown}s)` : 'Generate Next Challenge'}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: CHALLENGE CONSOLE */}
          <div className="col-span-2 flex flex-col bg-[#0F1115] p-6">
            <div className="flex flex-col gap-6 flex-grow">
              
              {/* Challenge Title */}
              <div className="border-b border-[#1F242F] pb-4">
                <h2 className="text-xl font-bold text-[#F3F4F6] tracking-tight">
                  {challenge.title}
                </h2>
              </div>

              {/* Scenario */}
              <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg text-sm leading-relaxed text-[#F3F4F6] font-sans">
                {challenge.scenario}
              </div>

              {/* Decision Section */}
              <div className="flex flex-col gap-6">
                {!submitted ? (
                  <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col gap-4">
                    <h4 className="text-xs font-semibold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      <Info className="w-4 h-4 text-[#3B82F6]" /> Action Decision Required
                    </h4>
                    <p className="text-xs text-[#9CA3AF] -mt-1 leading-snug font-sans">
                      {challenge.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 font-sans">
                      {challenge.choices.map((choice, index) => {
                        const isSelected = chosenChoice === index;

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setChosenChoice(index)}
                            className={`inline-flex items-center justify-center text-center p-3 rounded-md border text-xs font-semibold transition-all cursor-pointer focus:outline-none min-h-[50px] ${
                              isSelected
                                ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6] scale-[1.01]'
                                : 'bg-[#0F1115] border-[#1F242F] hover:border-[#3B82F6]/30 text-[#9CA3AF] hover:text-[#F3F4F6]'
                            }`}
                          >
                            {choice}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleSubmit}
                        disabled={chosenChoice === null}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#242936] disabled:text-[#6B7280] disabled:border-[#1F242F] text-white px-6 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer disabled:cursor-not-allowed"
                      >
                        Submit Answer
                      </button>
                    </div>
                  </div>
                ) : (
                  /* SUBMITTED FEEDBACK AND EDUCATIONAL INFO */
                  <div className="flex flex-col gap-4 animate-fadeIn font-sans">
                    
                    {/* Verdict Banner */}
                    <div className={`p-4 border rounded-lg flex items-start gap-3 ${
                      isCorrect
                        ? 'bg-[#22C55E]/5 border-[#22C55E]/20 text-[#22C55E]'
                        : 'bg-[#EF4444]/5 border-[#EF4444]/20 text-[#EF4444]'
                    }`}>
                      <div className="flex-shrink-0 mt-0.5">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div className="text-xs">
                        <h4 className="font-bold text-sm mb-1">
                          {isCorrect ? 'Correct Decision!' : 'Unsafe Decision'}
                        </h4>
                        <p className="text-[#9CA3AF] leading-relaxed">
                          {isCorrect 
                            ? 'Your action successfully mitigates the threat and secures the system.' 
                            : 'This action compromises security and exposes systems to breach.'}
                        </p>
                      </div>
                    </div>

                    {/* Educational explanation card */}
                    <div className="bg-[#171A21] border border-[#1F242F] p-5 rounded-lg flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-[#F3F4F6] uppercase tracking-wider">
                        Educational Explanation
                      </h4>
                      <p className="text-xs text-[#9CA3AF] leading-relaxed">
                        {challenge.explanation}
                      </p>
                    </div>

                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
