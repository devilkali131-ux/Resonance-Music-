import React, { useEffect } from 'react';
import { X, Sliders, RotateCcw, Check } from 'lucide-react';
import { EqualizerState } from '../types/music';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  equalizer: EqualizerState;
  onEqualizerChange: (eq: EqualizerState) => void;
}

const PRESETS: { name: string; eq: EqualizerState }[] = [
  { name: 'Flat', eq: { bass: 0, mid: 0, treble: 0, surround: false } },
  { name: 'Bass Boost', eq: { bass: 7, mid: 0, treble: -2, surround: false } },
  { name: 'Vocal Clarity', eq: { bass: -2, mid: 6, treble: 3, surround: false } },
  { name: 'Electronic', eq: { bass: 6, mid: -1, treble: 6, surround: true } },
  { name: 'Acoustic', eq: { bass: 3, mid: 4, treble: 2, surround: false } },
  { name: 'Rock', eq: { bass: 5, mid: 3, treble: 4, surround: false } },
  { name: 'Lo-Fi Chill', eq: { bass: 4, mid: -2, treble: -4, surround: false } },
  { name: 'Treble Boost', eq: { bass: -3, mid: 1, treble: 7, surround: false } },
];

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  equalizer,
  onEqualizerChange,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPresetActive = (pEq: EqualizerState) =>
    equalizer.bass === pEq.bass &&
    equalizer.mid === pEq.mid &&
    equalizer.treble === pEq.treble;

  const handleReset = () => {
    onEqualizerChange({ bass: 0, mid: 0, treble: 0, surround: false });
  };

  // Calculate curve points for visual representation
  const bassY = 40 - equalizer.bass * 2.5;
  const midY = 40 - equalizer.mid * 2.5;
  const trebleY = 40 - equalizer.treble * 2.5;
  const pathD = `M 10 40 Q 60 ${bassY}, 120 ${midY} T 240 ${trebleY} L 310 40`;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 animate-fadeIn select-none">
      {/* Dark Blur Backdrop with click to close */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity cursor-pointer"
      />

      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-[#090b16] border border-cyan-500/40 p-5 sm:p-7 shadow-2xl shadow-black/95 overflow-hidden space-y-5">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header with High-Visibility Cross Button */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 text-white">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">Audio Equalizer</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Studio DSP
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Parametric acoustic curve & frequency master
              </p>
            </div>
          </div>

          {/* Prominent High-Visibility Cross Button to close popup */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-300 border border-white/20 hover:border-rose-400/40 shadow-lg transition-all active:scale-90 flex items-center justify-center cursor-pointer group"
            title="Close Equalizer (Esc)"
          >
            <X className="w-5 h-5 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Graphic Frequency Response Curve Display */}
        <div className="p-3 rounded-2xl bg-black/50 border border-white/[0.08] relative z-10 overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1 mb-1">
            <span className="text-cyan-400">Low (20-250Hz)</span>
            <span className="text-purple-400">Mid (250-4kHz)</span>
            <span className="text-pink-400">High (4k-20kHz)</span>
          </div>
          <svg viewBox="0 0 320 80" className="w-full h-16 overflow-visible">
            <defs>
              <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <line x1="10" y1="40" x2="310" y2="40" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
            <path
              d={pathD}
              fill="none"
              stroke="url(#curveGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="transition-all duration-150"
            />
            <circle cx="60" cy={bassY} r="4" fill="#06b6d4" />
            <circle cx="160" cy={midY} r="4" fill="#a855f7" />
            <circle cx="260" cy={trebleY} r="4" fill="#ec4899" />
          </svg>
        </div>

        {/* Interactive Presets Grid */}
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
              Quick EQ Presets
            </span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Flat</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESETS.map((preset) => {
              const active = isPresetActive(preset.eq);
              return (
                <button
                  key={preset.name}
                  onClick={() => onEqualizerChange(preset.eq)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/10'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border-white/[0.08]'
                  }`}
                >
                  <span className="truncate">{preset.name}</span>
                  {active && <Check className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Parametric Frequency Sliders with Visual Curve */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-5 relative z-10">
          {/* Bass Slider (Low Shelf - 200Hz) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Bass (Low Shelf · 200 Hz)</span>
              <span className="font-mono font-bold text-cyan-400">
                {equalizer.bass > 0 ? `+${equalizer.bass}` : equalizer.bass} dB
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={equalizer.bass}
                onChange={(e) =>
                  onEqualizerChange({ ...equalizer, bass: Number(e.target.value) })
                }
                className="w-full h-2 bg-white/[0.1] rounded-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Mid Slider (Peaking - 1000Hz) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Mid (Voice & Instruments · 1 kHz)</span>
              <span className="font-mono font-bold text-purple-400">
                {equalizer.mid > 0 ? `+${equalizer.mid}` : equalizer.mid} dB
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={equalizer.mid}
                onChange={(e) =>
                  onEqualizerChange({ ...equalizer, mid: Number(e.target.value) })
                }
                className="w-full h-2 bg-white/[0.1] rounded-full accent-purple-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Treble Slider (High Shelf - 4000Hz) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Treble (Air & Crispness · 4 kHz)</span>
              <span className="font-mono font-bold text-pink-400">
                {equalizer.treble > 0 ? `+${equalizer.treble}` : equalizer.treble} dB
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="range"
                min={-12}
                max={12}
                step={0.5}
                value={equalizer.treble}
                onChange={(e) =>
                  onEqualizerChange({ ...equalizer, treble: Number(e.target.value) })
                }
                className="w-full h-2 bg-white/[0.1] rounded-full accent-pink-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-1 relative z-10">
          <p className="text-[11px] text-slate-400">
            Real-time audio filter graph active
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-400/20 active:scale-95 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
