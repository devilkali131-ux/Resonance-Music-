import React from 'react';
import {
  Flame,
  Sparkles,
  Search,
  HardDriveDownload,
  Library,
  Music2,
  Radio,
  Heart,
  Clock,
  Plus,
  X,
  Download,
} from 'lucide-react';
import { ActiveTab, Playlist } from '../types/music';
import { PWAInstallButton } from './PWAInstallButton';

export type { ActiveTab };

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  playlists: Playlist[];
  onSelectPlaylist: (playlist: Playlist) => void;
  selectedPlaylistId: string | null;
  offlineCount: number;
  onCreatePlaylist: () => void;
  onOpenGoogleAuth?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: any;
  badge?: string;
  count?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  playlists,
  onSelectPlaylist,
  selectedPlaylistId,
  offlineCount,
  onCreatePlaylist,
  onOpenGoogleAuth,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const mainNavItems: NavItem[] = [
    { id: 'daily' as ActiveTab, label: 'Home (Trending & New)', icon: Flame },
    { id: 'search' as ActiveTab, label: 'Search Music', icon: Search },
    { id: 'library' as ActiveTab, label: 'Playlists', icon: Library },
    { id: 'favorites' as ActiveTab, label: 'Liked Songs', icon: Heart },
  ];

  const libraryItems: NavItem[] = [
    { id: 'history' as ActiveTab, label: 'Listening History', icon: Clock },
    { id: 'offline-vault' as ActiveTab, label: 'Downloaded Vault', icon: HardDriveDownload, count: offlineCount },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onTabChange(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const handlePlaylistClick = (p: Playlist) => {
    onSelectPlaylist(p);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#07080c] select-none">
      {/* Brand Header */}
      <div className="p-5 pb-4 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl overflow-hidden bg-black/40 border border-white/[0.12] flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <img
              src="/resonance-logo.svg"
              alt="Resonance Music"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Resonance Music
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Live
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 tracking-wide">Pure Stream & Studio Sound</p>
          </div>
        </div>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-5">
        {/* Main Explore Section */}
        <div>
          <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Listen & Explore
          </div>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !selectedPlaylistId;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-300 border-l-2 border-cyan-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Library Section */}
        <div>
          <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Your Library
          </div>
          <nav className="space-y-1">
            {libraryItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !selectedPlaylistId;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/15 to-transparent text-purple-300 border-l-2 border-purple-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Playlists Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Playlists
            </span>
            <button
              onClick={() => {
                onCreatePlaylist();
                if (onCloseMobile) onCloseMobile();
              }}
              title="Create new custom playlist"
              className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {playlists.map((playlist) => {
              const isSelected = selectedPlaylistId === playlist.id;
              return (
                <button
                  key={playlist.id}
                  onClick={() => handlePlaylistClick(playlist)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium truncate flex items-center justify-between group transition-all ${
                    isSelected
                      ? 'bg-white/[0.08] text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="truncate">{playlist.name}</span>
                  {playlist.isAiGenerated && (
                    <Sparkles className="w-3 h-3 text-cyan-400 opacity-60 group-hover:opacity-100 flex-shrink-0 ml-1.5" />
                  )}
                </button>
              );
            })}
            {playlists.length === 0 && (
              <div className="px-3 py-2 text-xs text-slate-500 italic">
                0 playlists created.
              </div>
            )}
          </div>
        </div>

        {/* Google & Multi-platform Import Button */}
        {onOpenGoogleAuth && (
          <div className="pt-2">
            <button
              onClick={() => {
                onOpenGoogleAuth();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500/10 to-pink-500/10 hover:from-cyan-500/20 hover:to-pink-500/20 border border-white/[0.08] text-slate-200 transition-all shadow-sm group"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-pink-500 p-0.5 flex items-center justify-center flex-shrink-0">
                <div className="w-full h-full rounded-full bg-[#0a0c14] flex items-center justify-center text-[9px] font-extrabold text-cyan-300">
                  G
                </div>
              </div>
              <span className="truncate group-hover:text-cyan-300 transition-colors">Import Playlists</span>
            </button>
          </div>
        )}
      </div>

      {/* In-app Download PWA Action */}
      <div className="px-3 pt-2">
        <PWAInstallButton variant="sidebar" />
      </div>

      {/* Offline Status Footer Card */}
      <div className="p-3.5 m-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-200">Resonance Audio Engine</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">320kbps</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {offlineCount > 0
            ? `${offlineCount} tracks cached for full offline playback.`
            : 'Download your favorite tracks for offline listening.'}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col h-screen border-r border-white/[0.06]">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fadeIn">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
