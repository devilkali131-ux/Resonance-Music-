import React from 'react';
import {
  X,
  Sparkles,
  Compass,
  Search,
  Radio,
  HardDriveDownload,
  Library,
  Heart,
  Clock,
  Plus,
  Music2,
  ChevronDown,
  Database,
  Music,
  Shield,
  Sliders,
  LogIn,
} from 'lucide-react';
import { Playlist } from '../types/music';
import { ActiveTab } from './Sidebar';
import { OfflineStorageStats } from '../services/offlineStorage';
import { historyStorage, UserProfile } from '../services/historyStorage';

interface BottomMenuPopupProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  playlists: Playlist[];
  onSelectPlaylist: (playlist: Playlist) => void;
  selectedPlaylistId: string | null;
  offlineCount: number;
  onCreatePlaylist: () => void;
  storageStats?: OfflineStorageStats;
  onOpenSpotifySync?: () => void;
  onOpenOwnerPortal?: () => void;
  onOpenEqualizer?: () => void;
  onOpenApkModal?: () => void;
  onOpenGoogleAuth?: () => void;
  userProfile?: UserProfile;
}

export const BottomMenuPopup: React.FC<BottomMenuPopupProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  playlists,
  onSelectPlaylist,
  selectedPlaylistId,
  offlineCount,
  onCreatePlaylist,
  storageStats,
  onOpenSpotifySync,
  onOpenOwnerPortal,
  onOpenEqualizer,
  onOpenApkModal,
  onOpenGoogleAuth,
  userProfile: propUserProfile,
}) => {
  if (!isOpen) return null;

  const userProfile = propUserProfile || historyStorage.getUserProfile();
  // Owner portal is strictly restricted to owner email devilkali131@gmail.com when logged in
  const isOwner =
    userProfile.isLoggedIn &&
    userProfile.email.toLowerCase().trim() === 'devilkali131@gmail.com';

  const mainCategories = [
    {
      id: 'daily' as ActiveTab,
      label: 'Explore & Mix',
      desc: 'Machine-learning personalized flow',
      icon: Sparkles,
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30',
      badge: 'Curated',
    },
    {
      id: 'discover' as ActiveTab,
      label: 'Charts & Trending',
      desc: 'Global streaming & trending charts',
      icon: Compass,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
      badge: 'Hot',
    },
    {
      id: 'search' as ActiveTab,
      label: 'Search Music',
      desc: 'Instant global music search',
      icon: Search,
      color: 'from-cyan-500/20 to-purple-500/10 text-cyan-400 border-cyan-500/30',
      badge: 'Live',
    },
    {
      id: 'ml-studio' as ActiveTab,
      label: 'ML Playlist Studio',
      desc: 'Generate smart mixes with custom prompts',
      icon: Radio,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
      badge: 'Synthesizer',
    },
  ];

  const libraryItems = [
    { id: 'library' as ActiveTab, label: 'All Playlists', icon: Library },
    { id: 'favorites' as ActiveTab, label: 'Liked Songs', icon: Heart },
    { id: 'history' as ActiveTab, label: 'Listening History', icon: Clock },
  ];

  const handleTabSelect = (tab: ActiveTab) => {
    onTabChange(tab);
    onClose();
  };

  const handlePlaylistSelect = (playlist: Playlist) => {
    onSelectPlaylist(playlist);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end select-none">
      {/* Dark Blur Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity cursor-pointer"
      />

      {/* Pop-up Sheet Panel from Bottom */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-5xl mx-auto bg-[#0a0d18] border-t border-x border-white/[0.12] rounded-t-3xl shadow-2xl backdrop-blur-2xl max-h-[82vh] flex flex-col overflow-hidden"
      >
        {/* Grab Handle & Header */}
        <div className="pt-3 pb-2 px-6 flex flex-col items-center border-b border-white/[0.06] relative">
          <div
            onClick={onClose}
            className="w-12 h-1.5 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer transition-colors mb-3"
          />

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-white/[0.12] flex items-center justify-center shadow-lg shadow-cyan-500/10">
                <img
                  src="/resonance-logo.svg"
                  alt="Resonance Music"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  Resonance Music
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Menu
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Pure Stream & Studio Sound</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenGoogleAuth && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenGoogleAuth();
                  }}
                  className={`flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    userProfile.isLoggedIn
                      ? 'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-cyan-400/40'
                      : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md shadow-cyan-400/30'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{userProfile.isLoggedIn ? userProfile.name.split(' ')[0] : 'Sign In'}</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Pop-up Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Exploratory Sections Grid */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-3">
              Explore & Synthesize
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {mainCategories.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id && !selectedPlaylistId;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabSelect(item.id)}
                    className={`text-left p-4 rounded-2xl border transition-all group flex flex-col justify-between ${
                      isActive
                        ? 'bg-gradient-to-br from-cyan-500/15 to-purple-500/10 border-cyan-400 shadow-lg shadow-cyan-500/10'
                        : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.06] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 w-full">
                      <div className={`p-2.5 rounded-xl bg-white/[0.04] border ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {item.label}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Library Tabs & Playlists Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 border-t border-white/[0.06]">
            {/* Audio Equalizer Quick Launcher */}
            {onOpenEqualizer && (
              <div
                onClick={() => {
                  onClose();
                  onOpenEqualizer();
                }}
                className="col-span-full p-3.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-400/30 hover:border-cyan-400/60 transition-all cursor-pointer shadow-md flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/30">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                      <span>Audio Equalizer</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                        Studio DSP
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Fine-tune bass, mid, treble & graphic acoustic presets
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer">
                  Open EQ →
                </button>
              </div>
            )}

            {/* Library Quick Access */}
            <div className="space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Library Shortcuts
              </span>
              <div className="space-y-1.5">
                {libraryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id && !selectedPlaylistId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabSelect(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                          : 'bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 hover:text-white border border-white/[0.04]'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-purple-400" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Playlists Horizontal / Grid Showcase */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Playlists ({playlists.length})
                </span>
                <button
                  onClick={() => {
                    onCreatePlaylist();
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.05] hover:bg-white/[0.1] text-cyan-300 text-xs font-medium rounded-lg border border-white/[0.08] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Playlist</span>
                </button>
              </div>

              {playlists.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="text-xs text-slate-400">0 custom playlists created.</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Click "+ New Playlist" to create a custom mixtape.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
                  {playlists.map((playlist) => {
                    const isSelected = selectedPlaylistId === playlist.id;
                    return (
                      <button
                        key={playlist.id}
                        onClick={() => handlePlaylistSelect(playlist)}
                        className={`text-left p-3 rounded-xl border transition-all flex items-center gap-3 group ${
                          isSelected
                            ? 'bg-white/[0.09] text-white border-white/[0.2]'
                            : 'bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 hover:text-white border-white/[0.04]'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center border border-white/[0.1]"
                          style={{
                            background:
                              playlist.coverGradient || 'linear-gradient(135deg, #090a0f, #1e1b4b)',
                          }}
                        >
                          <Music className="w-4 h-4 text-white/90" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate group-hover:text-cyan-300">
                            {playlist.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {playlist.trackIds.length} tracks · {playlist.isAiGenerated ? 'ML mix' : 'Collection'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
