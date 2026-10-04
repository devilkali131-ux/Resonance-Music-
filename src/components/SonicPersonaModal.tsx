import React from 'react';
import { X, Sparkles, Zap, Compass, Activity, Share2 } from 'lucide-react';
import { SonicPersona } from '../types/music';

interface SonicPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: SonicPersona | null;
  onShare: () => void;
}

export const SonicPersonaModal: React.FC<SonicPersonaModalProps> = ({
  isOpen,
  onClose,
  persona,
  onShare,
}) => {
  if (!isOpen || !persona) return null;

  const radar = persona.radar;

  const radarItems = [
    { label: 'Energy', value: radar.energy, color: 'text-cyan-400', bg: 'bg-cyan-400' },
    { label: 'Focus Cadence', value: radar.focusScore, color: 'text-purple-400', bg: 'bg-purple-400' },
    { label: 'Danceability', value: radar.danceability, color: 'text-pink-400', bg: 'bg-pink-400' },
    { label: 'Positivity (Valence)', value: radar.valence, color: 'text-amber-400', bg: 'bg-amber-400' },
    { label: 'Acoustic Warmth', value: radar.acousticness, color: 'text-emerald-400', bg: 'bg-emerald-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-lg bg-[#090b14] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sonic Listener Persona</h3>
              <p className="text-xs text-slate-400">Machine learning taste profile</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/20">
              {persona.archetype}
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {persona.personaName}
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            {persona.summary}
          </p>

          <div className="pt-2 flex flex-wrap gap-1.5">
            {persona.topGenres.map((g) => (
              <span
                key={g}
                className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.05]"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Audio Radar Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Acoustic Taste Radar</span>
          </h4>

          <div className="space-y-2.5">
            {radarItems.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">{item.label}</span>
                  <span className={`font-mono font-semibold ${item.color}`}>
                    {item.value}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.bg} rounded-full transition-all duration-700`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="pt-2">
          <button
            onClick={() => {
              onClose();
              onShare();
            }}
            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share My Sonic Persona Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
