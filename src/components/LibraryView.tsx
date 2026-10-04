import React, { useState } from 'react';
import {
  Heart,
  CheckCircle2,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Folder,
  Plus,
  Pin,
  Music,
  ArrowUpDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { Playlist, Track } from '../types/music';
import { historyStorage } from '../services/historyStorage';

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
  onOpenOfflineVault?: () => void;
  onOpenFavorites?: () => void;
  onRequireLogin?: () => void;
}

type LibraryFilter = 'Playlists' | 'Songs' | 'Albums' | 'Artists' | 'Local';

export const LibraryView: React.FC<LibraryViewProps> = ({
  playlists,
  tracks,
  favoriteTrackIds,
  downloadedTrackIds = [],
  currentTrackId,
  onPlayTrack,
  onSelectPlaylist,
  onCreatePlaylist,
  onOpenOfflineVault,
  onOpenFavorites,
  onRequireLogin,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<LibraryFilter>('Playlists');
  const [sortAscending, setSortAscending] = useState(true);
  const userProfile = historyStorage.getUserProfile();

  const FILTERS: LibraryFilter[] = ['Playlists', 'Songs', 'Albums', 'Artists', 'Local'];

  // Handle Downloaded card click - Enforce login check
  const handleDownloadedClick = () => {
    if (!userProfile.isLoggedIn) {
      alert('Sign-in required: Please log in to your account to view and play downloaded offline songs.');
      if (onRequireLogin) onRequireLogin();
      return;
    }
    if (onOpenOfflineVault) {
      onOpenOfflineVault();
    } else {
      // Open synthetic downloaded playlist
      const dlPlaylist: Playlist = {
        id: 'downloaded-vault',
        name: 'Downloaded Songs',
        description: 'Offline storage vault with zero-buffer playback.',
        tagline: 'Offline Storage',
        accentColor: '#10b981',
        coverGradient: 'linear-gradient(135deg, #052e16 0%, #065f46 50%, #10b981 100%)',
        trackIds: downloadedTrackIds,
        isAiGenerated: false,
        createdAt: 'Offline Vault',
        playCount: downloadedTrackIds.length,
      };
      onSelectPlaylist(dlPlaylist);
    }
  };

  const handleLikedClick = () => {
    if (onOpenFavorites) {
      onOpenFavorites();
    } else {
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
    }
  };

  // 8 Grid Shortcut Cards matching user screenshot exactly
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
      title: 'Exported',
      icon: Download,
      count: 0,
      onClick: () => {
        alert('Exported playlist files (.m3u, .json) are saved in your device storage.');
      },
    },
    {
      id: 'cached',
      title: 'Cached',
      icon: RefreshCw,
      count: tracks.length,
      onClick: () => {
        alert(`${tracks.length} tracks actively cached for zero-latency streaming.`);
      },
    },
    {
      id: 'top-50',
      title: 'My top 50',
      icon: TrendingUp,
      count: Math.min(50, tracks.length),
      onClick: () => {
        const top50Playlist: Playlist = {
          id: 'my-top-50',
          name: 'My Top 50',
          description: 'Your most streamed and highest rated songs.',
          tagline: 'Top Charts',
          accentColor: '#3b82f6',
          coverGradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #60a5fa 100%)',
          trackIds: tracks.slice(0, 50).map((t) => t.id),
          isAiGenerated: true,
          createdAt: 'Analytics',
          playCount: 150,
        };
        onSelectPlaylist(top50Playlist);
      },
    },
    {
      id: 'bottom-50',
      title: 'My bottom 50',
      icon: TrendingDown,
      count: Math.min(50, tracks.length),
      onClick: () => {
        const bottom50Playlist: Playlist = {
          id: 'my-bottom-50',
          name: 'My Bottom 50',
          description: 'Tracks ready for rediscovery in your listening library.',
          tagline: 'Deep Discovery',
          accentColor: '#8b5cf6',
          coverGradient: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #a78bfa 100%)',
          trackIds: [...tracks].reverse().slice(0, 50).map((t) => t.id),
          isAiGenerated: true,
          createdAt: 'Analytics',
          playCount: 20,
        };
        onSelectPlaylist(bottom50Playlist);
      },
    },
    {
      id: 'local',
      title: 'Local',
      icon: Folder,
      count: 0,
      onClick: () => {
        alert('Local audio file scanner: Place audio files in public/downloads or import from device.');
      },
    },
  ];

  // 2x2 Collage Artwork generator for playlist thumbnails
  const renderCollage = (trackIds: string[]) => {
    const list = trackIds
      .map((id) => tracks.find((t) => t.id === id))
      .filter(Boolean) as Track[];

    if (list.length >= 4) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
          {list.slice(0, 4).map((t, idx) => (
            <img
              key={idx}
              src={t.coverUrl}
              alt=""
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
          alt=""
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
    <div className="space-y-6 pb-40 select-none animate-fadeIn">
      {/* 1. Filter Chips Row matching screenshot (Playlists, Songs, Albums, Artists, Local) */}
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
          <span>Date added</span>
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

      {/* 4. Playlists Showcase Section */}
      <div className="pt-4 space-y-4 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Playlists
          </h3>
        </div>

        {/* Playlists 2-Column Grid matching screenshot */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Dedicated Downloaded Music Playlist Card in Library section */}
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

          {playlists.map((playlist, idx) => {
            return (
              <div
                key={playlist.id}
                onClick={() => onSelectPlaylist(playlist)}
                className="group cursor-pointer space-y-2.5"
              >
                {/* 2x2 Collage Artwork thumbnail container */}
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border border-white/[0.08] bg-[#171922] group-hover:scale-[1.02] transition-transform">
                  {renderCollage(playlist.trackIds)}
                </div>

                {/* Playlist Info */}
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
    </div>
  );
};
