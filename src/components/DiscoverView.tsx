import React, { useState, useEffect } from 'react';
import {
  Play,
  Heart,
  Download,
  Share2,
  ExternalLink,
  CheckCircle2,
  Search,
  FileText,
  Sparkles,
  X,
  Music2,
} from 'lucide-react';
import { Track } from '../types/music';
import { AmbientArtGlow } from './AmbientArtGlow';
import { externalMusicService } from '../services/externalMusicService';

interface DiscoverViewProps {
  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onDownloadTrack: (track: Track) => void;
  onShareTrack: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
  isDownloaded: (trackId: string) => boolean;
  searchFilter?: string;
  onSearchChange?: (q: string) => void;
  onOpenLyrics?: (track: Track) => void;
}

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
];

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onToggleLike,
  onDownloadTrack,
  onShareTrack,
  isFavorite,
  isDownloaded,
  searchFilter = '',
  onSearchChange,
  onOpenLyrics,
}) => {
  const [externalSearchResults, setExternalSearchResults] = useState<Track[]>([]);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [localSearchInput, setLocalSearchInput] = useState(searchFilter);

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

  return (
    <div className="space-y-6 pb-40 animate-fadeIn">
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
            placeholder="Search any song, artist, album, or genre..."
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
              className={`px-2.5 py-1 rounded-xl text-xs whitespace-nowrap transition-all border ${
                searchFilter.toLowerCase() === term.toLowerCase()
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-sm'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] border-white/[0.06]'
              }`}
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* CASE A: USER SEARCHED -> SHOW ONLY THE SEARCHED THINGS!        */}
      {/* ============================================================== */}
      {isSearchActive && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              <span>Search Results for "{searchFilter}"</span>
              {isSearchingExternal && (
                <span className="text-xs text-cyan-400 animate-pulse font-normal">(Searching online...)</span>
              )}
            </h3>
            <span className="text-xs text-slate-400 font-mono">{externalSearchResults.length} results</span>
          </div>

          {/* Shimmer Loading while searching */}
          {isSearchingExternal && externalSearchResults.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((k) => (
                <div key={k} className="h-20 rounded-2xl bg-white/[0.03] animate-pulse border border-white/[0.06]" />
              ))}
            </div>
          )}

          {/* Direct Matching Search Results List */}
          {externalSearchResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {externalSearchResults.map((track) => {
                const isCurrent = currentTrackId === track.id;
                const liked = isFavorite(track.id);
                return (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between p-3 rounded-2xl bg-[#0c0e18]/80 hover:bg-white/[0.06] border border-white/[0.08] transition-all group shadow-lg ${
                      isCurrent ? 'bg-cyan-500/10 border-cyan-500/40 ring-1 ring-cyan-400/40' : ''
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
                        <p className="text-xs text-slate-400 truncate mt-0.5">{track.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => onPlayTrack(track)}
                        title="Play Track"
                        className="p-2 rounded-xl bg-cyan-400 text-slate-950 hover:scale-105 active:scale-95 transition-transform shadow-md shadow-cyan-400/20"
                      >
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </button>

                      {/* Download Track Button */}
                      <button
                        onClick={() => onDownloadTrack(track)}
                        title={isDownloaded(track.id) ? 'Saved in Downloaded Music' : 'Download for Offline'}
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
                          title="View Lyrics"
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/[0.06] rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => onToggleLike(track.id)}
                        title="Like"
                        className="p-1.5 text-slate-400 hover:text-pink-400 hover:bg-white/[0.06] rounded-lg transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-pink-500 text-pink-500' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isSearchingExternal && externalSearchResults.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <Search className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-semibold">No results found for "{searchFilter}"</p>
              <p className="text-xs text-slate-500 mt-1">Try another song or artist name.</p>
            </div>
          )}
        </section>
      )}

      {/* ============================================================== */}
      {/* CASE B: NO SEARCH QUERY YET -> CLEAN SEARCH PROMPT & GENRES    */}
      {/* ============================================================== */}
      {!isSearchActive && (
        <section className="space-y-6 pt-4 text-center py-12">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Search Music</h3>
            <p className="text-xs text-slate-400">
              Type any track or artist name to stream with synchronized lyrics and high fidelity audio.
            </p>
          </div>

          {/* Quick genre search tags */}
          <div className="max-w-lg mx-auto flex flex-wrap justify-center gap-2 pt-2">
            {BROWSE_GENRES.map((g) => (
              <button
                key={g}
                onClick={() => handleApplySearch(g)}
                className="px-4 py-2 rounded-2xl bg-white/[0.03] hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/[0.08] text-xs font-semibold text-slate-300 transition-all"
              >
                {g}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
