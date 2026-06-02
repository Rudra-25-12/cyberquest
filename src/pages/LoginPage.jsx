import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, BookOpen, Award, AlertTriangle, Terminal, X, ShieldCheck, Mail, Key, Sparkles } from 'lucide-react';

export default function LoginPage({ onShowToast }) {
  const { loginWithGoogle, loading, isFallbackMode } = useAuth();
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      onShowToast('Welcome to CyberQuest!', 'success');
    } catch (err) {
      console.error(err);
      onShowToast(err.message || 'Failed to sign in.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F3F4F6] flex flex-col justify-between selection:bg-[#3B82F6]/30 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-[#1F242F] bg-[#0F1115]/85 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#3B82F6]" />
            <span className="font-bold tracking-tight text-lg font-sans">
              CYBER<span className="text-[#3B82F6]">QUEST</span>
            </span>
          </div>
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="text-sm font-medium border border-[#1F242F] hover:border-[#3B82F6]/40 bg-[#171A21] px-4 py-1.5 rounded-md hover:bg-[#242936] text-[#F3F4F6] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12 md:py-24 flex flex-col justify-center gap-16">
        
        {/* Developer Fallback Alert */}
        {isFallbackMode && (
          <div className="bg-[#171A21] border border-[#F59E0B]/20 p-4 rounded-lg flex items-start gap-3 max-w-2xl mx-auto">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold text-[#F59E0B] block mb-1">Developer Mode Active</span>
              <p className="text-[#9CA3AF]">
                No Firebase credentials detected in <code className="font-mono bg-[#0F1115] px-1 py-0.5 rounded text-xs">.env</code>. 
                Google Login will simulate authentication locally and store credentials in your browser's local storage.
              </p>
            </div>
          </div>
        )}

        {/* Hero Area */}
        <section className="text-center max-w-3xl mx-auto flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#3B82F6]/10 bg-[#3B82F6]/5 text-xs font-semibold text-[#3B82F6] tracking-wide">
            <span>Learn Cybersecurity by Doing</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-[#F3F4F6]">
            Learn security skills through hands-on <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#06B6D4]">practice</span>
          </h1>
          <p className="text-base md:text-xl text-[#9CA3AF] max-w-2xl leading-relaxed">
            Practice identifying vulnerabilities, fixing insecure code, and exploring real security scenarios in interactive labs.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Google Authentication button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="inline-flex items-center justify-center gap-3 bg-[#3B82F6] text-white font-medium px-8 py-3 rounded-md hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0F1115] transition-all cursor-pointer shadow-lg shadow-[#3B82F6]/15 hover:shadow-[#3B82F6]/25 disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.376 0-6.113-2.737-6.113-6.113s2.737-6.114 6.113-6.114c1.5 0 2.87.54 3.93 1.436L21 3.52c-2.43-2.27-5.58-3.52-8.76-3.52C5.373 0 0 5.373 0 12s5.373 12 12.24 12c7.2 0 11.76-5.06 11.76-12 0-.816-.072-1.428-.192-1.715H12.24z" />
                  </svg>
                  <span>Start Learning with Google</span>
                </>
              )}
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                console.log("[LoginPage] Explore Labs CTA clicked");
                setShowPreviewModal(true);
              }}
              className="text-sm font-semibold text-[#9CA3AF] hover:text-[#F3F4F6] focus:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0F1115] transition-all py-2 px-4 rounded-md border border-transparent hover:border-[#1F242F] hover:bg-[#171A21]/50 cursor-pointer flex items-center gap-1.5 group"
            >
              Explore Labs 
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1 group-focus:translate-x-1" aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </section>
 
        {/* Labs Feature Highlights */}
        <section id="labs" className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          
          {/* Lab card 1 */}
          <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4 hover:border-[#3B82F6]/20 transition-all duration-300">
            <div className="w-10 h-10 bg-[#3B82F6]/10 rounded-md flex items-center justify-center text-[#3B82F6]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-[#F3F4F6]">
              Interactive Labs
            </h3>
            <p className="text-[#9CA3AF] text-sm leading-relaxed">
              Step-by-step security labs designed to teach web defenses, cryptography, and secure programming practices through action.
            </p>
          </div>
 
          {/* Lab card 2 */}
          <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4 hover:border-[#3B82F6]/20 transition-all duration-300">
            <div className="w-10 h-10 bg-[#06B6D4]/10 rounded-md flex items-center justify-center text-[#06B6D4]">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-[#F3F4F6]">
              Real Security Scenarios
            </h3>
            <p className="text-[#9CA3AF] text-sm leading-relaxed">
              Inspect source code, find vulnerabilities, and practice writing secure patches to defend applications.
            </p>
          </div>
 
          {/* Lab card 3 */}
          <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg flex flex-col gap-4 hover:border-[#3B82F6]/20 transition-all duration-300">
            <div className="w-10 h-10 bg-[#22C55E]/10 rounded-md flex items-center justify-center text-[#22C55E]">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg text-[#F3F4F6]">
              Track Your Progress
            </h3>
            <p className="text-[#9CA3AF] text-sm leading-relaxed">
              Earn experience points (XP) as you finish challenges, and collect badges to showcase the skills you have learned.
            </p>
          </div>
 
        </section>
      </main>
 
      {/* Footer */}
      <footer className="border-t border-[#1F242F] bg-[#171A21]/30 py-8 text-center text-xs text-[#9CA3AF]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} CyberQuest. Cybersecurity learning platform.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#F3F4F6] transition-colors">Documentation</a>
            <a href="#" className="hover:text-[#F3F4F6] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#F3F4F6] transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
 
      {/* Syllabus Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1115]/80 backdrop-blur-sm p-4 animate-fadeIn">
          {/* Backdrop overlay for closing */}
          <div className="fixed inset-0" onClick={() => setShowPreviewModal(false)}></div>
          
          <div className="relative w-full max-w-4xl bg-[#171A21] border border-[#1F242F] rounded-lg p-6 md:p-8 shadow-2xl flex flex-col gap-6 z-10 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-xs font-bold text-[#3B82F6] uppercase tracking-wider">CyberQuest Syllabus</span>
                <h3 className="text-2xl font-extrabold text-[#F3F4F6] mt-1">Available Learning Paths</h3>
                <p className="text-xs text-[#9CA3AF] mt-1">Explore the interactive defensive labs and challenges available in the curriculum.</p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-md border border-[#1F242F] hover:border-[#EF4444]/30 bg-[#0F1115] text-[#9CA3AF] hover:text-[#EF4444] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
 
            {/* Grid of paths */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              
              {/* Path 1: Security Fundamentals */}
              <div className="bg-[#0F1115] border border-[#1F242F] p-5 rounded-lg flex gap-4 hover:border-[#3B82F6]/30 transition-all">
                <div className="p-2.5 bg-[#3B82F6]/5 border border-[#3B82F6]/10 rounded-lg text-[#3B82F6] h-fit">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-bold text-sm text-[#F3F4F6]">Security Fundamentals</h4>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    Master critical defensive operations. Evaluate MFA fatigue attacks, browser security permissions, network boundaries, and USB safety protocols.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">10 Labs</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">150 XP</span>
                  </div>
                </div>
              </div>
 
              {/* Path 2: Phishing Detective */}
              <div className="bg-[#0F1115] border border-[#1F242F] p-5 rounded-lg flex gap-4 hover:border-[#3B82F6]/30 transition-all">
                <div className="p-2.5 bg-[#3B82F6]/5 border border-[#3B82F6]/10 rounded-lg text-[#3B82F6] h-fit">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-bold text-sm text-[#F3F4F6]">Phishing Detective</h4>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    Investigate simulated inbox threats. Audit raw message headers, trace malicious link redirects, and identify email forgery patterns.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">10 Labs</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">350 XP</span>
                  </div>
                </div>
              </div>
 
              {/* Path 3: OWASP Top 10 Defenses */}
              <div className="bg-[#0F1115] border border-[#1F242F] p-5 rounded-lg flex gap-4 hover:border-[#3B82F6]/30 transition-all">
                <div className="p-2.5 bg-[#3B82F6]/5 border border-[#3B82F6]/10 rounded-lg text-[#3B82F6] h-fit">
                  <Key className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-bold text-sm text-[#F3F4F6]">OWASP Top 10 Defenses</h4>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    Master web application security. Investigate SQL Injections, Cross-Site Scripting (XSS), and insecure session management.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">10 Labs</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">500 XP</span>
                  </div>
                </div>
              </div>
 
              {/* Path 4: AI Challenge Lab */}
              <div className="bg-[#0F1115] border border-[#1F242F] p-5 rounded-lg flex gap-4 hover:border-[#3B82F6]/30 transition-all">
                <div className="p-2.5 bg-[#F59E0B]/5 border border-[#F59E0B]/10 rounded-lg text-[#F59E0B] h-fit">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-bold text-sm text-[#F3F4F6]">AI Challenge Lab</h4>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    Generate dynamic cybersecurity scenarios on-demand. Challenge yourself against AI-evaluated scenarios powered by Gemini.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">Unlimited Labs</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">Dynamic XP</span>
                  </div>
                </div>
              </div>
 
            </div>
 
            {/* Footer action */}
            <div className="border-t border-[#1F242F] pt-6 mt-2 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-xs text-[#9CA3AF] text-center sm:text-left">
                Ready to start? Sign in with your Google account to track your progress and earn certificates.
              </span>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handleLogin();
                }}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-md text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                Start Learning Now
              </button>
            </div>
 
          </div>
        </div>
      )}
    </div>
  );
}
