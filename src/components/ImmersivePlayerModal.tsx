import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X,
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Sliders,
  Sparkles,
  Music,
  Share2,
  FileText,
  Disc3,
  Columns,
  Maximize2,
  Volume2,
  Activity,
  RotateCcw,
} from 'lucide-react';
import { EqualizerState, Track } from '../types/music';
import { AmbientArtGlow } from './AmbientArtGlow';
import { RealtimeVisualizer } from './RealtimeVisualizer';
import { extractDominantPalette, TrackPalette } from '../utils/colorExtractor';

export type PlayerViewMode = 'lyrics-only' | 'artwork-only' | 'split';

interface ImmersivePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  isShuffle: boolean;
  isRepeat: boolean;
  isLiked: boolean;
  onToggleLike: () => void;
  onShareTrack: () => void;
  equalizer: EqualizerState;
  onEqualizerChange: (eq: EqualizerState) => void;
  onOpenEqualizer?: () => void;
}

const EQ_PRESETS: { name: string; eq: EqualizerState }[] = [
  { name: 'Flat', eq: { bass: 0, mid: 0, treble: 0, surround: false } },
  { name: 'Bass Boost', eq: { bass: 8, mid: 1, treble: 2, surround: false } },
  { name: 'Club EDM', eq: { bass: 7, mid: -1, treble: 5, surround: true } },
  { name: 'Vocal Clarity', eq: { bass: -2, mid: 6, treble: 3, surround: false } },
  { name: '3D Ambient', eq: { bass: 3, mid: -2, treble: 4, surround: true } },
];

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const ImmersivePlayerModal: React.FC<ImmersivePlayerModalProps> = ({
  isOpen,
  onClose,
  track,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onPrevious,
  onNext,
  onSeek,
  onToggleShuffle,
  onToggleRepeat,
  isShuffle,
  isRepeat,
  isLiked,
  onToggleLike,
  onShareTrack,
  equalizer,
  onEqualizerChange,
  onOpenEqualizer,
}) => {
  // View mode: 'lyrics-only' | 'artwork-only' | 'split'
  const [viewMode, setViewMode] = useState<PlayerViewMode>('split');
  const [activeTabInSplit, setActiveTabInSplit] = useState<'lyrics' | 'equalizer' | 'details'>('lyrics');
  const [showPlainLyrics, setShowPlainLyrics] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [userScrolledAway, setUserScrolledAway] = useState(false);
  const fullLyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const splitLyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const lastScrolledIdxRef = useRef<number>(-1);
  const userScrollTimerRef = useRef<any>(null);
  const [ambientPalette, setAmbientPalette] = useState<TrackPalette | null>(null);

  useEffect(() => {
    if (track) {
      extractDominantPalette(track.coverUrl, track.accentColor).then((p) => {
        setAmbientPalette(p);
      });
    }
  }, [track]);

  // Adjust default viewMode based on screen width on initial open
  useEffect(() => {
    if (isOpen) {
      if (window.innerWidth < 768) {
        // Mobile starts in artwork or lyrics view
        setViewMode('artwork-only');
      } else {
        setViewMode('split');
      }
    }
  }, [isOpen]);

  // Calculate current active lyric index with highest accuracy
  const currentLyricIdx = useMemo(() => {
    if (!track?.lyrics || track.lyrics.length === 0) return -1;
    // If before first lyric timestamp
    if (currentTime < track.lyrics[0].time) return -1;
    for (let i = track.lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= track.lyrics[i].time) {
        return i;
      }
    }
    return -1;
  }, [track?.lyrics, currentTime]);

  // Smooth centering auto-scroll to the active line
  const scrollToActiveLine = useCallback(
    (idx: number, smooth: boolean = true) => {
      if (idx < 0) return;
      const container =
        viewMode === 'lyrics-only'
          ? fullLyricsContainerRef.current
          : viewMode === 'split' && activeTabInSplit === 'lyrics'
          ? splitLyricsContainerRef.current
          : null;

      if (!container) return;

      const activeEl = container.querySelector(
        `[data-lyric-idx="${idx}"]`
      ) as HTMLElement | null;

      if (activeEl) {
        const containerHeight = container.clientHeight;
        const elOffsetTop = activeEl.offsetTop;
        const elHeight = activeEl.clientHeight;
        const targetTop = elOffsetTop - containerHeight / 2 + elHeight / 2;

        container.scrollTo({
          top: Math.max(0, targetTop),
          behavior: smooth ? 'smooth' : 'auto',
        });
        lastScrolledIdxRef.current = idx;
        setUserScrolledAway(false);
      }
    },
    [viewMode, activeTabInSplit]
  );

  // Auto-scroll when the active lyric index changes
  useEffect(() => {
    if (!isAutoScrollEnabled || userScrolledAway) return;
    if (
      currentLyricIdx !== -1 &&
      currentLyricIdx !== lastScrolledIdxRef.current
    ) {
      scrollToActiveLine(currentLyricIdx, true);
    }
  }, [currentLyricIdx, isAutoScrollEnabled, userScrolledAway, scrollToActiveLine]);

  // Immediately center active line when switching views or tabs
  useEffect(() => {
    if (isAutoScrollEnabled && currentLyricIdx !== -1) {
      const timer = setTimeout(() => {
        scrollToActiveLine(currentLyricIdx, false);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [viewMode, activeTabInSplit, isAutoScrollEnabled, scrollToActiveLine, currentLyricIdx]);

  // Handle user manual scroll: temporarily pause auto-scroll if user scrolled far from active
  const handleUserScroll = useCallback(() => {
    // If user scrolled, we pause auto-scroll briefly so it doesn't interrupt reading
    setUserScrolledAway(true);
    if (userScrollTimerRef.current) {
      clearTimeout(userScrollTimerRef.current);
    }
    // Resume auto-scroll automatically after 4.5 seconds of inactivity
    userScrollTimerRef.current = setTimeout(() => {
      setUserScrolledAway(false);
      if (currentLyricIdx !== -1) {
        scrollToActiveLine(currentLyricIdx, true);
      }
    }, 4500);
  }, [currentLyricIdx, scrollToActiveLine]);

  if (!isOpen || !track) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const primaryAccent = ambientPalette?.primary || track.accentColor || '#00f0ff';

  return (
    <div className="fixed inset-0 z-50 bg-[#07080d] flex flex-col select-none overflow-hidden animate-fadeIn h-[100dvh] w-screen">
      {/* Dynamic Ambient Background Glow from Artwork Dominant Colors (Liquid Glass deep blur) */}
      <div
        className="absolute inset-0 opacity-30 blur-3xl pointer-events-none transition-all duration-1000 scale-125"
        style={{
          background: ambientPalette
            ? `radial-gradient(circle at 50% 30%, ${ambientPalette.primary} 0%, ${ambientPalette.secondary} 40%, transparent 75%)`
            : `radial-gradient(circle at 50% 30%, ${primaryAccent} 0%, transparent 70%)`,
        }}
      />
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
          isPlaying ? 'opacity-25 animate-pulse' : 'opacity-10'
        }`}
        style={{
          background: ambientPalette?.secondary || '#8b5cf6',
        }}
      />

      {/* Top Mobile Pull Handle - Swipe down or tap to close */}
      <div
        onClick={onClose}
        className="w-full flex justify-center pt-2 pb-1 cursor-pointer sm:hidden z-40 relative group"
        title="Tap to minimize player"
      >
        <div className="w-12 h-1.5 rounded-full bg-white/30 group-hover:bg-white/60 transition-colors" />
      </div>

      {/* FIXED CLOSE BUTTON (Top-Right) - Guaranteed visible on all mobile and desktop screens */}
      <button
        onClick={onClose}
        aria-label="Close Player"
        title="Close Player"
        className="fixed top-3 right-3 sm:top-5 sm:right-6 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 active:scale-95 text-white/80 hover:text-white border border-white/20 backdrop-blur-2xl shadow-2xl transition-all"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Top Left Minimize Chevron Button (Mobile Friendly) */}
      <button
        onClick={onClose}
        aria-label="Minimize Player"
        title="Minimize Player"
        className="fixed top-3 left-3 sm:top-5 sm:left-6 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 active:scale-95 text-white/80 hover:text-white border border-white/20 backdrop-blur-2xl shadow-2xl transition-all sm:hidden"
      >
        <ChevronDown className="w-5 h-5" />
      </button>

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center gap-2.5 min-w-0 pr-12 sm:pr-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
            <Music className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="truncate">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-slate-400 block truncate">
              Resonance Music Immersive
            </span>
            <span className="text-xs sm:text-sm font-semibold text-white truncate block">
              {track.album || track.title}
            </span>
          </div>
        </div>

        {/* View Mode Toggle: [Artwork Only] | [Lyrics Only] | [Split View] | [Audio EQ] */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-black/40 rounded-2xl border border-white/[0.1] backdrop-blur-2xl mr-12">
          <button
            onClick={() => setViewMode('artwork-only')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'artwork-only'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span>Artwork</span>
          </button>

          <button
            onClick={() => setViewMode('lyrics-only')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'lyrics-only'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lyrics Only</span>
          </button>

          <button
            onClick={() => {
              setViewMode('split');
              setActiveTabInSplit('lyrics');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'split' && activeTabInSplit === 'lyrics'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          <button
            onClick={() => {
              if (onOpenEqualizer) {
                onOpenEqualizer();
              } else {
                setViewMode('split');
                setActiveTabInSplit('equalizer');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all text-slate-400 hover:text-white cursor-pointer"
            title="Open Audio Equalizer Pop-up"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Audio EQ</span>
          </button>
        </div>
      </header>

      {/* Mobile-Only Mode Switcher Bar */}
      <div className="flex sm:hidden items-center justify-center gap-1.5 px-4 py-2 border-b border-white/[0.06] bg-black/20 z-10">
        <button
          onClick={() => setViewMode('artwork-only')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
            viewMode === 'artwork-only'
              ? 'bg-cyan-400 text-slate-950 shadow-sm'
              : 'bg-white/[0.04] text-slate-400'
          }`}
        >
          💿 Artwork
        </button>
        <button
          onClick={() => setViewMode('lyrics-only')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center ${
            viewMode === 'lyrics-only'
              ? 'bg-cyan-400 text-slate-950 shadow-sm'
              : 'bg-white/[0.04] text-slate-400'
          }`}
        >
          🎤 Lyrics Only
        </button>
        <button
          onClick={() => {
            if (onOpenEqualizer) {
              onOpenEqualizer();
            } else {
              setViewMode('split');
              setActiveTabInSplit('equalizer');
            }
          }}
          className="flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center bg-white/[0.04] text-slate-300 hover:text-white cursor-pointer"
          title="Open Audio Equalizer Pop-up"
        >
          🎛️ Equalizer
        </button>
      </div>

      {/* ================================================================= */}
      {/* MAIN VIEWPORT: SWITCHES BETWEEN LYRICS-ONLY, ARTWORK-ONLY, & SPLIT */}
      {/* ================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden max-w-6xl mx-auto w-full px-4 sm:px-8 py-3 sm:py-6">
        {/* ------------------------------------------------------------- */}
        {/* MODE 1: LYRICS ONLY (Full-Screen Immersive Karaoke Lyrics)    */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'lyrics-only' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-fadeIn">
            {/* Header pill with track summary & quick switch to artwork */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-10 h-10 rounded-xl object-cover border border-white/[0.1] shadow-md"
                />
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{track.title}</h4>
                  <p className="text-xs text-slate-400">{track.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Auto-Scroll Toggle Button */}
                <button
                  onClick={() => {
                    const nextState = !isAutoScrollEnabled;
                    setIsAutoScrollEnabled(nextState);
                    if (nextState && currentLyricIdx !== -1) {
                      scrollToActiveLine(currentLyricIdx, true);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-all border cursor-pointer ${
                    isAutoScrollEnabled
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-sm'
                      : 'bg-white/[0.05] text-slate-400 border-white/[0.08]'
                  }`}
                  title="Toggle Lyrics Auto-Scroll"
                >
                  <Activity className={`w-3.5 h-3.5 ${isAutoScrollEnabled ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
                  <span>{isAutoScrollEnabled ? 'Auto-Scroll ON' : 'Auto-Scroll OFF'}</span>
                </button>

                {track.plainLyrics && (
                  <button
                    onClick={() => setShowPlainLyrics(!showPlainLyrics)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] transition-all cursor-pointer"
                  >
                    {showPlainLyrics ? 'Synced' : 'Plain'}
                  </button>
                )}

                <button
                  onClick={() => setViewMode('artwork-only')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 transition-all cursor-pointer"
                >
                  <Disc3 className="w-3.5 h-3.5" />
                  <span>Show Artwork</span>
                </button>
              </div>
            </div>

            {/* Resume Auto-scroll Floating Pill if user scrolled away */}
            {userScrolledAway && isAutoScrollEnabled && currentLyricIdx !== -1 && (
              <div className="flex justify-center pb-2">
                <button
                  onClick={() => {
                    setUserScrolledAway(false);
                    if (currentLyricIdx !== -1) {
                      scrollToActiveLine(currentLyricIdx, true);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs shadow-xl shadow-cyan-500/30 flex items-center gap-1.5 hover:bg-cyan-300 transition-all cursor-pointer animate-fadeIn"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Resume Auto-Scroll</span>
                </button>
              </div>
            )}

            {/* Lyrics Container */}
            <div
              ref={fullLyricsContainerRef}
              onScroll={handleUserScroll}
              className="flex-1 overflow-y-auto px-3 sm:px-12 py-10 space-y-6 text-center scrollbar-none scroll-smooth"
            >
              {showPlainLyrics && track.plainLyrics ? (
                <div className="max-w-2xl mx-auto whitespace-pre-line text-slate-300 text-sm sm:text-base leading-relaxed py-4">
                  {track.plainLyrics}
                </div>
              ) : track.lyrics && track.lyrics.length > 0 ? (
                track.lyrics.map((line, idx) => {
                  const isActive = idx === currentLyricIdx;
                  const isPast = idx < currentLyricIdx;
                  const isFuture = idx > currentLyricIdx;

                  return (
                    <div
                      key={idx}
                      data-lyric-idx={idx}
                      data-active={isActive ? 'true' : undefined}
                      onClick={() => {
                        onSeek(line.time);
                        scrollToActiveLine(idx, true);
                      }}
                      className={`group cursor-pointer transition-all duration-300 py-3 sm:py-4 px-4 sm:px-8 rounded-2xl relative select-none ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/20 via-cyan-400/15 to-indigo-500/20 border border-cyan-400/40 shadow-2xl shadow-cyan-500/30 scale-105 sm:scale-110'
                          : isPast
                          ? 'opacity-60 hover:opacity-100 hover:bg-white/[0.04]'
                          : 'opacity-35 hover:opacity-85 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2.5">
                        {isActive && (
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/30 animate-pulse flex-shrink-0" />
                        )}
                        <p
                          className={`font-black tracking-tight leading-relaxed transition-all duration-300 ${
                            isActive
                              ? 'text-white text-xl sm:text-3xl drop-shadow-[0_0_25px_rgba(0,240,255,0.7)]'
                              : isPast
                              ? 'text-slate-300 text-sm sm:text-xl font-semibold'
                              : 'text-slate-400 text-xs sm:text-lg font-medium'
                          }`}
                        >
                          {line.text}
                        </p>
                      </div>

                      {/* Jump to time indicator on hover */}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-cyan-300/80 block mt-1">
                        ▶ Jump to {Math.floor(line.time / 60)}:{(line.time % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 text-slate-500" />
                  <p className="text-sm">Instrumental or live lyrics unavailable for this track</p>
                  <button
                    onClick={() => setViewMode('artwork-only')}
                    className="px-4 py-2 mt-2 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-xs"
                  >
                    Switch to Artwork View
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE 2: ARTWORK ONLY (Giant Album Art, Glow & Visualizer)     */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'artwork-only' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-fadeIn py-2">
            <AmbientArtGlow
              coverUrl={track.coverUrl}
              accentColor={primaryAccent}
              isPlaying={isPlaying}
              glowIntensity="immersive"
            >
              <div className="relative w-64 sm:w-84 md:w-96 aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/[0.12] group">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className={`w-full h-full object-cover transition-transform duration-1000 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent pointer-events-none ${
                    isPlaying ? 'animate-pulse' : ''
                  }`}
                />
              </div>
            </AmbientArtGlow>

            {/* Real-time Spectrum Waveform Visualizer under Artwork */}
            <div className="w-64 sm:w-80 h-10 px-2">
              <RealtimeVisualizer
                isPlaying={isPlaying}
                accentColor={primaryAccent}
                height={36}
                interactive={true}
              />
            </div>

            {/* Track Info */}
            <div className="text-center max-w-lg">
              <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                {track.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-400 mt-1 font-medium">{track.artist}</p>
              <div className="flex items-center justify-center gap-3 text-xs text-slate-500 mt-2">
                <span>{track.genre}</span>
                <span aria-hidden="true">·</span>
                <span>{track.bpm} BPM</span>
                <span aria-hidden="true">·</span>
                <span>Key of {track.key}</span>
              </div>
            </div>

            {/* Quick Switch to Lyrics Button */}
            <button
              onClick={() => setViewMode('lyrics-only')}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.06] hover:bg-cyan-500/20 border border-white/[0.1] text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-all shadow-lg backdrop-blur-xl"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Show Lyrics Only</span>
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE 3: SPLIT VIEW (Artwork on left, Lyrics/EQ on right)      */}
        {/* ------------------------------------------------------------- */}
        {viewMode === 'split' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center overflow-hidden animate-fadeIn">
            {/* Left: Artwork Presentation */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <AmbientArtGlow
                coverUrl={track.coverUrl}
                accentColor={primaryAccent}
                isPlaying={isPlaying}
                glowIntensity="immersive"
              >
                <div className="relative w-56 sm:w-72 md:w-80 aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/[0.1] group">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className={`w-full h-full object-cover transition-transform duration-1000 ${
                      isPlaying ? 'scale-105' : 'scale-100'
                    }`}
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent pointer-events-none ${
                      isPlaying ? 'animate-pulse' : ''
                    }`}
                  />
                </div>
              </AmbientArtGlow>

              <div className="text-center max-w-md">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {track.title}
                </h3>
                <p className="text-sm text-slate-400 mt-1">{track.artist}</p>
                <div className="flex items-center justify-center gap-3 text-xs text-slate-500 mt-1.5">
                  <span>{track.genre}</span>
                  <span aria-hidden="true">·</span>
                  <span>{track.bpm} BPM</span>
                  <span aria-hidden="true">·</span>
                  <span>Key of {track.key}</span>
                </div>
              </div>

              {/* Toggle to full lyrics button */}
              <button
                onClick={() => setViewMode('lyrics-only')}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expand Lyrics Full Screen</span>
              </button>
            </div>

            {/* Right: Lyrics / EQ / Details Panel */}
            <div className="h-full flex flex-col justify-center min-h-[340px] max-h-[440px] bg-black/40 border border-white/[0.08] rounded-3xl p-5 backdrop-blur-2xl overflow-hidden">
              {/* Tab Selector inside Split */}
              <div className="flex items-center gap-2 pb-3 mb-2 border-b border-white/[0.06]">
                <button
                  onClick={() => setActiveTabInSplit('lyrics')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTabInSplit === 'lyrics'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Synced Lyrics
                </button>
                <button
                  onClick={() => setActiveTabInSplit('equalizer')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTabInSplit === 'equalizer'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Audio EQ
                </button>
                <button
                  onClick={() => setActiveTabInSplit('details')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTabInSplit === 'details'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Insights
                </button>
              </div>

              {/* Tab Content */}
              {activeTabInSplit === 'lyrics' && (
                <div
                  ref={splitLyricsContainerRef}
                  onScroll={handleUserScroll}
                  className="h-full overflow-y-auto space-y-3 py-4 px-3 text-center scrollbar-none scroll-smooth"
                >
                  {track.lyrics && track.lyrics.length > 0 ? (
                    track.lyrics.map((line, idx) => {
                      const isActive = idx === currentLyricIdx;
                      const isPast = idx < currentLyricIdx;
                      const isFuture = idx > currentLyricIdx;

                      return (
                        <div
                          key={idx}
                          data-lyric-idx={idx}
                          data-active={isActive ? 'true' : undefined}
                          onClick={() => {
                            onSeek(line.time);
                            scrollToActiveLine(idx, true);
                          }}
                          className={`group cursor-pointer transition-all duration-300 py-2 sm:py-2.5 px-3 rounded-xl select-none ${
                            isActive
                              ? 'bg-gradient-to-r from-cyan-500/20 via-cyan-400/15 to-indigo-500/20 border border-cyan-400/40 shadow-lg shadow-cyan-500/20 scale-105'
                              : isPast
                              ? 'opacity-65 hover:opacity-100 hover:bg-white/[0.04]'
                              : 'opacity-35 hover:opacity-85 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30 animate-pulse flex-shrink-0" />
                            )}
                            <p
                              className={`font-black tracking-tight leading-relaxed transition-all duration-300 ${
                                isActive
                                  ? 'text-white text-base sm:text-lg drop-shadow-[0_0_15px_rgba(0,240,255,0.7)]'
                                  : isPast
                                  ? 'text-slate-300 text-xs sm:text-sm font-semibold'
                                  : 'text-slate-400 text-xs font-normal'
                              }`}
                            >
                              {line.text}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-slate-500 text-sm flex items-center justify-center h-full">
                      Instrumental track · No vocal lyrics
                    </div>
                  )}
                </div>
              )}

              {activeTabInSplit === 'equalizer' && (
                <div className="space-y-4 p-2 overflow-y-auto scrollbar-none">
                  <div className="flex flex-wrap gap-1.5">
                    {EQ_PRESETS.map((p) => {
                      const isMatch =
                        equalizer.bass === p.eq.bass &&
                        equalizer.mid === p.eq.mid &&
                        equalizer.treble === p.eq.treble;
                      return (
                        <button
                          key={p.name}
                          onClick={() => onEqualizerChange(p.eq)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                            isMatch
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                              : 'bg-white/[0.04] text-slate-400 hover:text-white border-white/[0.08]'
                          }`}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sliders */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Bass (200 Hz)</span>
                        <span className="font-mono text-cyan-400">{equalizer.bass > 0 ? `+${equalizer.bass}` : equalizer.bass} dB</span>
                      </div>
                      <input
                        type="range"
                        min={-12}
                        max={12}
                        value={equalizer.bass}
                        onChange={(e) => onEqualizerChange({ ...equalizer, bass: Number(e.target.value) })}
                        className="w-full accent-cyan-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Mid (1 kHz)</span>
                        <span className="font-mono text-purple-400">{equalizer.mid > 0 ? `+${equalizer.mid}` : equalizer.mid} dB</span>
                      </div>
                      <input
                        type="range"
                        min={-12}
                        max={12}
                        value={equalizer.mid}
                        onChange={(e) => onEqualizerChange({ ...equalizer, mid: Number(e.target.value) })}
                        className="w-full accent-purple-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Treble (4 kHz)</span>
                        <span className="font-mono text-pink-400">{equalizer.treble > 0 ? `+${equalizer.treble}` : equalizer.treble} dB</span>
                      </div>
                      <input
                        type="range"
                        min={-12}
                        max={12}
                        value={equalizer.treble}
                        onChange={(e) => onEqualizerChange({ ...equalizer, treble: Number(e.target.value) })}
                        className="w-full accent-pink-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTabInSplit === 'details' && (
                <div className="space-y-3 p-2 text-xs">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Acoustic Specs</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-slate-500 block text-[10px]">Quality</span>
                      <span className="font-mono text-cyan-400 font-semibold">320 kbps High Res</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-slate-500 block text-[10px]">BPM & Tempo</span>
                      <span className="font-mono text-white font-semibold">{track.bpm} BPM</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-slate-500 block text-[10px]">Musical Key</span>
                      <span className="font-mono text-white font-semibold">{track.key}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-slate-500 block text-[10px]">Platform</span>
                      <span className="font-mono text-cyan-400 font-semibold">{track.source || 'Resonance'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ================================================================= */}
      {/* BOTTOM TRANSPORT CONTROLS (Fixed, Edge-to-Edge Liquid Glass)     */}
      {/* ================================================================= */}
      <footer className="relative z-20 px-4 sm:px-8 py-3 sm:py-5 border-t border-white/[0.08] bg-[#07080d]/95 backdrop-blur-2xl max-w-4xl mx-auto w-full space-y-3">
        {/* Scrubber */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 group">
            <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-xs font-mono text-slate-400 w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleLike}
              className="p-2 text-slate-400 hover:text-pink-400 transition-colors"
              title="Like song"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
            </button>
            <button
              onClick={onShareTrack}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="Share track"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={onToggleShuffle}
              className={`p-2 transition-colors ${
                isShuffle ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={onPrevious}
              className="p-2 text-slate-300 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/25"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 text-slate-300 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </button>

            <button
              onClick={onToggleRepeat}
              className={`p-2 transition-colors ${
                isRepeat ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Quick toggle lyrics / artwork pill right on the bottom bar */}
          <div className="flex items-center">
            {viewMode === 'lyrics-only' ? (
              <button
                onClick={() => setViewMode('artwork-only')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-bold text-slate-300 transition-all border border-white/[0.08]"
                title="Switch to Artwork view"
              >
                <Disc3 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Cover Art</span>
              </button>
            ) : (
              <button
                onClick={() => setViewMode('lyrics-only')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-bold text-slate-300 transition-all border border-white/[0.08]"
                title="Switch to Lyrics Only view"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Lyrics</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
