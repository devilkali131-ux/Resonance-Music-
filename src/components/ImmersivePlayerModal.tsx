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
import { EqualizerState, Playlist, Track } from '../types/music';
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
  sleepTimerRemainingSec?: number | null;
  sleepTimerMinutes?: number | null;
  onSetSleepTimer?: (minutes: number | null) => void;
  onAddToPlaylist?: () => void;
  activePlaylist?: Playlist | null;
  onOpenPlaylist?: (playlist: Playlist) => void;
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
  sleepTimerRemainingSec: propSleepSec,
  sleepTimerMinutes: propSleepMinutes,
  onSetSleepTimer,
  onAddToPlaylist,
  activePlaylist,
  onOpenPlaylist,
}) => {
  const [ambientPalette, setAmbientPalette] = useState<TrackPalette | null>(null);
  const [showLyricsDrawer, setShowLyricsDrawer] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [customTimerMinutes, setCustomTimerMinutes] = useState('20');
  const [localSleepTimerMinutes, setLocalSleepTimerMinutes] = useState<number | null>(null);
  const [localSleepTimerRemainingSec, setLocalSleepTimerRemainingSec] = useState<number | null>(null);

  const activeSleepMinutes = propSleepMinutes !== undefined ? propSleepMinutes : localSleepTimerMinutes;
  const activeSleepSec = propSleepSec !== undefined ? propSleepSec : localSleepTimerRemainingSec;

  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Touch swipe gesture handlers for swiping between tracks
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - (touchStartY.current ?? e.changedTouches[0].clientY);

    // If horizontal swipe is dominant and exceeds 45px threshold
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 45) {
      if (deltaX < 0) {
        onNext(); // swipe left -> next track
      } else {
        onPrevious(); // swipe right -> previous track
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Dynamic animation generator per track cover
  const getTrackCoverAnimation = useCallback((t: Track, playing: boolean) => {
    if (!playing) return 'scale-100 transition-transform duration-700';
    const sum = t.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const mode = (sum + (t.genre ? t.genre.charCodeAt(0) : 0)) % 6;
    switch (mode) {
      case 0:
        return 'animate-[pulse_2.5s_ease-in-out_infinite] scale-[1.03] shadow-[0_0_50px_rgba(236,72,153,0.5)]';
      case 1:
        return 'animate-[spin_24s_linear_infinite] rounded-full scale-[1.02] shadow-[0_0_50px_rgba(6,182,212,0.5)]';
      case 2:
        return 'animate-[bounce_3.5s_ease-in-out_infinite] scale-[1.02] shadow-[0_0_50px_rgba(168,85,247,0.5)]';
      case 3:
        return 'scale-[1.04] animate-pulse transition-transform duration-1000 shadow-[0_0_55px_rgba(245,158,11,0.5)]';
      case 4:
        return 'rotate-[-1deg] scale-[1.02] transition-transform duration-500 shadow-[0_0_50px_rgba(16,185,129,0.5)]';
      case 5:
      default:
        return 'scale-[1.03] transition-all duration-700 shadow-[0_0_60px_rgba(99,102,241,0.6)]';
    }
  }, []);

  // Extract atmospheric palette from track artwork
  useEffect(() => {
    if (track) {
      extractDominantPalette(track.coverUrl, track.accentColor).then((p) => {
        setAmbientPalette(p);
      });
    }
  }, [track]);

  // Handle local sleep timer countdown if not provided by parent
  useEffect(() => {
    if (onSetSleepTimer) return; // parent handles it
    if (localSleepTimerRemainingSec === null) return;
    if (localSleepTimerRemainingSec <= 0) {
      if (isPlaying) {
        onTogglePlay();
      }
      setLocalSleepTimerMinutes(null);
      setLocalSleepTimerRemainingSec(null);
      return;
    }

    const interval = setInterval(() => {
      setLocalSleepTimerRemainingSec((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [localSleepTimerRemainingSec, isPlaying, onTogglePlay, onSetSleepTimer]);

  const setSleepTimer = (minutes: number | null) => {
    if (onSetSleepTimer) {
      onSetSleepTimer(minutes);
    } else {
      setLocalSleepTimerMinutes(minutes);
      setLocalSleepTimerRemainingSec(minutes === null ? null : minutes * 60);
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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
      {/* TOP HEADER: Centered "Now Playing" or Active Playlist Button  */}
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

        {/* Centered Track / Playlist Context Button */}
        {activePlaylist ? (
          <button
            onClick={() => {
              onClose();
              if (onOpenPlaylist) onOpenPlaylist(activePlaylist);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer shadow-lg active:scale-95"
            title={`Playing from ${activePlaylist.name} - Tap to view playlist`}
          >
            <ListMusic className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[130px] sm:max-w-[170px]">{activePlaylist.name}</span>
          </button>
        ) : (
          <div className="text-center absolute left-1/2 -translate-x-1/2 pointer-events-none max-w-[220px] sm:max-w-xs">
            <p className="text-[11px] sm:text-xs text-white/60 font-medium tracking-wide">
              Now Playing
            </p>
            <p className="text-xs sm:text-sm font-bold text-white/95 truncate mt-0.5">
              {track.album ? `${track.album}` : `${track.title} Mix`}
            </p>
          </div>
        )}

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
        {/* Large Square Album Artwork with Click-to-Show Lyrics and Distinct Animation */}
        <div className="w-full max-w-[310px] sm:max-w-[340px] md:max-w-[360px] aspect-square mx-auto">
          <AmbientArtGlow
            coverUrl={track.coverUrl}
            accentColor={primaryAccent}
            isPlaying={isPlaying}
            glowIntensity="immersive"
          >
            <div
              onClick={() => setShowLyricsDrawer(true)}
              className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-black/95 border border-white/10 select-none bg-black/40 cursor-pointer group"
              title="Tap artwork to view synchronized karaoke lyrics"
            >
              <img
                src={track.coverUrl}
                alt={track.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${getTrackCoverAnimation(
                  track,
                  isPlaying
                )}`}
              />
              {/* Tap to show lyrics overlay badge */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-xs font-semibold text-white border border-white/20 flex items-center gap-1.5 shadow-xl">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" /> Tap for Lyrics
                </span>
              </div>
            </div>
          </AmbientArtGlow>
        </div>

        {/* Track Title, Artist & Squircle Action Buttons (Download + Like + Lyrics) */}
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

          {/* Squircle Action Buttons: Download + Like + Lyrics */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* 1. Download Button (White Squircle with Download Icon) */}
            {onDownloadTrack && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadTrack();
                }}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
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

            {/* 2. Lyrics Button (White Squircle with FileText / Lyrics Icon) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLyricsDrawer(!showLyricsDrawer);
              }}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
                showLyricsDrawer
                  ? 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
                  : 'bg-white text-black hover:bg-slate-200'
              }`}
              title="Toggle Synced Lyrics"
            >
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* 3. Heart / Like Button (White Squircle with Heart Icon) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike();
              }}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white text-black flex items-center justify-center hover:bg-slate-200 transition-all cursor-pointer shadow-lg active:scale-95"
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
              activeSleepMinutes !== null
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
            }`}
            title={
              activeSleepMinutes
                ? `Sleep Timer: ${Math.ceil((activeSleepSec || 0) / 60)}m left`
                : 'Set Sleep Timer'
            }
          >
            <Moon className="w-5 h-5 stroke-[2]" />
            {activeSleepMinutes !== null && (
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
      {/* OVERLAY 2: SLEEP TIMER MODAL (Presets + User Custom Timer)    */}
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
              Schedule music to fade out smoothly and pause after a set duration.
            </p>

            {/* Presets: 15, 30, 45, 60 minutes */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSleepTimer(mins)}
                  className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    activeSleepMinutes === mins
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                >
                  <span>{mins} minutes</span>
                  {activeSleepMinutes === mins && <Check className="w-4 h-4 stroke-[3]" />}
                </button>
              ))}
            </div>

            {/* User Custom Timer Input */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-xs font-semibold text-white/90">User Custom Timer</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="360"
                  value={customTimerMinutes}
                  onChange={(e) => setCustomTimerMinutes(e.target.value)}
                  placeholder="Minutes"
                  className="w-24 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
                <span className="text-xs text-slate-400 font-medium">mins</span>
                <button
                  onClick={() => {
                    const m = parseInt(customTimerMinutes, 10);
                    if (!isNaN(m) && m > 0) {
                      setSleepTimer(m);
                    }
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Set Custom Timer
                </button>
              </div>
            </div>

            {/* Active Timer Indicator & Cancel Button */}
            {activeSleepMinutes !== null && (
              <div className="space-y-2 pt-1 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-amber-300 font-mono">
                  <span>Active Timer:</span>
                  <span>
                    {Math.floor((activeSleepSec || 0) / 60)}m {((activeSleepSec || 0) % 60)}s remaining
                  </span>
                </div>
                {activeSleepSec !== null && activeSleepSec <= 20 && (
                  <p className="text-[11px] text-amber-400/80 italic text-center animate-pulse">
                    Fading out volume smoothly...
                  </p>
                )}
                <button
                  onClick={() => setSleepTimer(null)}
                  className="w-full py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel Timer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* OVERLAY 3: MORE OPTIONS MODAL (•••) - Streamlined & Clean     */}
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

            <div className="space-y-2">
              {onAddToPlaylist && (
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onAddToPlaylist();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  <ListMusic className="w-4 h-4 text-cyan-400" />
                  <span>Add to Custom Playlist</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  setShowSleepTimerModal(true);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <Moon className="w-4 h-4 text-amber-400" />
                <span>Set Sleep Timer</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onShareTrack();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-pink-400" />
                <span>Share Song</span>
              </button>
            </div>

            {/* Song Meta Information */}
            <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Album</span>
                <span className="text-white font-medium truncate max-w-[180px]">{track.album || track.title}</span>
              </div>
              <div className="flex justify-between">
                <span>Genre</span>
                <span className="text-white font-medium">{track.genre}</span>
              </div>
              <div className="flex justify-between">
                <span>Release</span>
                <span className="text-white font-medium">{track.releaseYear || '2024'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
