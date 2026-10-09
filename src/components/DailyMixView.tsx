import React, { useState, useMemo } from 'react';
import {
  Play,
  Flame,
  Heart,
  Sparkles,
  Music2,
  Clock,
  TrendingUp,
  Volume2,
  ChevronDown,
} from 'lucide-react';
import { Track } from '../types/music';
import { historyStorage } from '../services/historyStorage';
import { AmbientArtGlow } from './AmbientArtGlow';
import { handleImageError } from '../utils/imageFallback';

interface DailyMixViewProps {
  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onPlayAll: (tracks: Track[], shuffle?: boolean) => void;
  onToggleLike: (trackId: string) => void;
  onDownloadTrack?: (track: Track) => void;
  onShareTrack?: (track: Track) => void;
  onOpenLyrics?: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
  isDownloaded?: (trackId: string) => boolean;
  dailyMix?: any;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export const DailyMixView: React.FC<DailyMixViewProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onPlayAll,
  onToggleLike,
  isFavorite,
}) => {
  const [showAllTrending, setShowAllTrending] = useState(false);
  const [showAllMostListened, setShowAllMostListened] = useState(false);
  const [showAllLatest, setShowAllLatest] = useState(false);

  // 1. Top Music: Chart-topping #1 global hit
  const topMusicTrack = useMemo(() => {
    return [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0))[0] || tracks[0];
  }, [tracks]);

  // 2. Trending Music: sorted by popularity & plays
  const allTrendingTracks = useMemo(() => {
    return [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0));
  }, [tracks]);

  const displayedTrendingTracks = useMemo(() => {
    return showAllTrending ? allTrendingTracks : allTrendingTracks.slice(0, 3);
  }, [allTrendingTracks, showAllTrending]);

  // 3. Most Listened by You: tracks from user history and top repeat plays
  const allMostListenedTracks = useMemo(() => {
    const history = historyStorage.getHistory();
    if (history.length > 0) {
      const historyTrackIds = new Set(history.map((h) => h.id));
      const matched = tracks.filter((t) => historyTrackIds.has(t.id));
      if (matched.length > 0) {
        return matched;
      }
    }
    // Fallback: top played tracks
    return [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0));
  }, [tracks]);

  const displayedMostListenedTracks = useMemo(() => {
    return showAllMostListened ? allMostListenedTracks : allMostListenedTracks.slice(0, 6);
  }, [allMostListenedTracks, showAllMostListened]);

  // 4. Latest Music / New Releases: newest tracks in catalog
  const allLatestTracks = useMemo(() => {
    return [...tracks].sort((a, b) => (b.releaseYear || 2024) - (a.releaseYear || 2024));
  }, [tracks]);

  const displayedLatestTracks = useMemo(() => {
    return showAllLatest ? allLatestTracks : allLatestTracks.slice(0, 4);
  }, [allLatestTracks, showAllLatest]);

  return (
    <div className="space-y-8 sm:space-y-10 pb-40 animate-fadeIn select-none">
      {/* ============================================================== */}
      {/* 1. TOP MUSIC: #1 GLOBAL HIT SHOWCASE WIDGET                     */}
      {/* ============================================================== */}
      {topMusicTrack && (
        <section className="relative overflow-hidden rounded-3xl border border-amber-500/40 p-5 sm:p-7 bg-gradient-to-r from-amber-950/40 via-[#0e1222]/90 to-purple-950/40 shadow-2xl group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
              <AmbientArtGlow
                coverUrl={topMusicTrack.coverUrl}
                accentColor={topMusicTrack.accentColor || '#f59e0b'}
                isPlaying={currentTrackId === topMusicTrack.id && isPlaying}
                glowIntensity="high"
                className="flex-shrink-0"
              >
                <div
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-2xl border border-white/20 flex-shrink-0 cursor-pointer"
                  onClick={() => onPlayTrack(topMusicTrack)}
                >
                  <img
                    src={topMusicTrack.coverUrl}
                    alt={topMusicTrack.title}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white fill-current ml-0.5" />
                  </div>
                </div>
              </AmbientArtGlow>

              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Flame className="w-3 h-3 fill-slate-950" /> #1 Top Music
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/20">
                    Most Streamed Globally
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                  {topMusicTrack.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium truncate">
                  {topMusicTrack.artist} · {topMusicTrack.genre}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-mono">{(topMusicTrack.plays || 240000).toLocaleString()} plays</span>
                  <span>•</span>
                  <span>Studio Master audio</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={() => onPlayTrack(topMusicTrack)}
                className="py-3 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play #1 Top Music</span>
              </button>
              <button
                onClick={() => onToggleLike(topMusicTrack.id)}
                className="p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 transition-all cursor-pointer"
                title="Like Song"
              >
                <Heart className={`w-4 h-4 ${isFavorite(topMusicTrack.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 2. TRENDING MUSIC WIDGET                                       */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Trending Music
              </h3>
              <p className="text-[11px] text-slate-400">Top chart-topping streams & viral global tracks</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllTrending(!showAllTrending)}
              className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-amber-300 border border-amber-400/30 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <span>{showAllTrending ? 'Show Less' : `See All (${allTrendingTracks.length})`}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAllTrending ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => onPlayAll(displayedTrendingTracks)}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-200 border border-white/[0.1] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Play All</span>
            </button>
          </div>
        </div>

        {/* Trending Music Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayedTrendingTracks.map((track, idx) => {
            const isCurrent = currentTrackId === track.id;
            const liked = isFavorite(track.id);

            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className={`flex items-center justify-between p-3 rounded-2xl bg-[#0c0e18]/80 hover:bg-white/[0.06] border border-white/[0.06] transition-all cursor-pointer group shadow-sm ${
                  isCurrent ? 'bg-cyan-500/10 border-cyan-400/40 ring-1 ring-cyan-400/30' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xs font-mono font-black text-slate-500 w-5 text-center">
                    #{idx + 1}
                  </span>
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/[0.1] flex-shrink-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Play className="w-4 h-4 text-cyan-300 fill-current ml-0.5" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4
                      className={`text-sm font-bold truncate ${
                        isCurrent ? 'text-cyan-300' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(track.id);
                    }}
                    title="Like"
                    className="p-1.5 text-slate-400 hover:text-pink-400 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-pink-500 text-pink-500' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. MOST LISTENED BY THE USER WIDGET                            */}
      {/* ============================================================== */}
      <section className="space-y-4 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Most Listened by You
              </h3>
              <p className="text-[11px] text-slate-400">Your most frequent tracks & repeat listening habits</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllMostListened(!showAllMostListened)}
              className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-cyan-300 border border-cyan-400/30 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <span>{showAllMostListened ? 'Show Less' : `See All (${allMostListenedTracks.length})`}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAllMostListened ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => onPlayAll(displayedMostListenedTracks)}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-200 border border-white/[0.1] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Play All</span>
            </button>
          </div>
        </div>

        {/* Most Listened Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {displayedMostListenedTracks.map((track) => {
            const isCurrent = currentTrackId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className={`group p-3 rounded-2xl bg-[#0c0e18]/80 hover:bg-white/[0.06] border border-white/[0.08] transition-all cursor-pointer shadow-md ${
                  isCurrent ? 'ring-2 ring-cyan-400 bg-cyan-500/10' : ''
                }`}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5">
                  <AmbientArtGlow
                    coverUrl={track.coverUrl}
                    accentColor={track.accentColor}
                    isPlaying={isCurrent && isPlaying}
                    glowIntensity="subtle"
                    className="w-full h-full"
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </AmbientArtGlow>
                  
                  <div className="absolute right-2 bottom-2 z-20">
                    <button
                      className={`w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform ${
                        isCurrent && isPlaying
                          ? 'scale-100'
                          : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">{track.title}</h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{track.artist}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. LATEST MUSIC & NEW RELEASES WIDGET                          */}
      {/* ============================================================== */}
      <section className="space-y-4 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Latest Music & New Releases
              </h3>
              <p className="text-[11px] text-slate-400">Fresh additions, new studio albums & latest drops</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllLatest(!showAllLatest)}
              className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-purple-300 border border-purple-400/30 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <span>{showAllLatest ? 'Show Less' : `See All (${allLatestTracks.length})`}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAllLatest ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => onPlayAll(displayedLatestTracks)}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-200 border border-white/[0.1] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Play All</span>
            </button>
          </div>
        </div>

        {/* Latest Music Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {displayedLatestTracks.map((track) => {
            const isCurrent = currentTrackId === track.id;
            const liked = isFavorite(track.id);

            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className={`flex items-center justify-between p-3 rounded-2xl bg-[#0c0e18]/70 hover:bg-white/[0.06] border border-white/[0.06] transition-all cursor-pointer group shadow-sm ${
                  isCurrent ? 'bg-cyan-500/10 border-cyan-400/40 ring-1 ring-cyan-400/30' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/[0.1] flex-shrink-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div
                      className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                        isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 text-cyan-300 fill-current ml-0.5" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isCurrent ? 'text-cyan-300' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                    {track.releaseYear || 'NEW'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(track.id);
                    }}
                    title="Like"
                    className="p-1.5 text-slate-400 hover:text-pink-400 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-pink-500 text-pink-500' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
