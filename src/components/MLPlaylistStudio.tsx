import React, { useState } from 'react';
import {
  Radio,
  Sparkles,
  SlidersHorizontal,
  Play,
  BookmarkPlus,
  Zap,
  Check,
  Music,
  ArrowRight,
} from 'lucide-react';
import { Playlist, Track } from '../types/music';
import confetti from 'canvas-confetti';

interface MLPlaylistStudioProps {
  availableTracks: Track[];
  onGeneratePlaylist: (
    prompt: string,
    mood: string,
    bpm: number,
    energy: number
  ) => Promise<Playlist>;
  onPlayPlaylist: (playlist: Playlist) => void;
  onSavePlaylist: (playlist: Playlist) => void;
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
}

const PRESET_PROMPTS = [
  {
    title: 'Neon Tokyo Night Drive',
    prompt: 'Speeding through rainy highway with retro analog synths and driving basslines',
    mood: 'Late Night Drive',
    bpm: 124,
    energy: 85,
    tag: 'Synthwave',
  },
  {
    title: 'Rainy Cafe Lo-Fi Study',
    prompt: 'Warm Rhodes piano, vinyl dust, peaceful boombap drums for sustained concentration',
    mood: 'Deep Focus',
    bpm: 84,
    energy: 55,
    tag: 'Lo-Fi',
  },
  {
    title: 'Subterranean Berlin Rave',
    prompt: 'Deep four-on-the-floor hypnotic club grooves with filtered chords and deep sub kicks',
    mood: 'Hypnotic Groove',
    bpm: 126,
    energy: 90,
    tag: 'Deep House',
  },
  {
    title: 'Midnight Velvet Lounge',
    prompt: 'Soulful electric guitar, buttery basslines and candlelit evening relaxation',
    mood: 'Velvet Evening',
    bpm: 92,
    energy: 60,
    tag: 'Neo-Soul',
  },
];

