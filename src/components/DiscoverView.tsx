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
  User,
  Disc,
  Music2,
  TrendingUp,
  Radio,
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

export type SearchCategoryFilter = 'all' | 'songs' | 'artists' | 'albums' | 'playlists';

const SEARCH_DICTIONARY_SUGGESTIONS = [
  'Die With A Smile',
  'Starboy',
  'Blinding Lights',
  'Espresso',
  'Birds of a Feather',
  'Golden Hour',
  'Vampire',
  'Midnight City',
  'Kesariya',
  'Arijit Singh',
  'The Weeknd',
  'Taylor Swift',
];

const BROWSE_GENRES = [
  { name: 'Pop Hits', color: 'from-pink-600/30 to-purple-800/40', tag: 'Pop' },
  { name: 'Hip-Hop & Rap', color: 'from-amber-600/30 to-orange-800/40', tag: 'Hip-Hop' },
  { name: 'Bollywood Hits', color: 'from-rose-600/30 to-red-800/40', tag: 'Bollywood' },
  { name: 'Synthwave & Electronic', color: 'from-cyan-600/30 to-blue-800/40', tag: 'Synthwave' },
  { name: 'Lo-Fi Chillhop', color: 'from-emerald-600/30 to-teal-800/40', tag: 'Lo-Fi' },
  { name: 'R&B / Soul', color: 'from-indigo-600/30 to-purple-800/40', tag: 'R&B' },
  { name: 'Deep House Club', color: 'from-violet-600/30 to-cyan-800/40', tag: 'Deep House' },
  { name: 'Rock & Alternative', color: 'from-red-600/30 to-zinc-800/40', tag: 'Rock' },
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
  const [categoryFilter, setCategoryFilter] = useState<SearchCategoryFilter>('all');

  // Live search across music catalog & external API when searchFilter is active
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
    }, 250);

    return () => clearTimeout(timer);
  }, [searchFilter]);

  const handleApplySearch = (query: string) => {
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  const isSearchActive = !!searchFilter.trim();
  const queryLower = searchFilter.trim().toLowerCase();

  // 1. Filter matching songs (Local library matches)
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

  // Combined songs (local + unique online streaming results)
  const allResultSongs = useMemo(() => {
    const existingIds = new Set(matchingLocalSongs.map((s) => s.id));
    const uniqueExternal = externalSearchResults.filter((s) => !existingIds.has(s.id));
    return [...matchingLocalSongs, ...uniqueExternal];
  }, [matchingLocalSongs, externalSearchResults]);

  // 2. Filter matching artists
  const matchingArtists = useMemo(() => {
    if (!isSearchActive) return [];
    const map = new Map<string, { name: string; coverUrl: string; tracks: Track[] }>();
    tracks.forEach((t) => {
      if (t.artist && t.artist.toLowerCase().includes(queryLower)) {
        if (!map.has(t.artist)) {
          map.set(t.artist, { name: t.artist, coverUrl: t.coverUrl, tracks: [] });
        }
        map.get(t.artist)!.tracks.push(t);
      }
    });
    return Array.from(map.values());
  }, [tracks, queryLower, isSearchActive]);

  // 3. Filter matching albums
  const matchingAlbums = useMemo(() => {
    if (!isSearchActive) return [];
    const map = new Map<string, { name: string; artist: string; coverUrl: string; tracks: Track[]; year?: number }>();
    tracks.forEach((t) => {
      const albumName = t.album || t.title;
      if (
        albumName &&
        (albumName.toLowerCase().includes(queryLower) || t.artist?.toLowerCase().includes(queryLower))
      ) {
        if (!map.has(albumName)) {
          map.set(albumName, {
            name: albumName,
            artist: t.artist || 'Unknown Artist',
            coverUrl: t.coverUrl || '',
            tracks: [],
            year: t.releaseYear,
          });
        }
        map.get(albumName)!.tracks.push(t);
      }
    });
    return Array.from(map.values());
  }, [tracks, queryLower, isSearchActive]);

  // 4. Filter matching playlists
  const matchingPlaylists = useMemo(() => {
    if (!isSearchActive) return playlists;
    return playlists.filter(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.description?.toLowerCase().includes(queryLower) ||
        p.tagline?.toLowerCase().includes(queryLower)
    );
  }, [playlists, queryLower, isSearchActive]);

  const handleOpenArtist = (artist: { name: string; coverUrl: string; tracks: Track[] }) => {
    if (!onSelectPlaylist) return;
    onSelectPlaylist({
      id: `artist-${encodeURIComponent(artist.name)}`,
      name: artist.name,
      description: `All tracks by ${artist.name} (${artist.tracks.length} songs)`,
      tagline: 'Artist Spotlight',
      coverUrl: artist.coverUrl,
      accentColor: artist.tracks[0]?.accentColor || '#ec4899',
      trackIds: artist.tracks.map((t) => t.id),
      isAiGenerated: false,
      createdAt: 'Artist Discography',
      playCount: artist.tracks.reduce((sum, t) => sum + (t.plays || 0), 0),
    });
  };

  const handleOpenAlbum = (album: { name: string; artist: string; coverUrl: string; tracks: Track[] }) => {
    if (!onSelectPlaylist) return;
    onSelectPlaylist({
      id: `album-${encodeURIComponent(album.name)}`,
      name: album.name,
      description: `Album by ${album.artist} • ${album.tracks.length} tracks`,
      tagline: album.artist,
      coverUrl: album.coverUrl,
      accentColor: album.tracks[0]?.accentColor || '#38bdf8',
      trackIds: album.tracks.map((t) => t.id),
      isAiGenerated: false,
      createdAt: 'Album',
      playCount: album.tracks.reduce((sum, t) => sum + (t.plays || 0), 0),
    });
  };

  return (
    <div className="space-y-6 pb-44 animate-fadeIn select-none">
      {/* ============================================================== */}
      {/* PREMIER STUDIO SEARCH BAR (The One and Only Search Bar in App)  */}
      {/* ============================================================== */}
      <section className="relative z-20 space-y-3">
        <div className="relative flex items-center shadow-2xl rounded-2xl bg-[#0c0e18]/95 border border-cyan-400/40 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30 transition-all backdrop-blur-3xl group">
          <div className="pl-4 pr-2 text-cyan-400 pointer-events-none flex items-center">
            <Search className="w-5 h-5 group-focus-within:scale-110 transition-transform" />
          </div>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => handleApplySearch(e.target.value)}
            placeholder="Search songs, artists, albums, or playlists..."
            className="w-full py-3.5 sm:py-4 pr-12 text-sm sm:text-base bg-transparent text-white placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          {searchFilter ? (
            <button
              onClick={() => handleApplySearch('')}
              className="absolute right-3.5 p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.1] rounded-xl transition-all cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="hidden sm:inline-flex absolute right-4 text-[11px] font-mono text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
              Instant search
            </span>
          )}
        </div>

        {/* Trending Suggestions & Quick Search Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-0.5">
          <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Trending:
          </span>
          {SEARCH_DICTIONARY_SUGGESTIONS.map((term) => (
            <button
              key={term}
              onClick={() => handleApplySearch(term)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                searchFilter.toLowerCase() === term.toLowerCase()
                  ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400/50 shadow-sm'
                  : 'bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.08] border-white/[0.08]'
              }`}
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* CASE A: USER SEARCHED -> CORRECT CATEGORY TABS (All, Songs, Artists, Albums, Playlists) */}
      {/* ============================================================== */}
      {isSearchActive && (
        <div className="space-y-5">
          {/* Category Filter Controls Widget */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#0c0e18]/90 border border-white/[0.1] backdrop-blur-2xl shadow-xl">
            {/* Standard Correct Category Options: All, Songs, Artists, Albums, Playlists */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === 'all'
                    ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/25'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter('songs')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoryFilter === 'songs'
                    ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/25'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <Music2 className="w-3.5 h-3.5" />
                <span>Songs ({allResultSongs.length})</span>
              </button>
              <button
                onClick={() => setCategoryFilter('artists')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoryFilter === 'artists'
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/25'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Artists ({matchingArtists.length})</span>
              </button>
              <button
                onClick={() => setCategoryFilter('albums')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoryFilter === 'albums'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <Disc className="w-3.5 h-3.5" />
                <span>Albums ({matchingAlbums.length})</span>
              </button>
              <button
                onClick={() => setCategoryFilter('playlists')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  categoryFilter === 'playlists'
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <ListMusic className="w-3.5 h-3.5" />
                <span>Playlists ({matchingPlaylists.length})</span>
              </button>
            </div>
          </div>

          {/* 1. ARTISTS RESULTS (Visible in 'all' or 'artists') */}
          {(categoryFilter === 'all' || categoryFilter === 'artists') && matchingArtists.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-pink-400" />
                <span>Artists ({matchingArtists.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {matchingArtists.map((artist) => (
                  <div
                    key={artist.name}
                    onClick={() => handleOpenArtist(artist)}
                    className="p-3.5 rounded-2xl bg-[#0c0e18]/80 hover:bg-white/[0.08] border border-white/[0.08] hover:border-pink-500/40 transition-all cursor-pointer group text-center flex flex-col items-center"
                  >
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 border-2 border-white/10 group-hover:border-pink-400 shadow-xl">
                      <img
                        src={artist.coverUrl}
                        alt={artist.name}
                        onError={handleImageError}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                      </div>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-pink-300 transition-colors truncate w-full">
                      {artist.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Artist · {artist.tracks.length} songs</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 2. ALBUMS RESULTS (Visible in 'all' or 'albums') */}
          {(categoryFilter === 'all' || categoryFilter === 'albums') && matchingAlbums.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Disc className="w-4 h-4 text-amber-400" />
                <span>Albums ({matchingAlbums.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {matchingAlbums.map((album) => (
                  <div
                    key={album.name}
                    onClick={() => handleOpenAlbum(album)}
                    className="p-3 rounded-2xl bg-[#0c0e18]/80 hover:bg-white/[0.08] border border-white/[0.08] hover:border-amber-400/40 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 border border-white/10 shadow-lg">
                      <img
                        src={album.coverUrl}
                        alt={album.name}
                        onError={handleImageError}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-7 h-7 text-white fill-current ml-0.5" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {album.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {album.artist} {album.year ? `· ${album.year}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. PLAYLISTS RESULTS (Visible in 'all' or 'playlists') */}
          {(categoryFilter === 'all' || categoryFilter === 'playlists') && matchingPlaylists.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-purple-400" />
                <span>Matching Playlists ({matchingPlaylists.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {matchingPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => onSelectPlaylist && onSelectPlaylist(pl)}
                    className="p-3.5 rounded-2xl bg-[#0c0e18]/80 hover:bg-white/[0.08] border border-white/[0.08] hover:border-purple-400/40 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
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

          {/* 4. SONGS RESULTS (Visible in 'all' or 'songs') */}
          {(categoryFilter === 'all' || categoryFilter === 'songs') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <Music2 className="w-4 h-4 text-cyan-400" />
                  <span>Songs ({allResultSongs.length})</span>
                  {isSearchingExternal && (
                    <span className="text-xs text-cyan-400 animate-pulse font-normal">(Searching online...)</span>
                  )}
                </h3>
              </div>

              {/* Songs Grid */}
              {allResultSongs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allResultSongs.map((track) => {
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
                                  {track.source === 'spotify' ? 'Spotify' : 'Online'}
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

              {/* Empty state */}
              {!isSearchingExternal && allResultSongs.length === 0 && matchingPlaylists.length === 0 && matchingArtists.length === 0 && matchingAlbums.length === 0 && (
                <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <Search className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-300 font-semibold">No results found for "{searchFilter}"</p>
                  <p className="text-xs text-slate-500 mt-1">Try another song, artist, album, or playlist name.</p>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* CASE B: NO SEARCH QUERY -> EXPLORE & SEARCH LANDING            */}
      {/* ============================================================== */}
      {!isSearchActive && (
        <div className="space-y-7">
          {/* Top Search Welcome Banner Widget */}
          <section className="relative overflow-hidden rounded-3xl border border-cyan-400/30 p-6 sm:p-8 bg-gradient-to-r from-blue-950/40 via-[#0e1222]/80 to-purple-950/40 shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Search className="w-3 h-3 stroke-[3]" /> Search Hub
                </span>
                <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/20">
                  Global Music Search
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Search Songs, Artists, Albums & Playlists
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Type any title or artist in the search bar above to discover high-fidelity tracks, explore artist discographies, or find your favorite albums.
              </p>
            </div>
          </section>

          {/* Quick Browse Genres Widget */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Browse by Vibe & Genre</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BROWSE_GENRES.map((g) => (
                <button
                  key={g.name}
                  onClick={() => handleApplySearch(g.tag)}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${g.color} hover:scale-[1.02] active:scale-95 border border-white/[0.08] text-left transition-all cursor-pointer shadow-lg group`}
                >
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {g.name}
                  </h4>
                  <p className="text-[10px] text-slate-300/80 mt-1 flex items-center gap-1">
                    <span>Explore songs</span>
                    <span>→</span>
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Featured Playlists Shelf */}
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
