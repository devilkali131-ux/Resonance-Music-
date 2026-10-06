import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Share2,
  ListMusic,
} from 'lucide-react';
import { Playlist, Track } from '../types/music';

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered?: number;
  isShuffle?: boolean;
  isRepeat?: boolean;
  volume?: number;
  isMuted?: boolean;
  isLiked?: boolean;
  isDownloaded?: boolean;
  isDownloading?: boolean;
  isSynthesizedFallback?: boolean;
  playingPlaylist?: Playlist | null;
  onOpenPlayingPlaylist?: (playlist: Playlist) => void;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleShuffle?: () => void;
  onToggleRepeat?: () => void;
  onSeek: (time: number) => void;
  onVolumeChange?: (vol: number) => void;
  onToggleMute?: () => void;
  onToggleLike?: () => void;
  onDownloadTrack?: () => void;
  onShareTrack?: () => void;
  onToggleLyrics?: () => void;
  onToggleQueue?: () => void;
  onOpenEqualizer?: () => void;
  onExpandImmersive: () => void;
  isLyricsOpen?: boolean;
  isQueueOpen?: boolean;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  buffered = 0,
  playingPlaylist,
  onOpenPlayingPlaylist,
  onTogglePlay,
  onPrevious,
  onNext,
  onSeek,
  onShareTrack,
  onExpandImmersive,
}) => {
  if (!currentTrack) {
    return null;
  }

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="fixed bottom-16 sm:bottom-18 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.25rem)] sm:w-[calc(100%-2rem)] max-w-xl select-none animate-fadeIn transition-all">
      {/* Floating Capsule Player Container matching user's screenshot */}
      <div className="relative rounded-full bg-[#141622]/95 border border-white/[0.14] backdrop-blur-2xl shadow-2xl shadow-black/95 px-3 py-2 flex items-center justify-between gap-3 overflow-hidden group">
        
        {/* Subtle Progress Bar along top edge of capsule */}
        <div className="absolute top-0 inset-x-6 h-[2.5px] bg-white/[0.08] overflow-hidden rounded-full">
          {/* Buffered track fill */}
          {buffered > 0 && (
            <div
              className="absolute top-0 bottom-0 left-0 bg-white/15 transition-all"
              style={{ width: `${Math.min(100, buffered)}%` }}
            />
          )}
          {/* Playback progress gradient */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-500 rounded-full transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Hidden Top Scrubber input for scrubbing */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="absolute top-0 inset-x-0 w-full h-3 opacity-0 cursor-pointer z-10"
          title="Seek playback"
        />

        {/* Left Side: Circular Rotating Disc Cover & Track Name */}
        <div
          onClick={onExpandImmersive}
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group/info"
        >
          {/* Circular Vinyl Disc Cover Art with continuous rotation animation */}
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20 shadow-lg shadow-black/60 flex-shrink-0 bg-black/60">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''
              }`}
            />
            {/* Center vinyl spindle / center hole ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#141622] border-2 border-white/70 shadow-inner pointer-events-none" />
            
            {/* Playing pulse indicator dot */}
            {isPlaying && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#141622] animate-pulse" />
            )}
          </div>

          {/* Music Title and Artist */}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover/info:text-cyan-300 transition-colors leading-tight">
              {currentTrack.title}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[11px] text-slate-400 truncate">
                {currentTrack.artist}
              </p>
              {playingPlaylist && (
                <span className="hidden xs:inline-block text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/20 truncate max-w-[90px]">
                  {playingPlaylist.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Basic Action Controls (Playlist if active, Previous, Animated Play/Pause, Next, Share) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Playlist Button if playing from a playlist */}
          {playingPlaylist && onOpenPlayingPlaylist && (
            <button
              onClick={() => onOpenPlayingPlaylist(playingPlaylist)}
              className="p-2 text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-full transition-all active:scale-90 cursor-pointer"
              title={`Playing from playlist: ${playingPlaylist.name}`}
            >
              <ListMusic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* 1. Previous Track */}
          <button
            onClick={onPrevious}
            className="p-2 text-slate-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
            title="Previous Track"
          >
            <SkipBack className="w-4 h-4 fill-current sm:w-5 sm:h-5" />
          </button>

          {/* 2. Large Circular Play / Pause Button with Smooth Animation */}
          <button
            onClick={onTogglePlay}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 active:scale-90 transition-all cursor-pointer relative overflow-hidden ${
              isPlaying
                ? 'shadow-lg shadow-white/30 ring-2 ring-white/60'
                : 'shadow-lg shadow-white/10'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <span
              className={`transition-all duration-300 transform flex items-center justify-center ${
                isPlaying ? 'scale-100 rotate-0' : 'scale-110 rotate-180 ml-0.5'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current text-black stroke-black transition-all" />
              ) : (
                <Play className="w-5 h-5 fill-current text-black stroke-black transition-all" />
              )}
            </span>
          </button>

          {/* 3. Next Track */}
          <button
            onClick={onNext}
            className="p-2 text-slate-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4 fill-current sm:w-5 sm:h-5" />
          </button>

          {/* 4. Share Button */}
          {onShareTrack && (
            <button
              onClick={onShareTrack}
              className="p-2 text-slate-300 hover:text-cyan-300 active:scale-90 transition-transform cursor-pointer"
              title="Share Track"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
