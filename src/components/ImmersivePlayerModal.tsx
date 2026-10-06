import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ChevronDown,
  Heart,
  Sliders,
  Share2,
  FileText,
  Download,
  CheckCircle2,
  Shuffle,
  Repeat,
  Moon,
  ListMusic,
  MoreVertical,
  X,
  Volume2,
  Clock,
  Music,
  Check,
} from 'lucide-react';
import { EqualizerState, Track } from '../types/music';
import { AmbientArtGlow } from './AmbientArtGlow';
import { extractDominantPalette, TrackPalette } from '../utils/colorExtractor';

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
  onDownloadTrack?: () => void;
  isDownloaded?: boolean;
  isDownloading?: boolean;
}

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
  onDownloadTrack,
  isDownloaded = false,
  isDownloading = false,
}) => {
  const [ambientPalette, setAmbientPalette] = useState<TrackPalette | null>(null);
  const [showLyricsDrawer, setShowLyricsDrawer] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemainingSec, setSleepTimerRemainingSec] = useState<number | null>(null);

  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  // Extract atmospheric palette from track artwork
  useEffect(() => {
    if (track) {
      extractDominantPalette(track.coverUrl, track.accentColor).then((p) => {
        setAmbientPalette(p);
      });
    }
  }, [track]);

  // Handle sleep timer countdown
  useEffect(() => {
    if (sleepTimerRemainingSec === null) return;
    if (sleepTimerRemainingSec <= 0) {
      if (isPlaying) {
        onTogglePlay();
      }
      setSleepTimerMinutes(null);
      setSleepTimerRemainingSec(null);
      return;
    }

    const interval = setInterval(() => {
      setSleepTimerRemainingSec((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerRemainingSec, isPlaying, onTogglePlay]);

  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (minutes === null) {
      setSleepTimerRemainingSec(null);
    } else {
      setSleepTimerRemainingSec(minutes * 60);
    }
    setShowSleepTimerModal(false);
  };

  // Calculate current active lyric index
  const currentLyricIdx = useMemo(() => {
    if (!track?.lyrics || track.lyrics.length === 0) return -1;
    if (currentTime < track.lyrics[0].time) return -1;
    for (let i = track.lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= track.lyrics[i].time) {
        return i;
      }
    }
    return -1;
  }, [track?.lyrics, currentTime]);

  // Auto-scroll lyrics to active line
  useEffect(() => {
    if (!showLyricsDrawer || currentLyricIdx < 0 || !lyricsContainerRef.current) return;
    const activeEl = lyricsContainerRef.current.querySelector(
      `[data-lyric-idx="${currentLyricIdx}"]`
    );
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentLyricIdx, showLyricsDrawer]);

  if (!isOpen || !track) return null;

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const primaryAccent = ambientPalette?.primary || track.accentColor || '#e11d48';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden select-none animate-fadeIn transition-colors duration-700"
      style={{
        backgroundColor: ambientPalette?.rgbPrimary
          ? `rgb(${Math.round(ambientPalette.rgbPrimary[0] * 0.12)}, ${Math.round(
              ambientPalette.rgbPrimary[1] * 0.12
            )}, ${Math.round(ambientPalette.rgbPrimary[2] * 0.12)})`
          : '#1c1219',
        backgroundImage: `radial-gradient(circle at 50% 25%, ${
          ambientPalette?.primary ? `${ambientPalette.primary}22` : 'rgba(150, 30, 60, 0.15)'
        } 0%, transparent 65%)`,
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER: Centered "Now Playing" and Mix Title              */}
      {/* ------------------------------------------------------------- */}
      <header className="relative flex items-center justify-between px-5 sm:px-8 pt-4 pb-2 z-20 w-full">
        {/* Minimize Button (Left) */}
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-white/70 hover:text-white transition-all cursor-pointer active:scale-95"
          title="Minimize player"
        >
          <ChevronDown className="w-6 h-6 stroke-[2.2]" />
        </button>

        {/* Centered Track Context */}
        <div className="text-center absolute left-1/2 -translate-x-1/2 pointer-events-none max-w-[220px] sm:max-w-xs">
          <p className="text-[11px] sm:text-xs text-white/60 font-medium tracking-wide">
            Now Playing
          </p>
          <p className="text-xs sm:text-sm font-bold text-white/95 truncate mt-0.5">
            {track.album ? `${track.album}` : `${track.title} Mix`}
          </p>
        </div>

        {/* Top Right Quick Share */}
        <button
          onClick={onShareTrack}
          className="p-2 -mr-2 text-white/70 hover:text-white transition-all cursor-pointer active:scale-95"
          title="Share song"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN BODY: Large Artwork, Track Details, Scrubber & Controls  */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 max-w-md mx-auto w-full space-y-5 sm:space-y-6 py-2">
        {/* Large Square Album Artwork */}
        <div className="w-full max-w-[310px] sm:max-w-[340px] md:max-w-[360px] aspect-square mx-auto">
          <AmbientArtGlow
            coverUrl={track.coverUrl}
            accentColor={primaryAccent}
            isPlaying={isPlaying}
            glowIntensity="immersive"
          >
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-black/95 border border-white/10 select-none bg-black/40">
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </AmbientArtGlow>
        </div>

        {/* Track Title, Artist & Squircle Action Buttons (Download + Like) */}
        <div className="flex items-center justify-between w-full max-w-[310px] sm:max-w-[340px] md:max-w-[360px] pt-1">
          {/* Song and Artist Info */}
          <div className="min-w-0 flex-1 pr-3">
            <h1 className="text-2xl sm:text-[28px] font-black text-white tracking-tight leading-tight truncate">
              {track.title}
            </h1>
            <p className="text-sm sm:text-base font-normal text-white/60 truncate mt-0.5">
              {track.artist}
            </p>
          </div>

          {/* Squircle Action Buttons matching screenshot */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* 1. Download Button (White Squircle with Download Icon) */}
            {onDownloadTrack && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadTrack();
                }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
                  isDownloaded
                    ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                    : isDownloading
                    ? 'bg-white text-black animate-pulse'
                    : 'bg-white text-black hover:bg-slate-200'
                }`}
                title={isDownloaded ? 'Downloaded Offline' : 'Download Song'}
              >
                {isDownloading ? (
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : isDownloaded ? (
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Download className="w-5 h-5 stroke-[2.5]" />
                )}
              </button>
            )}

            {/* 2. Heart / Like Button (White Squircle with Heart Icon) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike();
              }}
              className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center hover:bg-slate-200 transition-all cursor-pointer shadow-lg active:scale-95"
              title={isLiked ? 'Unlike song' : 'Like song'}
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked
                    ? 'fill-rose-500 text-rose-500 stroke-rose-500'
                    : 'text-black stroke-[2.5]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* PROGRESS BAR / SCRUBBER & TIMESTAMPS                        */}
        {/* ----------------------------------------------------------- */}
        <div className="w-full max-w-[310px] sm:max-w-[340px] md:max-w-[360px] space-y-1.5">
          <div className="relative group flex items-center py-2 cursor-pointer">
            {/* Gray track background */}
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              {/* White progress fill */}
              <div
                className="h-full bg-white rounded-full transition-[width] duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Pill/capsule thumb at head of progress */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-2.5 bg-white rounded-full shadow-md pointer-events-none -ml-2"
              style={{ left: `${progressPercent}%` }}
            />

            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Timestamps */}
          <div className="flex items-center justify-between text-xs text-white/60 font-medium font-mono px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* CENTRAL TRANSPORT: PREVIOUS, ROTATING PLAY/PAUSE & NEXT    */}
        {/* ----------------------------------------------------------- */}
        <div className="flex items-center justify-center gap-7 sm:gap-9 w-full max-w-[310px] sm:max-w-[340px] md:max-w-[360px] py-1">
          {/* Previous Track: Dark Circular Button with |◀ */}
          <button
            onClick={onPrevious}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
            title="Previous Track"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
              <path d="M6 5v14h2V5H6zm3 7l10 7V5l-10 7z" />
            </svg>
          </button>

          {/* Central Rotating Scalloped Rosette Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className="relative w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center active:scale-95 transition-transform cursor-pointer group"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {/* Rotating 12-lobed Rosette Star Badge */}
            <div
              className={`w-full h-full ${
                isPlaying
                  ? 'animate-[spin_10s_linear_infinite]'
                  : 'transition-transform duration-700'
              }`}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                <path
                  d="M 50.00 3.00 C 54.14 3.00, 55.65 10.10, 60.35 11.36 C 65.05 12.62, 69.91 7.23, 73.50 9.30 C 77.09 11.37, 74.84 18.28, 78.28 21.72 C 81.72 25.16, 88.63 22.91, 90.70 26.50 C 92.77 30.09, 87.38 34.95, 88.64 39.65 C 89.90 44.35, 97.00 45.86, 97.00 50.00 C 97.00 54.14, 89.90 55.65, 88.64 60.35 C 87.38 65.05, 92.77 69.91, 90.70 73.50 C 88.63 77.09, 81.72 74.84, 78.28 78.28 C 74.84 81.72, 77.09 88.63, 73.50 90.70 C 69.91 92.77, 65.05 87.38, 60.35 88.64 C 55.65 89.90, 54.14 97.00, 50.00 97.00 C 45.86 97.00, 44.35 89.90, 39.65 88.64 C 34.95 87.38, 30.09 92.77, 26.50 90.70 C 22.91 88.63, 25.16 81.72, 21.72 78.28 C 18.28 74.84, 11.37 77.09, 9.30 73.50 C 7.23 69.91, 12.62 65.05, 11.36 60.35 C 10.10 55.65, 3.00 54.14, 3.00 50.00 C 3.00 45.86, 10.10 44.35, 11.36 39.65 C 12.62 34.95, 7.23 30.09, 9.30 26.50 C 11.37 22.91, 18.28 25.16, 21.72 21.72 C 25.16 18.28, 22.91 11.37, 26.50 9.30 C 30.09 7.23, 34.95 12.62, 39.65 11.36 C 44.35 10.10, 45.86 3.00, 50.00 3.00 Z"
                  fill="white"
                />
              </svg>
            </div>

            {/* Black Pause / Play Icon in Center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {isPlaying ? (
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-black">
                  <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-black ml-1">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
          </button>

          {/* Next Track: Dark Circular Button with ▶| */}
          <button
            onClick={onNext}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
            title="Next Track"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
              <path d="M5 5v14l10-7-10-7zm11 0v14h2V5h-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM UTILITIES ROW: Queue, Sleep, EQ, Shuffle, Repeat, More */}
      {/* ------------------------------------------------------------- */}
      <footer className="w-full max-w-md mx-auto px-6 sm:px-10 pb-6 pt-1 z-20">
        <div className="flex items-center justify-between w-full max-w-[310px] sm:max-w-[340px] md:max-w-[360px] mx-auto">
          {/* 1. Queue / Lyrics Toggle Button */}
          <button
            onClick={() => setShowLyricsDrawer(!showLyricsDrawer)}
            className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              showLyricsDrawer
                ? 'bg-white/25 border-white text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
            }`}
            title="Lyrics & Lyrics Synchronizer"
          >
            <ListMusic className="w-5 h-5 stroke-[2]" />
          </button>

          {/* 2. Sleep Timer Button */}
          <button
            onClick={() => setShowSleepTimerModal(true)}
            className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 relative ${
              sleepTimerMinutes !== null
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
            }`}
            title={
              sleepTimerMinutes
                ? `Sleep Timer: ${Math.ceil((sleepTimerRemainingSec || 0) / 60)}m left`
                : 'Set Sleep Timer'
            }
          >
            <Moon className="w-5 h-5 stroke-[2]" />
            {sleepTimerMinutes !== null && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {/* 3. Audio Equalizer Button */}
          <button
            onClick={() => {
              if (onOpenEqualizer) onOpenEqualizer();
            }}
            className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer active:scale-95"
            title="Studio Equalizer & DSP"
          >
            <Sliders className="w-5 h-5 stroke-[2]" />
          </button>

          {/* 4. Shuffle Button */}
          <button
            onClick={onToggleShuffle}
            className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              isShuffle
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
            }`}
            title={isShuffle ? 'Shuffle: On' : 'Shuffle: Off'}
          >
            <Shuffle className="w-5 h-5 stroke-[2]" />
          </button>

          {/* 5. Repeat Button */}
          <button
            onClick={onToggleRepeat}
            className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              isRepeat
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
            }`}
            title={isRepeat ? 'Repeat: On' : 'Repeat: Off'}
          >
            <Repeat className="w-5 h-5 stroke-[2]" />
          </button>

          {/* 6. More Options Button (White Circle Button with 3 Dots) */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:bg-slate-200 transition-all cursor-pointer shadow-lg active:scale-95"
            title="More Options"
          >
            <MoreVertical className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* OVERLAY 1: LIVE SYNCHRONIZED KARAOKE LYRICS DRAWER            */}
      {/* ------------------------------------------------------------- */}
      {showLyricsDrawer && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-2xl flex flex-col justify-end animate-fadeIn">
          <div className="w-full max-w-xl mx-auto h-[78vh] bg-[#140e16]/95 border-t border-white/15 rounded-t-[32px] flex flex-col shadow-2xl overflow-hidden">
            {/* Lyrics Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Live Synced Lyrics</h3>
              </div>
              <button
                onClick={() => setShowLyricsDrawer(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lyrics Scrollable Body */}
            <div
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto px-6 py-8 space-y-5 text-center scrollbar-none"
            >
              {track.lyrics && track.lyrics.length > 0 ? (
                track.lyrics.map((line, idx) => {
                  const isActive = currentLyricIdx === idx;
                  const isPast = currentLyricIdx > idx;

                  return (
                    <div
                      key={idx}
                      data-lyric-idx={idx}
                      onClick={() => onSeek(line.time)}
                      className={`cursor-pointer transition-all duration-300 py-2.5 px-4 rounded-2xl ${
                        isActive
                          ? 'bg-white/10 text-white font-extrabold text-xl sm:text-2xl scale-105'
                          : isPast
                          ? 'text-white/60 font-semibold text-base sm:text-lg'
                          : 'text-white/30 font-medium text-sm sm:text-base hover:text-white/70'
                      }`}
                    >
                      <p>{line.text}</p>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                  <Music className="w-8 h-8 text-slate-500" />
                  <p className="text-sm">Instrumental or synchronized lyrics not available for this song.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* OVERLAY 2: SLEEP TIMER MODAL                                  */}
      {/* ------------------------------------------------------------- */}
      {showSleepTimerModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#181119] border border-white/15 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Moon className="w-5 h-5 text-amber-400" />
                <span>Sleep Timer</span>
              </div>
              <button
                onClick={() => setShowSleepTimerModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Music will automatically pause when the selected duration expires.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSleepTimer(mins)}
                  className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    sleepTimerMinutes === mins
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                >
                  <span>{mins} minutes</span>
                  {sleepTimerMinutes === mins && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
              ))}
            </div>

            {sleepTimerMinutes !== null && (
              <button
                onClick={() => setSleepTimer(null)}
                className="w-full py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel Active Timer ({Math.ceil((sleepTimerRemainingSec || 0) / 60)}m left)
              </button>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* OVERLAY 3: MORE OPTIONS MODAL (•••)                           */}
      {/* ------------------------------------------------------------- */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#181119] border border-white/15 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="min-w-0 flex-1 pr-2">
                <h4 className="text-sm font-bold text-white truncate">{track.title}</h4>
                <p className="text-xs text-slate-400 truncate">{track.artist}</p>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onShareTrack();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Share Song & Link</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  setShowLyricsDrawer(true);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>View Full Synced Lyrics</span>
              </button>

              {onOpenEqualizer && (
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenEqualizer();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Equalizer & Acoustic DSP</span>
                </button>
              )}

              {onDownloadTrack && (
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onDownloadTrack();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>{isDownloaded ? 'Downloaded in Offline Vault' : 'Download for Offline Mode'}</span>
                </button>
              )}
            </div>

            {/* Audio Specs Summary */}
            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
              <div className="p-2 rounded-lg bg-white/5">
                <span className="text-slate-500 block text-[9px] uppercase">Audio Bitrate</span>
                <span className="text-white font-bold">320 kbps High-Res</span>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <span className="text-slate-500 block text-[9px] uppercase">Tempo & Key</span>
                <span className="text-white font-bold">{track.bpm} BPM · {track.key}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
