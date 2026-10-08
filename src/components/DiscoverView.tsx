import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Heart,
  Download,
  CheckCircle2,
  Search,
  FileText,
  Sparkles,
  X,
  ListMusic,
  Flame,
  Globe2,
  TrendingUp,
} from 'lucide-react';
import { Playlist, Track } from '../types/music';
import { AmbientArtGlow } from './AmbientArtGlow';
import { externalMusicService } from '../services/externalMusicService';
import { handleImageError } from '../utils/imageFallback';

interface DiscoverViewProps {
  tracks: Track[];
  playlists?: Playlist[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onSelectPlaylist?: (playlist: Playlist) => void;
  onToggleLike: (trackId: string) => void;
  onDownloadTrack: (track: Track) => void;
  onShareTrack: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
  isDownloaded: (trackId: string) => boolean;
  searchFilter?: string;
  onSearchChange?: (q: string) => void;
  onOpenLyrics?: (track: Track) => void;
}

type SearchCategoryFilter = 'all' | 'songs' | 'playlists' | 'trending';

const SEARCH_DICTIONARY_SUGGESTIONS = [
  'Die With A Smile',
  'Starboy',
  'Blinding Lights',
  'Espresso',
  'Birds of a Feather',
  'Golden Hour',
  'Vampire',
  'Midnight City',
  'Save Your Tears',
  'Kesariya',
  'Ek Raat',
  'Desi Kalakaar',
];

const BROWSE_GENRES = [
  'Pop',
  'Hip-Hop',
  'R&B',
  'Synthwave',
  'Lo-Fi',
  'Deep House',
  'Rock',
  'Ambient',
  'Bollywood',
  'Punjabi',
];

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  tracks,
  playlists = [],
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onSelectPlaylist,
  onToggleLike,
  onDownloadTrack,
  isFavorite,
  isDownloaded,
  searchFilter = '',
  onSearchChange,
  onOpenLyrics,
}) => {
  const [externalSearchResults, setExternalSearchResults] = useState<Track[]>([]);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [localSearchInput, setLocalSearchInput] = useState(searchFilter);
  const [categoryFilter, setCategoryFilter] = useState<SearchCategoryFilter>('all');

  // Sync external searchFilter prop with local input
  useEffect(() => {
    setLocalSearchInput(searchFilter);
  }, [searchFilter]);

  // Live search across YouTube Music & Spotify when searchFilter is active
  useEffect(() => {
    const query = searchFilter.trim();
    if (!query) {
      setExternalSearchResults([]);
      setIsSearchingExternal(false);
      return;
    }

    setIsSearchingExternal(true);
    const timer = setTimeout(() => {
      externalMusicService.searchTracks(query, 'all').then((results) => {
        setExternalSearchResults(results);
        setIsSearchingExternal(false);
      });
    }, 280);

    return () => clearTimeout(timer);
  }, [searchFilter]);

  const handleApplySearch = (query: string) => {
    setLocalSearchInput(query);
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  const isSearchActive = !!searchFilter.trim();
  const queryLower = searchFilter.trim().toLowerCase();

  // 1. Filter local matching playlists
  const matchingPlaylists = useMemo(() => {
    if (!isSearchActive) return playlists;
    return playlists.filter(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.description?.toLowerCase().includes(queryLower) ||
        p.tagline?.toLowerCase().includes(queryLower)
    );
  }, [playlists, queryLower, isSearchActive]);

  // 2. Filter local matching library songs
  const matchingLocalSongs = useMemo(() => {
    if (!isSearchActive) return [];
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(queryLower) ||
        t.artist.toLowerCase().includes(queryLower) ||
        t.album.toLowerCase().includes(queryLower) ||
        t.genre.toLowerCase().includes(queryLower)
    );
  }, [tracks, queryLower, isSearchActive]);

  // 3. Current Top Global Hit #1 Song
  const topGlobalHit = useMemo(() => {
    const sorted = [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0));
    return sorted[0] || tracks[0];
  }, [tracks]);

  // Combined songs: unique local + external results
  const allResultSongs = useMemo(() => {
    const existingIds = new Set(matchingLocalSongs.map((s) => s.id));
    const uniqueExternal = externalSearchResults.filter((s) => !existingIds.has(s.id));
    return [...matchingLocalSongs, ...uniqueExternal];
  }, [matchingLocalSongs, externalSearchResults]);

  return (
    <div className="space-y-6 pb-44 animate-fadeIn select-none">
      {/* Search Input Bar with Dictionary Autocomplete Chips */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0c0e18]/85 border border-white/[0.1] backdrop-blur-2xl shadow-xl space-y-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <input
            type="text"
            value={localSearchInput}
            onChange={(e) => {
              setLocalSearchInput(e.target.value);
              if (onSearchChange) onSearchChange(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApplySearch(localSearchInput);
              }
            }}
            placeholder="Search songs, artists, playlists, or global hits..."
            className="w-full pl-10 pr-24 py-2.5 sm:py-3 text-xs sm:text-sm bg-black/40 border border-white/[0.08] focus:border-cyan-400/60 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {localSearchInput && (
              <button
                onClick={() => handleApplySearch('')}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Search Dictionary Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1 flex-shrink-0">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Quick:
          </span>
          {SEARCH_DICTIONARY_SUGGESTIONS.map((term) => (
            <button
              key={term}
              onClick={() => handleApplySearch(term)}
              className={`px-2.5 py-1 rounded-xl text-xs whitespace-nowrap transition-all border cursor-pointer ${
                searchFilter.toLowerCase() === term.toLowerCase()
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-sm'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] border-white/[0.06]'
              }`}
            >
              {term}
            </button>
          ))}
        </div>

        {/* Search Scope Filter Tabs (All, Songs, Playlists, Global Hits & Trending) */}
        {isSearchActive && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.06] overflow-x-auto scrollbar-none">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
              }`}
            >
              All Results ({matchingPlaylists.length + allResultSongs.length})
            </button>
            <button
              onClick={() => setCategoryFilter('songs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === 'songs'
                  ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
              }`}
            >
              Songs ({allResultSongs.length})
            </button>
            <button
              onClick={() => setCategoryFilter('playlists')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === 'playlists'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Playlists ({matchingPlaylists.length})</span>
            </button>
            <button
              onClick={() => setCategoryFilter('trending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === 'trending'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Global Hits & Online ({externalSearchResults.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* CASE A: USER SEARCHED -> FILTER ACROSS PLAYLISTS & MUSIC       */}
      {/* ============================================================== */}
      {isSearchActive && (
        <div className="space-y-6">
          {/* 1. MATCHING LOCAL PLAYLISTS SECTION */}
          {(categoryFilter === 'all' || categoryFilter === 'playlists') && matchingPlaylists.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-purple-400" />
                  <span>Matching Playlists ({matchingPlaylists.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {matchingPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => onSelectPlaylist && onSelectPlaylist(pl)}
                    className="p-3.5 rounded-2xl bg-[#0c0e18]/80 hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-400/40 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3 mb-2.5">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md text-white font-black text-sm"
                        style={{
                          background: pl.coverGradient || 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                        }}
                      >
                        <ListMusic className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                          {pl.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {pl.trackIds.length} tracks
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{pl.description || pl.tagline}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 2. MATCHING SONGS (LOCAL + ONLINE STREAMING) */}
          {(categoryFilter === 'all' || categoryFilter === 'songs' || categoryFilter === 'trending') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Songs & Global Hits ({categoryFilter === 'trending' ? externalSearchResults.length : allResultSongs.length})</span>
                  {isSearchingExternal && (
                    <span className="text-xs text-cyan-400 animate-pulse font-normal">(Searching online...)</span>
                  )}
                </h3>
              </div>

              {/* Shimmer Loading while searching */}
              {isSearchingExternal && allResultSongs.length === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((k) => (
                    <div key={k} className="h-20 rounded-2xl bg-white/[0.03] animate-pulse border border-white/[0.06]" />
                  ))}
                </div>
              )}

              {/* Song Results Grid */}
              {(categoryFilter === 'trending' ? externalSearchResults : allResultSongs).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(categoryFilter === 'trending' ? externalSearchResults : allResultSongs).map((track) => {
                    const isCurrent = currentTrackId === track.id;
                    const liked = isFavorite(track.id);

                    return (
                      <div
                        key={track.id}
                        className={`flex items-center justify-between p-3 rounded-2xl bg-[#0c0e18]/80 hover:bg-white/[0.06] border border-white/[0.08] transition-all group shadow-md ${
                          isCurrent ? 'bg-cyan-500/10 border-cyan-400/40 ring-1 ring-cyan-400/40' : ''
                        }`}
                      >
                        <div
                          onClick={() => onPlayTrack(track)}
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                        >
                          <AmbientArtGlow
                            coverUrl={track.coverUrl}
                            accentColor={track.accentColor}
                            isPlaying={isCurrent && isPlaying}
                            glowIntensity="subtle"
                            className="flex-shrink-0"
                          >
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/[0.1]">
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
                          </AmbientArtGlow>

                          <div className="min-w-0 flex-1">
                            <h4
                              className={`text-sm font-bold truncate ${
                                isCurrent ? 'text-cyan-300' : 'text-white'
                              }`}
                            >
                              {track.title}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                              {track.source && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-white/[0.06] text-slate-300">
                                  {track.source === 'spotify' ? 'Spotify' : 'YT Music'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => onPlayTrack(track)}
                            title="Play Track"
                            className="p-2 rounded-xl bg-cyan-400 text-slate-950 hover:scale-105 active:scale-95 transition-transform shadow-md shadow-cyan-400/20 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </button>

                          <button
                            onClick={() => onDownloadTrack(track)}
                            title={isDownloaded(track.id) ? 'Saved Offline' : 'Download'}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
                          >
                            {isDownloaded(track.id) ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>

                          {onOpenLyrics && (
                            <button
                              onClick={() => onOpenLyrics(track)}
                              title="Lyrics"
                              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => onToggleLike(track.id)}
                            title="Like"
                            className="p-1.5 text-slate-400 hover:text-pink-400 hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
                          >
                            <Heart className={`w-4 h-4 ${liked ? 'fill-pink-500 text-pink-500' : ''}`} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isSearchingExternal && allResultSongs.length === 0 && matchingPlaylists.length === 0 && (
                <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <Search className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-300 font-semibold">No results found for "{searchFilter}"</p>
                  <p className="text-xs text-slate-500 mt-1">Try another song, artist, or playlist name.</p>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* CASE B: NO SEARCH QUERY -> SPOTLIGHT #1 GLOBAL HIT & GENRES   */}
      {/* ============================================================== */}
      {!isSearchActive && (
        <div className="space-y-7">
          {/* 🌟 SPOTLIGHT #1 GLOBAL HIT SONG ON TOP (Currently Top Worldwide) */}
          {topGlobalHit && (
            <section className="relative overflow-hidden rounded-3xl border border-cyan-400/40 p-5 sm:p-7 bg-gradient-to-r from-blue-950/50 via-[#0e1222]/80 to-purple-950/40 shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-2xl border border-white/20 flex-shrink-0 group cursor-pointer"
                    onClick={() => onPlayTrack(topGlobalHit)}
                  >
                    <img
                      src={topGlobalHit.coverUrl}
                      alt={topGlobalHit.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Flame className="w-3 h-3 fill-slate-950" /> #1 Global Hit
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/20">
                        Top Worldwide
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                      {topGlobalHit.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium truncate">
                      {topGlobalHit.artist} · {topGlobalHit.genre}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {topGlobalHit.description || 'Chart-topping #1 stream across global platforms.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onPlayTrack(topGlobalHit)}
                    className="py-3 px-6 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-400/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Play #1 Global Hit</span>
                  </button>
                  <button
                    onClick={() => onToggleLike(topGlobalHit.id)}
                    className="p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10 transition-all cursor-pointer"
                    title="Like Song"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(topGlobalHit.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Quick Browse Genres */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Browse by Vibe & Genre</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {BROWSE_GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => handleApplySearch(g)}
                  className="px-3.5 py-2 rounded-2xl bg-white/[0.03] hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/[0.08] text-xs font-semibold text-slate-300 transition-all cursor-pointer"
                >
                  {g}
                </button>
              ))}
            </div>
          </section>

          {/* Local Playlists Shelf */}
          {playlists.length > 0 && (
            <section className="space-y-3 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-purple-400" />
                  <span>Featured Playlists</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {playlists.slice(0, 4).map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => onSelectPlaylist && onSelectPlaylist(pl)}
                    className="p-3.5 rounded-2xl bg-[#0c0e18]/80 hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-400/40 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md text-white font-black text-xs"
                        style={{
                          background: pl.coverGradient || 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                        }}
                      >
                        <ListMusic className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                          {pl.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {pl.trackIds.length} tracks
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{pl.description || pl.tagline}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
