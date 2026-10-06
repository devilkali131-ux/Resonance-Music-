import React from 'react';
import {
  Home,
  Search,
  Library,
  MoreHorizontal,
} from 'lucide-react';
import { ActiveTab } from '../types/music';

interface BottomNavDockProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenMenuPopup?: () => void;
  isMenuOpen?: boolean;
  offlineCount?: number;
}

export const BottomNavDock: React.FC<BottomNavDockProps> = ({
  activeTab,
  onTabChange,
  onOpenMenuPopup,
  isMenuOpen = false,
  offlineCount = 0,
}) => {
  const isHomeActive = activeTab === 'daily';
  const isSearchActive = activeTab === 'search' || activeTab === 'discover';
  const isLibraryActive = activeTab === 'library' || activeTab === 'favorites';

  return (
    <nav className="fixed bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2.5rem)] max-w-xs sm:max-w-sm rounded-full bg-[#14151b]/95 border border-white/[0.12] backdrop-blur-2xl shadow-2xl shadow-black/90 p-1.5 select-none transition-all">
      {/* 4-Item Responsive Navigation Dock: Home, Search, Library, More */}
      <div className="flex items-center justify-between gap-1 w-full px-1">
        {/* 1. Home Tab: Expands to pill with label when active, icon only when inactive */}
        <button
          onClick={() => onTabChange('daily')}
          className={`flex items-center justify-center gap-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            isHomeActive
              ? 'py-2 px-4 bg-[#282a35] text-white shadow-md'
              : 'p-2.5 text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Home"
        >
          <Home className={`w-4 h-4 ${isHomeActive ? 'text-white' : 'text-slate-400'}`} />
          {isHomeActive && <span>Home</span>}
        </button>

        {/* 2. Search Tab: Expands to pill with label when active, icon only when inactive */}
        <button
          onClick={() => onTabChange('search')}
          className={`flex items-center justify-center gap-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            isSearchActive
              ? 'py-2 px-4 bg-[#282a35] text-white shadow-md'
              : 'p-2.5 text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Search Music"
        >
          <Search className={`w-4 h-4 ${isSearchActive ? 'text-white' : 'text-slate-400'}`} />
          {isSearchActive && <span>Search</span>}
        </button>

        {/* 3. Library Tab: Expands to pill with label when active, icon only when inactive */}
        <button
          onClick={() => onTabChange('library')}
          className={`flex items-center justify-center gap-2 rounded-full text-xs font-bold transition-all relative cursor-pointer ${
            isLibraryActive
              ? 'py-2 px-4 bg-[#282a35] text-white shadow-md'
              : 'p-2.5 text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Library & Playlists"
        >
          <Library className={`w-4 h-4 ${isLibraryActive ? 'text-white' : 'text-slate-400'}`} />
          {isLibraryActive && <span>Library</span>}
          {offlineCount > 0 && !isLibraryActive && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#14151b]" />
          )}
        </button>

        {/* 4. Three Dots More Options (•••) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenMenuPopup?.();
          }}
          className={`p-2.5 rounded-full transition-all cursor-pointer ${
            isMenuOpen
              ? 'bg-[#282a35] text-cyan-300 shadow-md ring-1 ring-cyan-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="More Options & Menu"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
