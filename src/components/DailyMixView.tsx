import React, { useState, useEffect } from 'react';
import {
  Play,
  Flame,
  Heart,
  FileText,
  Sparkles,
  ChevronRight,
  Music,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { Track } from '../types/music';
import { historyStorage, UserProfile } from '../services/historyStorage';
import { AmbientArtGlow } from './AmbientArtGlow';

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

  // Filter tracks by mood and language (English & Hindi default)
  const filteredTracks = tracks.filter((t) => {
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

  // Featured Hero Songs (matching the big carousel in the user screenshot)
  const heroTracks = tracks.slice(0, 5);

  // Listen Again items (from history or default Hindi favorites)
  const listenAgainTracks = tracks.slice(0, 4);

  // Forgotten Favorites
  const forgottenFavorites = tracks.slice(4, 12);

  return (
    <div className="space-y-6 sm:space-y-8 pb-36 animate-fadeIn select-none">
      {/* 1. Mood & Activity Filter Chips (Matching screenshot top row) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
        {MOOD_FILTERS.map((mood) => {
          const isActive = selectedMood === mood;
          return (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border ${
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
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
            languageFilter === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
              : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'
          }`}
        >
          English & Hindi (Default)
        </button>
        <button
          onClick={() => setLanguageFilter('hindi')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
            languageFilter === 'hindi'
              ? 'bg-pink-500/20 text-pink-300 border-pink-400/40'
              : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'
          }`}
        >
          Hindi Hits
        </button>
        <button
          onClick={() => setLanguageFilter('english')}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
            languageFilter === 'english'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
              : 'bg-white/[0.03] text-slate-400 border-white/[0.06]'
          }`}
        >
          English Hits
        </button>
      </div>

      {/* 2. Hero Featured Carousel (Big horizontal snap cards matching screenshot) */}
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
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Gradient Overlays for High Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />

                {/* Top Badge: Gulshan Kumar & T-Series Presents or Global Hits */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                    {track.genre.includes('Hindi') ? 'T-SERIES & BOLLYWOOD' : 'GLOBAL HIT'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center font-bold text-xs shadow-lg">
                    {track.genre.includes('Hindi') ? 'T' : 'E'}
                  </div>
                </div>

                {/* Bottom Content with Huge Typographic Title like in Screenshot */}
                <div className="absolute bottom-5 left-5 right-5 z-10 space-y-1.5">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                    {track.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    {track.artist}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                    {track.description}
                  </p>
                </div>

                {/* Floating Actions on Hero Artwork */}
                <div className="absolute right-4 bottom-4 flex items-center gap-2 z-20">
                  {onDownloadTrack && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadTrack(track);
                      }}
                      className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white hover:text-cyan-300 border border-white/20 flex items-center justify-center shadow-xl transition-all cursor-pointer active:scale-95"
                      title={isDownloaded(track.id) ? 'Downloaded offline' : 'Download track for offline playback'}
                    >
                      {isDownloaded(track.id) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                      ) : (
                        <Download className="w-4 h-4 text-cyan-300" />
                      )}
                    </button>
                  )}
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

      {/* 3. "LISTEN AGAIN" Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/20 flex-shrink-0">
            <div className="w-full h-full rounded-[14px] bg-[#0c0e18] flex items-center justify-center text-cyan-300 font-extrabold text-xs">
              {profile.isLoggedIn ? profile.initials : <Flame className="w-4 h-4 text-cyan-400" />}
            </div>
          </div>
          <div>
            {profile.isLoggedIn && (
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                {profile.name.toUpperCase()}
              </span>
            )}
            <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              LISTEN AGAIN
            </h3>
          </div>
        </div>

        {/* 2x2 Collage Tiles / Card Grid as shown in screenshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {listenAgainTracks.map((track) => {
            const isCurrent = currentTrackId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className={`group p-3 rounded-3xl bg-[#0c0e18]/80 hover:bg-white/[0.06] border border-white/[0.08] transition-all cursor-pointer shadow-lg ${
                  isCurrent ? 'ring-2 ring-cyan-400 bg-cyan-500/10' : ''
                }`}
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-2.5">
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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </AmbientArtGlow>
                  
                  {/* Floating Action Buttons directly on artwork */}
                  <div className="absolute right-2 bottom-2 flex items-center gap-1.5 z-20">
                    {onDownloadTrack && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadTrack(track);
                        }}
                        className="w-8 h-8 rounded-full bg-black/75 hover:bg-black text-white hover:text-cyan-300 border border-white/20 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                        title={isDownloaded(track.id) ? 'Downloaded offline' : 'Download track'}
                      >
                        {isDownloaded(track.id) ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-cyan-300" />
                        )}
                      </button>
                    )}
                    <button
                      className={`w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform ${
                        isCurrent && isPlaying ? 'scale-100' : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">{track.title}</h4>
                <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. "FORGOTTEN FAVORITES" Section with "Play all" (Matching Screenshot) */}
      <section className="space-y-4 pt-4 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight uppercase">
            FORGOTTEN FAVORITES
          </h3>
          <button
            onClick={() => onPlayAll(forgottenFavorites)}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-200 border border-white/[0.1] transition-all"
          >
            Play all
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {forgottenFavorites.map((track) => {
            const isCurrent = currentTrackId === track.id;
            const liked = isFavorite(track.id);

            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track)}
                className={`flex items-center justify-between p-3 rounded-2xl bg-[#0c0e18]/70 hover:bg-white/[0.06] border border-white/[0.06] transition-all cursor-pointer group shadow-md ${
                  isCurrent ? 'bg-cyan-500/10 border-cyan-400/40 ring-1 ring-cyan-400/30' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/[0.1] flex-shrink-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
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
                  {onDownloadTrack && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadTrack(track);
                      }}
                      title={isDownloaded(track.id) ? 'Saved in Downloaded Music' : 'Download for offline playback'}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      {isDownloaded(track.id) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {onOpenLyrics && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenLyrics(track);
                      }}
                      title="View Lyrics"
                      className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}

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

      {/* 5. QUICK PICKS (English & Hindi) */}
      <section className="space-y-4 pt-4 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>QUICK PICKS · ENGLISH & HINDI</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">{filteredTracks.length} tracks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTracks.map((track) => {
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
