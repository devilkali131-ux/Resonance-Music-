import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already installed and running standalone, do not clutter
  if (isInstalled) {
    return null;
  }

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        await install();
      } finally {
        setIsInstalling(false);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Direct user to browser install or show guide
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleTriggerInstall}
          title="Download & Install App"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 hover:from-cyan-500/30 hover:to-violet-500/30 border border-cyan-400/40 text-cyan-300 hover:text-white transition-all text-xs font-bold shadow-lg shadow-cyan-500/10 active:scale-95 ${className}`}
        >
          <Download className="w-3.5 h-3.5 flex-shrink-0 animate-bounce" />
          <span className="hidden xs:inline sm:inline">Download App</span>
        </button>
      )}

      {variant === 'sidebar' && (
        <button
          onClick={handleTriggerInstall}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/15 via-violet-500/10 to-transparent border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-white/[0.05] transition-all text-xs font-semibold ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Download & Install App</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-200">
            PWA
          </span>
        </button>
      )}

      {/* iOS / General Installation Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#0d0f1a] border border-white/[0.12] p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Install Resonance Music</h3>
                  <p className="text-[11px] text-slate-400">Add to your Home Screen</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed">
                Enjoy fast standalone playback, zero browser address bars, and instant offline access:
              </p>

              <div className="space-y-2 bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.06]">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    Tap the <strong className="text-white">Share</strong> or <strong className="text-white">Menu (⋮)</strong> button in your browser bar.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <p>
                    Select <strong className="text-cyan-300">"Add to Home Screen"</strong> or <strong className="text-cyan-300">"Install App"</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <p>Launch Resonance Music directly from your home screen app icon.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 font-bold text-xs hover:opacity-95 transition-opacity"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
