/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ShieldAlert, Search, Copy, Check, Loader2 } from 'lucide-react';
import { userService } from '../services/userService';
import { toast } from 'sonner';

export default function VerificationPage() {
  const [certId, setCertId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('id') || '').trim();
  });
  const [loading, setLoading] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState(null); // { valid: boolean, certificate: Object, learnerName: string }
  const [copied, setCopied] = useState(false);
  const lastVerifiedId = useRef('');

  const performVerification = async (idToVerify) => {
    if (!idToVerify) return;
    if (lastVerifiedId.current === idToVerify) return;
    lastVerifiedId.current = idToVerify;
    setLoading(true);
    setVerifiedResult(null);
    try {
      const result = await userService.verifyCertificate(idToVerify);
      setVerifiedResult(result);
      if (result.valid) {
        toast.success('Certificate successfully verified!');
      } else {
        toast.error('Certificate not found.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during verification.');
      lastVerifiedId.current = '';
    } finally {
      setLoading(false);
    }
  };

  // Load from URL search params on mount
  useEffect(() => {
    if (certId) {
      performVerification(certId);
    }
  }, []);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!certId.trim()) {
      toast.error('Please enter a Certificate ID.');
      return;
    }
    const sanitized = certId.trim();
    // Update the URL search params so the page URL is shareable
    const params = new URLSearchParams(window.location.search);
    params.set('id', sanitized);
    window.history.pushState(null, '', `${window.location.pathname}?${params.toString()}`);
    lastVerifiedId.current = ''; // Reset ref to allow re-verifying on manual trigger
    performVerification(sanitized);
  };

  const handleCopyLink = () => {
    if (!verifiedResult || !verifiedResult.valid) return;
    const shareUrl = `${window.location.origin}/verify?id=${encodeURIComponent(verifiedResult.certificate.id)}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        toast.success('Verification link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
        toast.error('Failed to copy link.');
      });
  };

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Page Header */}
      <div className="border-b border-[#1F242F] pb-5 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-[#F3F4F6] tracking-tight">Certificate Verification</h1>
        <p className="text-[#9CA3AF] text-sm mt-1.5">Verify the authenticity of CyberQuest credentials.</p>
      </div>

      {/* Verification Input Card */}
      <div className="bg-[#171A21] border border-[#1F242F] p-6 rounded-lg shadow-md">
        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="Enter Certificate ID (e.g., CQ-SF-2026-1234)"
              disabled={loading}
              className="w-full bg-[#0F1115] border border-[#1F242F] rounded-md pl-10 pr-4 py-3 h-11 sm:h-auto sm:py-2.5 text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#3B82F6] transition-colors disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#3B82F6]/50 text-white font-semibold text-sm px-6 py-3 h-11 sm:h-auto sm:py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify</span>
            )}
          </button>
        </form>
      </div>

      {/* Verification Results Display */}
      {verifiedResult && (
        <div className="animate-fadeIn">
          {verifiedResult.valid ? (
            <div className="bg-[#171A21] border border-[#1F242F] rounded-lg p-6 sm:p-8 flex flex-col gap-6 shadow-md">
              {/* Verification Header */}
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start border-b border-[#1F242F]/60 pb-5 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E] flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-[#22C55E] font-extrabold text-lg flex items-center gap-1.5">
                      ✓ Certificate Verified
                    </h2>
                    <p className="text-[#9CA3AF] text-xs mt-0.5">Credential is authentic and registered.</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#22C55E]/25 bg-[#22C55E]/5 text-[#22C55E] font-mono text-xs uppercase tracking-wider font-bold">
                  CYBERQUEST VERIFIED
                </div>
              </div>

              {/* Certificate Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-sm font-sans">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider font-mono">Learner Name</span>
                  <span className="text-[#F3F4F6] font-bold text-base">{verifiedResult.learnerName}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider font-mono">Module Name</span>
                  <span className="text-[#F3F4F6] font-bold text-base">{verifiedResult.certificate.module}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider font-mono">Score</span>
                  <span className="text-[#22C55E] font-bold text-base">{verifiedResult.certificate.score} / 10</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider font-mono">Issue Date</span>
                  <span className="text-[#F3F4F6] font-medium">{formatDate(verifiedResult.certificate.issuedAt)}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider font-mono">Certificate ID</span>
                  <span className="text-[#3B82F6] font-mono font-bold tracking-wider">{verifiedResult.certificate.id}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider font-mono">Status</span>
                  <span className="text-[#22C55E] font-bold flex items-center gap-1.5">
                    Valid Credential
                  </span>
                </div>
              </div>

              {/* Share/Actions Row */}
              <div className="border-t border-[#1F242F]/60 pt-5 flex justify-end">
                <button
                  onClick={handleCopyLink}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0F1115] hover:bg-[#1F242F] text-[#F3F4F6] border border-[#1F242F] hover:border-[#3B82F6]/30 px-4 py-3 h-11 sm:h-auto rounded-md text-xs font-semibold transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Verification Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#171A21] border border-[#1F242F] rounded-lg p-6 sm:p-8 flex flex-col items-center text-center gap-4 shadow-md">
              <div className="w-12 h-12 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center text-[#EF4444]">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-[#EF4444] font-extrabold text-lg">
                  ✗ Certificate Not Found
                </h2>
                <p className="text-[#9CA3AF] text-sm">
                  The provided certificate ID does not exist.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
