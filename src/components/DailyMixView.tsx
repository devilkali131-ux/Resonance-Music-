import React, { useState, useMemo } from 'react';
import {
  Play,
  Flame,
  Heart,
  FileText,
  Sparkles,
  Music,
  Download,
  CheckCircle2,
  Clock,
  Radio,
} from 'lucide-react';
import { Track } from '../types/music';
import { historyStorage, UserProfile } from '../services/historyStorage';
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

const MOOD_FILTERS = [
  'All',
  'Workout',
  'Feel good',
  'Energize',
  'Romance',
  'Relax',
  'Party',
  'Focus',
];

export const DailyMixView: React.FC<DailyMixViewProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onPlayAll,
  onToggleLike,
  onDownloadTrack,
  onOpenLyrics,
  isFavorite,
  isDownloaded = () => false,
}) => {
  const [selectedMood, setSelectedMood] = useState('All');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'hindi' | 'english'>('all');
  const [profile] = useState<UserProfile>(historyStorage.getUserProfile());

  // 1. Trending Music: sorted by popularity & plays
  const trendingTracks = useMemo(() => {
    return [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 10);
  }, [tracks]);

  // 2. Most Listened / Listen Again: tracks from user history and top plays
  const listenAgainTracks = useMemo(() => {
    const history = historyStorage.getHistory();
    if (history.length > 0) {
      const historyTrackIds = new Set(history.map((h) => h.id));
      const matched = tracks.filter((t) => historyTrackIds.has(t.id));
      if (matched.length > 0) {
        return matched.slice(0, 6);
      }
    }
    // Fallback: top played tracks
    return [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 6);
  }, [tracks]);

  // 3. Latest Music / New Releases: newest tracks
  const latestTracks = useMemo(() => {
    return [...tracks]
      .sort((a, b) => (b.releaseYear || 2024) - (a.releaseYear || 2024))
      .slice(0, 8);
  }, [tracks]);

  // Filtered tracks for Quick Picks
  const filteredQuickPicks = useMemo(() => {
    return tracks.filter((t) => {
      const isHindi = t.genre.toLowerCase().includes('hindi') || t.id.startsWith('hindi-');
      const isEnglish = t.genre.toLowerCase().includes('english') || t.id.startsWith('eng-') || !isHindi;

      const matchesLang =
        languageFilter === 'all'
          ? true
          : languageFilter === 'hindi'
          ? isHindi
          : isEnglish;

      const matchesMood =
        selectedMood === 'All' ||
        t.mood.toLowerCase() === selectedMood.toLowerCase() ||
        t.genre.toLowerCase().includes(selectedMood.toLowerCase());

      return matchesLang && matchesMood;
    });
  }, [tracks, languageFilter, selectedMood]);

  // Featured Hero Carousel
  const heroTracks = trendingTracks.slice(0, 5);

  return (
    <div className="space-y-7 sm:space-y-9 pb-36 animate-fadeIn select-none">
      {/* 1. Mood & Activity Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
        {MOOD_FILTERS.map((mood) => {
          const isActive = selectedMood === mood;
          return (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                isActive
                  ? 'bg-white/20 text-white border-white/30 backdrop-blur-md shadow-md'
                  : 'bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.08] border-white/[0.06]'
              }`}
            >
              {mood}
            </button>
          );
        })}
      </div>

      {/* Language Toggle: English & Hindi by default */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Language:</span>
        <button
          onClick={() => setLanguageFilter('all')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            languageFilter === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
              : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'
          }`}
        >
          English & Hindi (Default)
        </button>
        <button
          onClick={() => setLanguageFilter('hindi')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            languageFilter === 'hindi'
              ? 'bg-pink-500/20 text-pink-300 border-pink-400/40'
              : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'
          }`}
        >
          Hindi Hits
        </button>
        <button
          onClick={() => setLanguageFilter('english')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            languageFilter === 'english'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
              : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'
          }`}
        >
          English Hits
        </button>
      </div>

      {/* 🌟 SPOTLIGHT #1 GLOBAL HIT SONG ON TOP (Currently Top Worldwide) */}
      {trendingTracks[0] && (
        <section className="relative overflow-hidden rounded-3xl border border-amber-500/40 p-4 sm:p-5 bg-gradient-to-r from-amber-950/40 via-[#0e1222]/85 to-purple-950/40 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div
                className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shadow-2xl border border-white/20 flex-shrink-0 group cursor-pointer"
                onClick={() => onPlayTrack(trendingTracks[0])}
              >
                <img
                  src={trendingTracks[0].coverUrl}
                  alt={trendingTracks[0].title}
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-7 h-7 text-white fill-current ml-0.5" />
                </div>
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Flame className="w-3 h-3 fill-slate-950" /> #1 Global Hit Song
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/20">
                    Currently on Top
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
                  {trendingTracks[0].title}
                </h2>
                <p className="text-xs text-slate-300 font-medium truncate">
                  {trendingTracks[0].artist} · {trendingTracks[0].genre}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => onPlayTrack(trendingTracks[0])}
                className="py-2.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play #1 Global Hit</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. Hero Featured Carousel */}
      <section className="relative">
        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
          {heroTracks.map((track) => {
            const isCurrent = currentTrackId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className="relative flex-shrink-0 w-[84vw] sm:w-[420px] aspect-[4/5] sm:aspect-[16/10] rounded-3xl overflow-hidden cursor-pointer group snap-center border border-white/[0.12] shadow-2xl"
              >
                {/* Background Artwork */}
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  onError={handleImageError}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Gradient Overlays for High Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />

                {/* Top Badge: Bollywood & Global Hits */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {track.genre.includes('Hindi') ? 'BOLLYWOOD HIT' : 'GLOBAL HIT'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center font-bold text-xs shadow-lg">
                    {track.genre.includes('Hindi') ? 'IN' : 'EN'}
                  </div>
                </div>

                {/* Bottom Content with Huge Typographic Title */}
                <div className="absolute bottom-5 left-5 right-5 z-10 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-mono backdrop-blur-md">
                      {track.genre}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">{track.artist}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md truncate">
                    {track.title}
                  </h2>
                </div>

                {/* Floating Play Action Button */}
                <div className="absolute right-5 bottom-5 z-20 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayTrack(track);
                    }}
                    className={`w-12 h-12 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-2xl transition-all ${
                      isCurrent && isPlaying
                        ? 'scale-100 opacity-100'
                        : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                    }`}
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. 🔥 "TRENDING MUSIC" Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Trending Music
              </h3>
              <p className="text-[11px] text-slate-400">Top chart-topping streams & viral tracks</p>
            </div>
          </div>
          <button
            onClick={() => onPlayAll(trendingTracks)}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-200 border border-white/[0.1] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Play All</span>
          </button>
        </div>

        {/* Trending Horizontal / 2-Row Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {trendingTracks.slice(0, 6).map((track, idx) => {
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
                  <span className="text-xs font-mono font-bold text-slate-500 w-4 text-center">
                    {idx + 1}
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
                    className="p-1.5 text-slate-400 hover:text-pink-400 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-pink-500 text-pink-500' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. 🔁 "MOST LISTENED / LISTEN AGAIN" Section */}
      <section className="space-y-4 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Most Listened / Listen Again
              </h3>
              <p className="text-[11px] text-slate-400">Your top repeat plays & frequent listens</p>
            </div>
          </div>
          <button
            onClick={() => onPlayAll(listenAgainTracks)}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-200 border border-white/[0.1] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Play All</span>
          </button>
        </div>

        {/* 2x3 Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {listenAgainTracks.map((track) => {
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

      {/* 5. ⚡ "LATEST MUSIC & NEW RELEASES" Section */}
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
              <p className="text-[11px] text-slate-400">Newly added songs & recent drops</p>
            </div>
          </div>
          <button
            onClick={() => onPlayAll(latestTracks)}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-200 border border-white/[0.1] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Play All</span>
          </button>
        </div>

        {/* Latest Music Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {latestTracks.map((track) => {
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

      {/* 6. QUICK PICKS (By Mood & Activity) */}
      <section className="space-y-4 pt-2 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight uppercase flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>QUICK PICKS · {selectedMood.toUpperCase()}</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">{filteredQuickPicks.length} tracks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredQuickPicks.slice(0, 9).map((track) => {
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
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/[0.1] flex-shrink-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">{track.title}</h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayTrack(track);
                    }}
                    className="p-2 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(track.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-pink-400 transition-colors"
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
