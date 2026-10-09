import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  CheckCircle2,
  Download,
  RefreshCw,
  TrendingUp,
  Folder,
  Plus,
  Pin,
  Music,
  Play,
  ChevronUp,
  User,
  Disc,
  BookmarkCheck,
} from 'lucide-react';
import { Playlist, Track } from '../types/music';
import { handleImageError } from '../utils/imageFallback';

interface LibraryViewProps {
  viewMode?: 'library' | 'favorites' | 'history';
  playlists: Playlist[];
  tracks: Track[];
  favoriteTrackIds: string[];
  downloadedTrackIds?: string[];
  historyTracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
  onCreatePlaylist: () => void;
  onDeletePlaylist?: (playlistId: string) => void;
  onToggleLike: (trackId: string) => void;
  onDownloadTrack?: (track: Track) => void;
  isDownloaded?: (trackId: string) => boolean;
  onDownloadAll?: () => void;
  onOpenFavorites?: () => void;
  onRequireLogin?: () => void;
}

// "Songs" removed per user request
type LibraryFilter = 'Playlists' | 'Albums' | 'Artists' | 'Local';

export const LibraryView: React.FC<LibraryViewProps> = ({
  viewMode = 'library',
  playlists = [],
  tracks = [],
  favoriteTrackIds = [],
  downloadedTrackIds = [],
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onSelectPlaylist,
  onCreatePlaylist,
  onToggleLike,
  onDownloadTrack,
  isDownloaded = () => false,
  onDownloadAll,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<LibraryFilter>('Playlists');
  const [sortAscending, setSortAscending] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Top Category Filters (Songs removed)
  const FILTERS: LibraryFilter[] = ['Playlists', 'Albums', 'Artists', 'Local'];

  const handleLikedClick = () => {
    const likedPlaylist: Playlist = {
      id: 'favorites-playlist',
      name: 'Liked Songs',
      description: 'Your collection of loved and favorited tracks.',
      tagline: 'Favorites',
      accentColor: '#ec4899',
      coverGradient: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #ec4899 100%)',
      trackIds: favoriteTrackIds,
      isAiGenerated: false,
      createdAt: 'Favorites',
      playCount: favoriteTrackIds.length,
    };
    onSelectPlaylist(likedPlaylist);
  };

  // Handle Downloaded card click - Seamlessly open downloaded playlist
  const handleDownloadedClick = () => {
    const downloadedPlaylist: Playlist = {
      id: 'downloaded-playlist',
      name: 'Downloaded Music',
      description: 'Songs saved offline to your device for playback without internet.',
      tagline: 'Offline Available',
      accentColor: '#10b981',
      coverGradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)',
      trackIds: downloadedTrackIds,
      isAiGenerated: false,
      createdAt: 'Offline Cache',
      playCount: downloadedTrackIds.length,
    };
    onSelectPlaylist(downloadedPlaylist);
  };

  useEffect(() => {
    if (viewMode === 'favorites') {
      handleLikedClick();
    }
  }, [viewMode]);

  // User Saved Albums and Artists State
  const [savedAlbumNames, setSavedAlbumNames] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('resonance_saved_albums');
      if (stored) return JSON.parse(stored);
    } catch {}
    // Seed with albums from favorite liked tracks
    const set = new Set<string>();
    (tracks || []).forEach((t) => {
      if (t && favoriteTrackIds.includes(t.id) && t.album) {
        set.add(t.album);
      }
    });
    return Array.from(set);
  });

  const [savedArtistNames, setSavedArtistNames] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('resonance_saved_artists');
      if (stored) return JSON.parse(stored);
    } catch {}
    // Seed with artists from favorite liked tracks
    const set = new Set<string>();
    (tracks || []).forEach((t) => {
      if (t && favoriteTrackIds.includes(t.id) && t.artist) {
        set.add(t.artist);
      }
    });
    return Array.from(set);
  });

  const toggleSaveAlbum = (e: React.MouseEvent, albumName: string) => {
    e.stopPropagation();
    const updated = savedAlbumNames.includes(albumName)
      ? savedAlbumNames.filter((a) => a !== albumName)
      : [...savedAlbumNames, albumName];
    setSavedAlbumNames(updated);
    try {
      localStorage.setItem('resonance_saved_albums', JSON.stringify(updated));
    } catch {}
    showNotification(
      savedAlbumNames.includes(albumName)
        ? `Removed "${albumName}" from Library`
        : `Saved "${albumName}" to Library`
    );
  };

  const toggleSaveArtist = (e: React.MouseEvent, artistName: string) => {
    e.stopPropagation();
    const updated = savedArtistNames.includes(artistName)
      ? savedArtistNames.filter((a) => a !== artistName)
      : [...savedArtistNames, artistName];
    setSavedArtistNames(updated);
    try {
      localStorage.setItem('resonance_saved_artists', JSON.stringify(updated));
    } catch {}
    showNotification(
      savedArtistNames.includes(artistName)
        ? `Unfollowed "${artistName}"`
        : `Saved "${artistName}" to Library`
    );
  };

  // Grouped Albums - STRICTLY ONLY USER SAVED ALBUMS
  const albumList = useMemo(() => {
    const savedSet = new Set(savedAlbumNames);
    favoriteTrackIds.forEach((id) => {
      const t = tracks.find((track) => track && track.id === id);
      if (t?.album) savedSet.add(t.album);
    });

    const map = new Map<string, { name: string; artist: string; coverUrl: string; tracks: Track[] }>();
    (tracks || []).forEach((t) => {
      if (!t) return;
      const albumName = t.album || t.title || 'Unknown Album';
      // Strictly show only saved albums
      if (!savedSet.has(albumName)) return;

      if (!map.has(albumName)) {
        map.set(albumName, {
          name: albumName,
          artist: t.artist || 'Unknown Artist',
          coverUrl: t.coverUrl || '',
          tracks: [],
        });
      }
      map.get(albumName)!.tracks.push(t);
    });
    const list = Array.from(map.values());
    return sortAscending
      ? list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      : list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
  }, [tracks, savedAlbumNames, favoriteTrackIds, sortAscending]);

  // Grouped Artists - STRICTLY ONLY USER SAVED ARTISTS
  const artistList = useMemo(() => {
    const savedSet = new Set(savedArtistNames);
    favoriteTrackIds.forEach((id) => {
      const t = tracks.find((track) => track && track.id === id);
      if (t?.artist) savedSet.add(t.artist);
    });

    const map = new Map<string, { name: string; coverUrl: string; tracks: Track[] }>();
    (tracks || []).forEach((t) => {
      if (!t) return;
      const artistName = t.artist || 'Unknown Artist';
      // Strictly show only saved artists
      if (!savedSet.has(artistName)) return;

      if (!map.has(artistName)) {
        map.set(artistName, {
          name: artistName,
          coverUrl: t.coverUrl || '',
          tracks: [],
        });
      }
      map.get(artistName)!.tracks.push(t);
    });
    const list = Array.from(map.values());
    return sortAscending
      ? list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      : list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
  }, [tracks, savedArtistNames, favoriteTrackIds, sortAscending]);

  // Filtered Local/Downloaded Tracks
  const localTracks = useMemo(() => {
    const ids = new Set(downloadedTrackIds || []);
    return (tracks || []).filter((t) => t && ids.has(t.id));
  }, [tracks, downloadedTrackIds]);

  const handleAlbumClick = (album: { name: string; artist: string; coverUrl: string; tracks: Track[] }) => {
    const albumPlaylist: Playlist = {
      id: `album-${encodeURIComponent(album.name)}`,
      name: album.name,
      description: `Album by ${album.artist} • ${album.tracks.length} songs`,
      tagline: album.artist,
      coverUrl: album.coverUrl,
      accentColor: album.tracks[0]?.accentColor || '#38bdf8',
      trackIds: album.tracks.map((t) => t.id),
      isAiGenerated: false,
      createdAt: 'Album',
      playCount: album.tracks.reduce((sum, t) => sum + (t.plays || 0), 0),
    };
    onSelectPlaylist(albumPlaylist);
  };

  const handleArtistClick = (artist: { name: string; coverUrl: string; tracks: Track[] }) => {
    const artistPlaylist: Playlist = {
      id: `artist-${encodeURIComponent(artist.name)}`,
      name: artist.name,
      description: `Top tracks and discography by ${artist.name} • ${artist.tracks.length} songs`,
      tagline: 'Artist Collection',
      coverUrl: artist.coverUrl,
      accentColor: artist.tracks[0]?.accentColor || '#ec4899',
      trackIds: artist.tracks.map((t) => t.id),
      isAiGenerated: false,
      createdAt: 'Artist Discography',
      playCount: artist.tracks.reduce((sum, t) => sum + (t.plays || 0), 0),
    };
    onSelectPlaylist(artistPlaylist);
  };

  // 8 Grid Shortcut Cards matching user screenshot
  const gridCards = [
    {
      id: 'liked',
      title: 'Liked',
      icon: Heart,
      iconFill: true,
      count: favoriteTrackIds.length,
      onClick: handleLikedClick,
    },
    {
      id: 'downloaded',
      title: 'Downloaded',
      icon: CheckCircle2,
      count: downloadedTrackIds.length,
      onClick: handleDownloadedClick,
    },
    {
      id: 'exported',
      title: 'Download All',
      icon: Download,
      count: tracks.length,
      onClick: () => {
        if (onDownloadAll) {
          onDownloadAll();
          showNotification(`Downloading ${tracks.length} tracks into device offline cache...`);
        } else {
          showNotification('Offline download manager active.');
        }
      },
    },
    {
      id: 'cached',
      title: 'Cached',
      icon: RefreshCw,
      count: tracks.length,
      onClick: () => {
        showNotification(`${tracks.length} tracks cached in high-speed storage.`);
      },
    },
    {
      id: 'local',
      title: 'Local',
      icon: Folder,
      count: downloadedTrackIds.length,
      onClick: handleDownloadedClick,
    },
  ];

  // 2x2 Collage Artwork generator for playlist thumbnails
  const renderCollage = (trackIds: string[]) => {
    const list = (trackIds || [])
      .map((id) => (tracks || []).find((t) => t && t.id === id))
      .filter(Boolean) as Track[];

    if (list.length >= 4) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
          {list.slice(0, 4).map((t, idx) => (
            <img
              key={t.id || idx}
              src={t.coverUrl}
              alt={t.title || ''}
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
          ))}
        </div>
      );
    }

    if (list.length > 0) {
      return (
        <img
          src={list[0].coverUrl}
          alt={list[0].title || ''}
          onError={handleImageError}
          className="w-full h-full object-cover"
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-[#171922] text-slate-500">
        <Music className="w-8 h-8 opacity-40" />
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-44 select-none animate-fadeIn">
      {/* 1. Category Filter Chips (Playlists, Albums, Artists, Local - Songs removed per user request) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
        {FILTERS.map((f) => {
          const isSelected = selectedFilter === f;
          return (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-white/20 text-white border-white/30 backdrop-blur-md shadow-md'
                  : 'bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.08] border-white/[0.06]'
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* 2. Sort Button Row (Date added + direction button) */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSortAscending(!sortAscending)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#1c1e28] hover:bg-[#252835] text-xs font-semibold text-slate-200 border border-white/[0.08] transition-all cursor-pointer shadow-sm"
        >
          <span>Sort {sortAscending ? 'A-Z' : 'Z-A'}</span>
        </button>

        <button
          onClick={() => setSortAscending(!sortAscending)}
          className="p-2 rounded-2xl bg-[#1c1e28] hover:bg-[#252835] text-slate-200 border border-white/[0.08] transition-all cursor-pointer"
          title="Toggle sort direction"
        >
          <ChevronUp
            className={`w-4 h-4 transition-transform duration-200 ${
              sortAscending ? '' : 'rotate-180'
            }`}
          />
        </button>
      </div>

      {/* 3. 2-Column Grid of 8 Rounded Rectangular Category Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {gridCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={card.onClick}
              className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#1c1e28] hover:bg-[#252836] border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer shadow-md group"
            >
              <div className="text-white group-hover:scale-110 transition-transform">
                <Icon className={`w-5 h-5 ${card.iconFill ? 'fill-current' : ''}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                  {card.title}
                </h4>
                {card.count > 0 && (
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {card.count} items
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs shadow-2xl shadow-cyan-500/40 animate-fadeIn">
          {notification}
        </div>
      )}

      {/* 4. DYNAMIC CATEGORY VIEWS (Playlists, Albums, Artists, Local) */}
      
      {/* A. ALBUMS CATEGORY VIEW (ONLY USER SAVED ALBUMS) */}
      {selectedFilter === 'Albums' && (
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Disc className="w-5 h-5 text-cyan-400" />
              <span>Saved Albums ({albumList.length})</span>
            </h3>
          </div>

          {albumList.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <Disc className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No Saved Albums Yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Only albums you have saved or whose tracks you liked appear in your library.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {albumList.map((album) => (
                <div
                  key={album.name}
                  onClick={() => handleAlbumClick(album)}
                  className="group cursor-pointer space-y-2.5 p-3 rounded-2xl bg-[#141622]/80 hover:bg-white/[0.06] border border-white/[0.08] hover:border-cyan-400/40 transition-all shadow-md relative"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-md border border-white/[0.08]">
                    <img
                      src={album.coverUrl}
                      alt={album.name}
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                    </div>
                    {/* Saved Bookmark Badge */}
                    <button
                      onClick={(e) => toggleSaveAlbum(e, album.name)}
                      title="Remove from saved albums"
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-cyan-400 hover:text-white backdrop-blur-md border border-white/20 transition-all"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {album.name}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {album.artist} • {album.tracks.length} tracks
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* B. ARTISTS CATEGORY VIEW (ONLY USER SAVED ARTISTS) */}
      {selectedFilter === 'Artists' && (
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              <span>Saved Artists ({artistList.length})</span>
            </h3>
          </div>

          {artistList.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <User className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No Saved Artists Yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Only artists you follow or whose songs you liked appear in your library.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {artistList.map((artist) => (
                <div
                  key={artist.name}
                  onClick={() => handleArtistClick(artist)}
                  className="group cursor-pointer space-y-3 p-4 rounded-2xl bg-[#141622]/80 hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-400/40 transition-all shadow-md text-center flex flex-col items-center relative"
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-lg border-2 border-white/15 group-hover:border-purple-400/60 transition-colors">
                    <img
                      src={artist.coverUrl}
                      alt={artist.name}
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <button
                      onClick={(e) => toggleSaveArtist(e, artist.name)}
                      title="Unfollow artist"
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-pink-400 hover:text-white backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="w-full">
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                      {artist.name}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {artist.tracks.length} songs
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* C. LOCAL CATEGORY VIEW */}
      {selectedFilter === 'Local' && (
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Folder className="w-5 h-5 text-emerald-400" />
              <span>Local Offline Songs ({localTracks.length})</span>
            </h3>
          </div>

          {localTracks.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <Folder className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No songs downloaded yet</p>
              <p className="text-xs text-slate-500">Tap the download icon on any song to save it for offline playback.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04] bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden">
              {localTracks.map((track, i) => {
                const isCurrent = currentTrackId === track.id;
                const liked = favoriteTrackIds.includes(track.id);

                return (
                  <div
                    key={track.id}
                    className={`group flex items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-white/[0.04] transition-colors ${
                      isCurrent ? 'bg-cyan-500/10' : ''
                    }`}
                  >
                    <div
                      onClick={() => onPlayTrack(track)}
                      className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                    >
                      <span className="w-5 text-center text-xs font-mono text-slate-500 group-hover:hidden">
                        {i + 1}
                      </span>
                      <span className="hidden group-hover:flex w-5 h-5 items-center justify-center text-cyan-400">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </span>

                      <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-white/[0.1]">
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          onError={handleImageError}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4
                          className={`text-sm font-bold truncate ${
                            isCurrent ? 'text-cyan-300' : 'text-slate-100'
                          }`}
                        >
                          {track.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{track.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-400/30">
                        Downloaded
                      </span>
                      <button
                        onClick={() => onToggleLike(track.id)}
                        className="p-1.5 text-slate-400 hover:text-pink-400 transition-colors cursor-pointer"
                        title={liked ? 'Unlike' : 'Like'}
                      >
                        <Heart
                          className={`w-4 h-4 ${liked ? 'fill-pink-500 text-pink-500' : ''}`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* D. PLAYLISTS CATEGORY VIEW (Default) */}
      {selectedFilter === 'Playlists' && (
        <div className="pt-4 space-y-4 relative">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Playlists ({playlists.length + 1})
            </h3>
          </div>

          {/* Playlists Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Dedicated Downloaded Music Playlist Card */}
            <div
              onClick={handleDownloadedClick}
              className="group cursor-pointer space-y-2.5"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border border-emerald-500/40 bg-gradient-to-br from-emerald-950/80 via-[#0d1f18] to-[#0a1412] group-hover:scale-[1.02] transition-transform flex flex-col items-center justify-center p-4">
                {downloadedTrackIds.length > 0 ? (
                  renderCollage(downloadedTrackIds)
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                )}
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-mono text-[9px] uppercase border border-emerald-400/30 font-bold backdrop-blur-md">
                  Offline
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate flex items-center gap-1.5">
                  <span>Downloaded Music</span>
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{downloadedTrackIds.length} offline songs</span>
                </div>
              </div>
            </div>

            {playlists.map((playlist) => {
              return (
                <div
                  key={playlist.id}
                  onClick={() => onSelectPlaylist(playlist)}
                  className="group cursor-pointer space-y-2.5"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border border-white/[0.08] bg-[#171922] group-hover:scale-[1.02] transition-transform">
                    {renderCollage(playlist.trackIds)}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {playlist.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Pin className="w-3 h-3 text-slate-500 fill-slate-500 rotate-45" />
                      <span>{playlist.trackIds.length} songs</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Circular '+' Button to create new playlist */}
          <button
            onClick={onCreatePlaylist}
            className="fixed bottom-24 right-5 sm:right-10 z-40 w-14 h-14 rounded-full bg-white hover:bg-slate-100 text-slate-950 flex items-center justify-center shadow-2xl shadow-black/80 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Create New Playlist"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