export const MLPlaylistStudio: React.FC<MLPlaylistStudioProps> = ({
  availableTracks,
  onGeneratePlaylist,
  onPlayPlaylist,
  onSavePlaylist,
  currentTrackId,
  isPlaying,
  onPlayTrack,
}) => {
  const [prompt, setPrompt] = useState('Cyberpunk coding session with relentless energy');
  const [selectedMood, setSelectedMood] = useState('High Energy Focus');
  const [targetBpm, setTargetBpm] = useState(124);
  const [energy, setEnergy] = useState(82);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlaylist, setGeneratedPlaylist] = useState<Playlist | null>(null);
  const [generationStep, setGenerationStep] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setIsSaved(false);

    // Multi-stage generation feedback for tactile feel
    setGenerationStep('Analyzing listener history & harmonic keys...');
    await new Promise((r) => setTimeout(r, 400));
    setGenerationStep('Calculating BPM transitions and energy arc...');
    await new Promise((r) => setTimeout(r, 500));
    setGenerationStep('Synthesizing dynamic playlist metadata...');

    try {
      const playlist = await onGeneratePlaylist(prompt, selectedMood, targetBpm, energy);
      setGeneratedPlaylist(playlist);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#00f0ff', '#8b5cf6', '#ec4899'],
        });
      } catch {
        // ignore
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleApplyPreset = (p: (typeof PRESET_PROMPTS)[0]) => {
    setPrompt(p.prompt);
    setSelectedMood(p.mood);
    setTargetBpm(p.bpm);
    setEnergy(p.energy);
  };

  const handleSave = () => {
    if (generatedPlaylist) {
      onSavePlaylist(generatedPlaylist);
      setIsSaved(true);
    }
  };

  const playlistTracks = generatedPlaylist
    ? generatedPlaylist.trackIds
        .map((id) => availableTracks.find((t) => t.id === id))
        .filter(Boolean) as Track[]
    : [];

  return (
    <div className="space-y-8 pb-32 max-w-5xl mx-auto">
      {/* Studio Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Intelligent Audio Synthesizer
          </span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          ML Playlist Studio
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Describe any vibe, scene, or activity. Our machine learning engine generates harmonically sequenced tracklists matched to your exact energy and tempo preference.
        </p>
      </div>

      {/* Main Generator Configuration Card */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0c0f1c] via-[#090a12] to-[#07080c] border border-white/[0.08] shadow-2xl space-y-6">
        {/* Natural Language Prompt Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Prompt Your Audio Experience
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Late night drive through empty rain-soaked city streets with pulsating analog synthwave and deep sub bass..."
              className="w-full p-4 text-sm bg-white/[0.04] border border-white/[0.1] rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/60 focus:bg-white/[0.07] transition-all resize-none"
            />
            <Sparkles className="absolute right-4 bottom-4 w-4 h-4 text-cyan-400 opacity-60 pointer-events-none" />
          </div>
        </div>

        {/* Quick Inspiration Presets */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Quick Inspiration Presets
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESET_PROMPTS.map((p) => (
              <button
                key={p.title}
                onClick={() => handleApplyPreset(p)}
                className="text-left p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:border-cyan-500/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                    {p.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{p.bpm} BPM</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{p.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Controls Grid (Sliders & Parameters) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-white/[0.06]">
          {/* Energy Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Target Energy Level</span>
              <span className="font-mono text-cyan-400">{energy} / 100</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Mellow / Ambient</span>
              <span>Balanced Flow</span>
              <span>High Octane / Rave</span>
            </div>
          </div>

          {/* BPM Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Tempo Cadence</span>
              <span className="font-mono text-purple-400">{targetBpm} BPM</span>
            </div>
            <input
              type="range"
              min={70}
              max={150}
              step={2}
              value={targetBpm}
              onChange={(e) => setTargetBpm(Number(e.target.value))}
              className="w-full accent-purple-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>70 (Slow Lo-Fi)</span>
              <span>110 (Groove)</span>
              <span>150 (Fast Phonk)</span>
            </div>
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="pt-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-slate-950 font-bold rounded-2xl shadow-xl shadow-cyan-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 text-sm"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                <span>{generationStep || 'Synthesizing ML Playlist...'}</span>
              </>
            ) : (
              <>
                <Radio className="w-4 h-4 text-slate-950" />
                <span>Generate Smart Playlist</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Playlist Result */}
      {generatedPlaylist && (
        <section className="rounded-3xl p-8 border border-white/[0.08] bg-[#090b14] space-y-6 animate-fadeIn">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-5">
              <div
                className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-2xl border border-white/[0.1]"
                style={{ background: generatedPlaylist.coverGradient }}
              >
                <Music className="w-8 h-8 text-white/90" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    ML Generated
                  </span>
                  <span className="text-xs text-slate-400">
                    {playlistTracks.length} tracks · {targetBpm} BPM
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">{generatedPlaylist.name}</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  {generatedPlaylist.description}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => onPlayPlaylist(generatedPlaylist)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded-xl transition-all active:scale-95 text-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Now</span>
              </button>

              <button
                onClick={handleSave}
                disabled={isSaved}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all ${
                  isSaved
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-white/[0.06] hover:bg-white/[0.1] border-white/[0.1] text-white active:scale-95'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Saved to Library</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Save Playlist</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sequenced Tracklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Harmonically Sequenced Tracks
            </h4>
            <div className="divide-y divide-white/[0.04]">
              {playlistTracks.map((track, i) => {
                const isCurrent = currentTrackId === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => onPlayTrack(track)}
                    className={`flex items-center justify-between p-3.5 rounded-xl hover:bg-white/[0.03] cursor-pointer transition-colors ${
                      isCurrent ? 'bg-cyan-500/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 text-center text-xs font-mono text-slate-500">
                        {i + 1}
                      </span>
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isCurrent ? 'text-cyan-300' : 'text-slate-100'
                          }`}
                        >
                          {track.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>{track.genre}</span>
                      <span className="font-mono">{track.bpm} BPM</span>
                      <span className="font-mono">
                        {Math.floor(track.duration / 60)}:
                        {(track.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
