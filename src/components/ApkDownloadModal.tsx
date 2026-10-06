import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  Github,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  // GitHub repository and APK release URLs
  const githubRepoUrl = 'https://github.com/devilkali131/resonance-music';
  const githubApkReleaseUrl = 'https://github.com/devilkali131/resonance-music/releases/latest';
  const githubDirectApkUrl = 'https://github.com/devilkali131/resonance-music/releases/latest/download/Resonance-Music.apk';

  // The permanent live app URL for Resonance Music
  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-naflop4gcp5x2khppayyff-385269186152.asia-east1.run.app';

  // Direct PWABuilder package URL for instant Android APK compilation
  const pwaBuilderApkUrl = `https://www.pwabuilder.com/publish?url=${encodeURIComponent(
    appUrl
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeInstall = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        await install();
      } finally {
        setIsInstalling(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 animate-fadeIn select-none">
      {/* Dark blur backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
      />

      <div className="relative z-10 w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#090b16] border border-cyan-500/40 p-5 sm:p-7 shadow-2xl shadow-black/95 scrollbar-none space-y-5">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 text-white">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Download Resonance Music
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  Android APK & PWA
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Native Android package & standalone home screen install
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-300 border border-white/20 hover:border-rose-400/40 shadow-lg transition-all active:scale-90 cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Method 1: Instant Native Android App Installation (WebAPK) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-indigo-500/15 border border-cyan-400/40 space-y-3 relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-white">
                  Direct Android Install (Recommended)
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Installs Resonance Music as a full standalone Android app with home screen icon, media controls, and zero address bar.
              </p>
            </div>
            <Zap className="w-6 h-6 text-cyan-400 flex-shrink-0" />
          </div>

          <button
            onClick={handleNativeInstall}
            disabled={isInstalling}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>
              {isInstalling
                ? 'Installing Android App...'
                : isInstallable
                ? 'Install App on This Device Now'
                : 'Install / Add to Home Screen'}
            </span>
          </button>
        </div>

        {/* Method 2: GitHub Repository & Direct APK Release */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900/30 via-slate-900/60 to-cyan-950/30 border border-purple-500/40 space-y-3.5 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-500 text-white font-black text-xs flex items-center justify-center">
                  <Github className="w-4 h-4" />
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span>GitHub Repository APK Release</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    Latest v2.4.0
                  </span>
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Download the pre-compiled Android <strong className="text-purple-300">Resonance-Music.apk</strong> package directly from our official GitHub repository releases, or browse the open-source code.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={githubDirectApkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download APK (~12MB)</span>
            </a>

            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/20 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Github className="w-4 h-4" />
              <span>View GitHub Repo</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        </div>

        {/* Method 3: PWABuilder APK Generator Package */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-500 text-white font-black text-xs flex items-center justify-center">
                  3
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-white">
                  Download .APK Package (PWABuilder)
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generate a ready-to-install signed Android <strong className="text-cyan-300">.apk</strong> or Google Play Store package via PWABuilder for this app URL.
              </p>
            </div>
            <Smartphone className="w-6 h-6 text-indigo-400 flex-shrink-0" />
          </div>

          <a
            href={pwaBuilderApkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Generate & Download APK on PWABuilder</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>

        {/* Method 3: Mobile Chrome Browser 2-Click Install Guide */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>How to install in Mobile Chrome / Samsung Internet:</span>
          </div>
          <ol className="text-xs text-slate-300 space-y-1.5 pl-5 list-decimal leading-relaxed">
            <li>
              Open this app URL in <strong className="text-white">Chrome</strong> on your Android phone.
            </li>
            <li>
              Tap the <strong className="text-white">three dots menu (⋮)</strong> in the top-right corner.
            </li>
            <li>
              Tap <strong className="text-cyan-300">"Install app"</strong> or <strong className="text-cyan-300">"Add to Home screen"</strong>.
            </li>
            <li>
              Confirm install — Android will generate and place the <strong className="text-white">Resonance Music</strong> app directly on your phone!
            </li>
          </ol>
        </div>

        {/* App Link Copy Bar */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <div className="min-w-0 flex-1 px-2 text-xs font-mono text-slate-300 truncate">
            {appUrl}
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 text-xs font-semibold transition-all cursor-pointer flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
