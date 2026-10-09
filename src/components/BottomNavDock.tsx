import React from 'react';
import {
  Compass,
  Search,
  Library,
  SlidersHorizontal,
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
    <nav className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xs sm:max-w-sm rounded-full bg-[#0e101a]/90 border border-white/[0.14] backdrop-blur-3xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] p-1.5 select-none transition-all">
      {/* 4-Item Responsive Navigation Dock: Home, Search, Library, More */}
      <div className="flex items-center justify-between gap-1 w-full px-1">
        {/* 1. Home Tab: Expands to pill with label when active, icon only when inactive */}
        <button
          onClick={() => onTabChange('daily')}
          className={`flex items-center justify-center gap-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
            isHomeActive
              ? 'py-2 px-4 bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border border-cyan-400/40 text-cyan-200 shadow-lg shadow-cyan-500/20'
              : 'p-2.5 text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Home"
        >
          <Compass className={`w-4 h-4 transition-transform ${isHomeActive ? 'text-cyan-300 scale-105' : 'text-slate-400'}`} />
          {isHomeActive && <span>Home</span>}
        </button>

        {/* 2. Search Tab: Expands to pill with label when active, icon only when inactive */}
        <button
          onClick={() => onTabChange('search')}
          className={`flex items-center justify-center gap-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
            isSearchActive
              ? 'py-2 px-4 bg-gradient-to-r from-cyan-500/25 to-pink-500/25 border border-cyan-400/40 text-cyan-200 shadow-lg shadow-cyan-500/20'
              : 'p-2.5 text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Search Music"
        >
          <Search className={`w-4 h-4 transition-transform ${isSearchActive ? 'text-cyan-300 scale-105' : 'text-slate-400'}`} />
          {isSearchActive && <span>Search</span>}
        </button>

        {/* 3. Library Tab: Expands to pill with label when active, icon only when inactive */}
        <button
          onClick={() => onTabChange('library')}
          className={`flex items-center justify-center gap-2 rounded-full text-xs font-bold transition-all duration-300 relative cursor-pointer ${
            isLibraryActive
              ? 'py-2 px-4 bg-gradient-to-r from-purple-500/25 to-pink-500/25 border border-purple-400/40 text-purple-200 shadow-lg shadow-purple-500/20'
              : 'p-2.5 text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Library & Saved Collections"
        >
          <Library className={`w-4 h-4 transition-transform ${isLibraryActive ? 'text-purple-300 scale-105' : 'text-slate-400'}`} />
          {isLibraryActive && <span>Library</span>}
          {offlineCount > 0 && !isLibraryActive && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#0e101a] animate-pulse" />
          )}
        </button>

        {/* 4. Controls & Studio Options */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenMenuPopup?.();
          }}
          className={`p-2.5 rounded-full transition-all duration-300 cursor-pointer ${
            isMenuOpen
              ? 'bg-white/[0.15] text-cyan-300 shadow-md ring-1 ring-cyan-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Studio & Quick Menu"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
