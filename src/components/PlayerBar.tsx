import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Heart,
  Download,
  CheckCircle2,
  Maximize2,
  FileText,
  ListMusic,
  Radio,
  Sliders,
  Share2,
} from 'lucide-react';
import { Track } from '../types/music';
import { RealtimeVisualizer } from './RealtimeVisualizer';
import { AmbientArtGlow } from './AmbientArtGlow';

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  isShuffle: boolean;
  isRepeat: boolean;
  volume: number;
  isMuted: boolean;
  isLiked: boolean;
  isDownloaded: boolean;
  isDownloading: boolean;
  isSynthesizedFallback?: boolean;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleLike: () => void;
  onDownloadTrack: () => void;
  onShareTrack?: () => void;
  onToggleLyrics: () => void;
  onToggleQueue: () => void;
  onOpenEqualizer?: () => void;
  onExpandImmersive: () => void;
  isLyricsOpen: boolean;
  isQueueOpen: boolean;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  buffered,
  isShuffle,
  isRepeat,
  volume,
  isMuted,
  isLiked,
  isDownloaded,
  isDownloading,
  isSynthesizedFallback,
  onTogglePlay,
  onPrevious,
  onNext,
  onToggleShuffle,
  onToggleRepeat,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleLike,
  onDownloadTrack,
  onShareTrack,
  onToggleLyrics,
  onToggleQueue,
  onOpenEqualizer,
  onExpandImmersive,
  isLyricsOpen,
  isQueueOpen,
}) => {
  if (!currentTrack) {
    return (
      <footer className="fixed bottom-0 left-0 right-0 h-16 md:h-20 bg-[#090a0f]/95 border-t border-white/[0.06] backdrop-blur-2xl flex items-center justify-center text-slate-400 text-xs md:text-sm select-none z-30">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Select any track to start listening</span>
        </div>
      </footer>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#090a0f]/95 border-t border-white/[0.08] backdrop-blur-2xl select-none z-30 shadow-2xl shadow-black/80">
      {/* Edge-to-edge Top Progress Scrubber (Touch & Desktop friendly) */}
      <div className="relative w-full h-1 bg-white/[0.08] group cursor-pointer">
        {/* Buffered progress */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-white/[0.15] transition-all"
          style={{ width: `${buffered}%` }}
        />
        {/* Playback progress */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 transition-all shadow-[0_0_8px_rgba(0,240,255,0.6)]"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Interactive Scrub input */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="absolute -top-1.5 bottom-0 inset-x-0 w-full h-4 opacity-0 cursor-pointer z-10"
        />
      </div>

      {/* ========================================================= */}
      {/* MOBILE VIEW (< md / 768px): Compact & Touch Optimized    */}
      {/* ========================================================= */}
      <div className="flex md:hidden items-center justify-between px-3 py-2 gap-2 h-16">
        {/* Track thumbnail with dynamic ambient glow & info */}
        <div
          onClick={onExpandImmersive}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
        >
          <AmbientArtGlow
            coverUrl={currentTrack.coverUrl}
            accentColor={currentTrack.accentColor}
            isPlaying={isPlaying}
            glowIntensity="subtle"
            className="flex-shrink-0"
          >
            <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-white/[0.08]">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                </div>
              )}
            </div>
          </AmbientArtGlow>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-white truncate leading-tight">
              {currentTrack.title}
            </h4>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Real-time Frequency Visualizer on Mobile! */}
        <div className="w-16 sm:w-20 h-7 flex-shrink-0 px-1">
          <RealtimeVisualizer
            isPlaying={isPlaying}
            accentColor={currentTrack.accentColor || '#00f0ff'}
            height={26}
            interactive={true}
          />
        </div>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <button
            onClick={onToggleLike}
            className="p-1.5 text-slate-400 hover:text-pink-400 transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`}
            />
          </button>

          {/* Download Music Button (Mobile) */}
          <button
            onClick={onDownloadTrack}
            disabled={isDownloading}
            title={
              isDownloaded
                ? 'Saved in Downloaded Music'
                : isDownloading
                ? 'Downloading song...'
                : 'Download Music'
            }
            className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            {isDownloaded ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download
                className={`w-4 h-4 ${isDownloading ? 'animate-bounce text-cyan-400' : ''}`}
              />
            )}
          </button>

          {/* Equalizer Pop-up Button (Mobile) */}
          {onOpenEqualizer && (
            <button
              onClick={onOpenEqualizer}
              title="Audio Equalizer (Pop-up)"
              className="p-1.5 text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onTogglePlay}
            className="w-9 h-9 rounded-full bg-white text-slate-950 flex items-center justify-center active:scale-90 transition-transform shadow-md shadow-white/20"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-1.5 text-slate-300 hover:text-white transition-colors"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          {onShareTrack && (
            <button
              onClick={onShareTrack}
              title="Share Track"
              className="p-1.5 text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onExpandImmersive}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* DESKTOP VIEW (>= md / 768px): Full Studio Controls       */}
      {/* ========================================================= */}
      <div className="hidden md:flex items-center justify-between px-6 h-20 gap-4">
        {/* Track Info (Left) */}
        <div className="flex items-center gap-3.5 w-1/4 min-w-[200px]">
          <AmbientArtGlow
            coverUrl={currentTrack.coverUrl}
            accentColor={currentTrack.accentColor}
            isPlaying={isPlaying}
            glowIntensity="medium"
            className="flex-shrink-0"
          >
            <div
              onClick={onExpandImmersive}
              className="relative w-13 h-13 rounded-xl overflow-hidden cursor-pointer group flex-shrink-0 shadow-lg shadow-black/60 border border-white/[0.08]"
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </AmbientArtGlow>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4
                onClick={onExpandImmersive}
                className="text-sm font-semibold text-white truncate cursor-pointer hover:text-cyan-300 transition-colors"
              >
                {currentTrack.title}
              </h4>
              {isSynthesizedFallback && (
                <span
                  title="Procedural Web Audio Engine active"
                  className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300"
                >
                  Synth
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">{currentTrack.artist}</p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
              <span>{currentTrack.genre}</span>
              <span aria-hidden="true">·</span>
              <span>{currentTrack.bpm} BPM</span>
            </div>
          </div>

          {/* Favorite & Download Icons */}
          <div className="flex items-center gap-1 ml-1.5">
            <button
              onClick={onToggleLike}
              title={isLiked ? 'Remove from Liked' : 'Add to Liked'}
              className="p-1.5 text-slate-400 hover:text-pink-400 transition-colors"
            >
              <Heart
                className={`w-4 h-4 transition-transform active:scale-125 ${
                  isLiked ? 'fill-pink-500 text-pink-500' : ''
                }`}
              />
            </button>
            <button
              onClick={onDownloadTrack}
              disabled={isDownloading}
              title={
                isDownloaded
                  ? 'Saved in Offline Vault'
                  : isDownloading
                  ? 'Downloading...'
                  : 'Download for Offline Playback'
              }
              className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              {isDownloaded ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Download
                  className={`w-4 h-4 ${isDownloading ? 'animate-bounce text-cyan-400' : ''}`}
                />
              )}
            </button>
          </div>
        </div>

        {/* Main Transport & Timeline (Center) */}
        <div className="flex flex-col items-center flex-1 max-w-xl px-2">
          {/* Playback Controls */}
          <div className="flex items-center gap-5 mb-1">
            <button
              onClick={onToggleShuffle}
              title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
              className={`p-1.5 rounded-lg transition-colors ${
                isShuffle ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={onPrevious}
              title="Previous Track"
              className="p-1.5 text-slate-300 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 rounded-full bg-white text-black hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-lg shadow-white/20"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              title="Next Track"
              className="p-1.5 text-slate-300 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={onToggleRepeat}
              title={isRepeat ? 'Repeat On' : 'Repeat Off'}
              className={`p-1.5 rounded-lg transition-colors ${
                isRepeat ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Timeline Timestamps */}
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Real-time Visualizer & Audio Utilities (Right) */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[220px]">
          {/* Audio-reactive Realtime Visualizer Component */}
          <div className="w-24 sm:w-28 h-8 px-1">
            <RealtimeVisualizer
              isPlaying={isPlaying}
              accentColor={currentTrack.accentColor || '#00f0ff'}
              height={30}
              interactive={true}
            />
          </div>

          {/* Audio Equalizer Pop-up Button */}
          {onOpenEqualizer && (
            <button
              onClick={onOpenEqualizer}
              title="Audio Equalizer (Pop-up)"
              className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}

          {/* Lyrics Button */}
          <button
            onClick={onToggleLyrics}
            title="Synchronized Lyrics"
            className={`p-2 rounded-lg transition-colors ${
              isLyricsOpen
                ? 'text-cyan-400 bg-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Queue Button */}
          <button
            onClick={onToggleQueue}
            title="Play Queue"
            className={`p-2 rounded-lg transition-colors ${
              isQueueOpen
                ? 'text-purple-400 bg-purple-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Volume Slider */}
          <div className="flex items-center gap-1.5 group">
            <button
              onClick={onToggleMute}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-16 h-1 bg-white/[0.1] rounded-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Share Button (Desktop) */}
          {onShareTrack && (
            <button
              onClick={onShareTrack}
              title="Share Track"
              className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-white/[0.04] rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen Expand Button */}
          <button
            onClick={onExpandImmersive}
            title="Expand Immersive View"
            className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
