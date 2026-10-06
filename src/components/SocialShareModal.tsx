import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Users,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Playlist, Track } from '../types/music';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  playlist?: Playlist | null;
  onOpenListenTogether?: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  track,
  playlist,
  onOpenListenTogether,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || (!track && !playlist)) return null;

  const currentItemTitle = track ? track.title : playlist?.name || 'Resonance Music';
  const currentItemArtist = track ? track.artist : playlist?.tagline || 'Curated Stream';
  const currentCover = track ? track.coverUrl : playlist?.coverUrl;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://resonance.music';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentItemTitle} - Resonance Music`,
          text: `Listening to ${currentItemTitle} by ${currentItemArtist} on Resonance Music 🎧✨:`,
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Listening to *${currentItemTitle}* by ${currentItemArtist} on Resonance Music 🎧✨\n${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `Listening to "${currentItemTitle}" by ${currentItemArtist} on Resonance Music 🎧✨`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
      onClick={onClose}
    >
      {/* Small, compact share pop-up container */}
      <div
        className="relative w-full max-w-sm bg-[#0d0f1a] border border-white/[0.12] rounded-3xl p-5 shadow-2xl overflow-hidden space-y-4 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with High-Visibility Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Share2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-white">Share Music</h3>
          </div>

          {/* Prominent, easily clickable Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all cursor-pointer shadow-sm active:scale-90"
            title="Close Share Dialog"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Compact Track Preview Card */}
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-3">
          {currentCover ? (
            <img
              src={currentCover}
              alt={currentItemTitle}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-md border border-white/[0.1]"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-purple-950 flex items-center justify-center flex-shrink-0">
              <Share2 className="w-5 h-5 text-cyan-400" />
            </div>
          )}
          <div className="truncate flex-1">
            <h4 className="text-xs font-bold text-white truncate">{currentItemTitle}</h4>
            <p className="text-[11px] text-slate-400 truncate">{currentItemArtist}</p>
            <span className="inline-block mt-0.5 text-[9px] font-mono text-cyan-300 px-1.5 py-0.2 rounded-full bg-cyan-500/15 border border-cyan-400/20">
              High Fidelity 160kbps
            </span>
          </div>
        </div>

        {/* Primary Action: Copy Link */}
        <button
          onClick={handleCopyLink}
          className="w-full py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs shadow-md shadow-cyan-400/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Link Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Song Link</span>
            </>
          )}
        </button>

        {/* Jam with Friends Button */}
        {onOpenListenTogether && (
          <button
            onClick={() => {
              onClose();
              onOpenListenTogether();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/40 hover:to-indigo-600/40 border border-purple-400/30 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <Users className="w-4 h-4 text-purple-300" />
            <span>Jam with Friends (Live Sync)</span>
          </button>
        )}

        {/* Social Sharing Quick Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={handleWhatsAppShare}
            className="py-2 px-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-[11px] font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleTwitterShare}
            className="py-2 px-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-[11px] font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <span>Twitter / X</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="py-2 px-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-[11px] font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>More</span>
          </button>
        </div>
      </div>
    </div>
  );
};
