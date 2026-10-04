import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  FileCode,
  QrCode,
  Sparkles,
  Music,
  Users,
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
  const [caption, setCaption] = useState('Listening to this masterpiece on Resonance Music 🎧✨');
  const [cardFormat, setCardFormat] = useState<'story' | 'banner'>('story');

  if (!isOpen || (!track && !playlist)) return null;

  const currentItemTitle = track ? track.title : playlist?.name || 'Resonance Music';
  const currentItemArtist = track ? track.artist : playlist?.tagline || 'Curated Stream';
  const currentCover = track ? track.coverUrl : playlist?.coverUrl;
  const currentGradient = track ? `linear-gradient(135deg, #090a0f, ${track.accentColor})` : playlist?.coverGradient;

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentItemTitle} - Resonance Music`,
          text: `${caption} · Stream high fidelity audio:`,
          url: window.location.href,
        });
      } catch {
        // user cancelled or error
      }
    } else {
      handleCopyLink();
    }
  };

  const handleExportM3U = () => {
    const filename = `${currentItemTitle.toLowerCase().replace(/\s+/g, '_')}.m3u`;
    const content = `#EXTM3U\n#EXTINF:${track?.duration || 180},${currentItemArtist} - ${currentItemTitle}\n${track?.audioUrl || 'https://lyra.stream'}\n`;
    const blob = new Blob([content], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = track || playlist;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentItemTitle.toLowerCase().replace(/\s+/g, '_')}_lyra.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl bg-[#090b14] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Social Sharing Studio</h3>
              <p className="text-xs text-slate-400">Share your music vibe across stories, socials, and files</p>
            </div>
          </div>

          {/* High-visibility Close Button */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-md transition-all active:scale-90 flex items-center justify-center cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Story Card Preview & Format Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* Card Preview */}
          <div className="flex justify-center">
            <div
              className={`relative overflow-hidden rounded-2xl p-5 border border-white/[0.12] shadow-2xl flex flex-col justify-between transition-all ${
                cardFormat === 'story'
                  ? 'w-56 h-88 aspect-[9/16]'
                  : 'w-full h-44 aspect-video'
              }`}
              style={{
                background: currentGradient || 'linear-gradient(135deg, #090a0f, #1e1b4b)',
              }}
            >
              {/* Top Branding */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-white text-slate-950 flex items-center justify-center">
                    <Music className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-wider">RESONANCE MUSIC</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 backdrop-blur-sm border border-white/[0.08]">
                  {track?.bpm ? `${track.bpm} BPM` : '320kbps'}
                </span>
              </div>

              {/* Center Artwork & Info */}
              <div className="my-auto z-10 space-y-3">
                {currentCover && (
                  <img
                    src={currentCover}
                    alt={currentItemTitle}
                    className="w-24 h-24 rounded-xl object-cover shadow-2xl mx-auto border border-white/[0.15]"
                  />
                )}
                <div className="text-center">
                  <h4 className="text-sm font-bold text-white truncate drop-shadow-md">
                    {currentItemTitle}
                  </h4>
                  <p className="text-xs text-slate-200 truncate drop-shadow">{currentItemArtist}</p>
                </div>

                {/* Animated waveform bars visual */}
                <div className="flex items-center justify-center gap-1 h-6">
                  {[40, 75, 100, 60, 90, 45, 80, 50, 95, 70, 30].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-cyan-300 rounded-full"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Quote */}
              <div className="z-10 pt-2 border-t border-white/[0.1] text-center">
                <p className="text-[10px] text-white/90 italic line-clamp-2">
                  "{caption}"
                </p>
              </div>
            </div>
          </div>

          {/* Controls & Export Options */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Card Format
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCardFormat('story')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                    cardFormat === 'story'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-white/[0.04] text-slate-400 border-white/[0.06]'
                  }`}
                >
                  9:16 Story Card
                </button>
                <button
                  onClick={() => setCardFormat('banner')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                    cardFormat === 'banner'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-white/[0.04] text-slate-400 border-white/[0.06]'
                  }`}
                >
                  16:9 Banner
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Custom Story Caption
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Listen Together with Friends */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-cyan-500/15 border border-pink-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white">Listen Together with Friends</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-pink-300 px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/30">
                  Live Party
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Stream this music synchronously in real-time with friends. Share the session invite or open the live room!
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-semibold border border-white/[0.1] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Link Copied!' : 'Copy Party Link'}</span>
                </button>
                {onOpenListenTogether && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenListenTogether();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Join Friends Room</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share via Device App</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium rounded-xl text-xs border border-white/[0.08] transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Share Link'}</span>
              </button>
            </div>

            {/* Export Files */}
            <div className="pt-2 border-t border-white/[0.06] flex gap-2">
              <button
                onClick={handleExportM3U}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 text-[11px] rounded-lg border border-white/[0.05] transition-colors"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>Export .M3U</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 text-[11px] rounded-lg border border-white/[0.05] transition-colors"
              >
                <FileCode className="w-3 h-3 text-purple-400" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
