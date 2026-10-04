import React, { useState } from 'react';
import {
  Home,
  Search,
  Mic,
  Library,
  MoreHorizontal,
} from 'lucide-react';
import { ActiveTab } from '../types/music';

interface BottomNavDockProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenMenuPopup?: () => void;
  onVoiceSearch?: (transcript: string) => void;
  isMenuOpen?: boolean;
  offlineCount?: number;
}

export const BottomNavDock: React.FC<BottomNavDockProps> = ({
  activeTab,
  onTabChange,
  onOpenMenuPopup,
  onVoiceSearch,
  isMenuOpen = false,
  offlineCount = 0,
}) => {
  const isHomeActive = activeTab === 'daily';
  const isSearchActive = activeTab === 'search' || activeTab === 'discover';
  const isLibraryActive = activeTab === 'library' || activeTab === 'favorites';

  const [isListening, setIsListening] = useState(false);

  const handleMicClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check for web speech recognition support in modern browsers
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback: directly navigate to search tab
      onTabChange('search');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          onTabChange('search');
          if (onVoiceSearch) {
            onVoiceSearch(transcript);
          }
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        onTabChange('search');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      onTabChange('search');
    }
  };

  return (
    <nav className="fixed bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm rounded-full bg-[#14151b]/95 border border-white/[0.12] backdrop-blur-2xl shadow-2xl shadow-black/90 p-1.5 select-none transition-all">
      {/* 5-Item Responsive Dock Navigation matching video specifications */}
      <div className="flex items-center justify-between gap-1 w-full px-1">
        {/* 1. Home Tab: Expands to pill with label when active, icon only when inactive */}
        <button
          onClick={() => onTabChange('daily')}
          className={`flex items-center justify-center gap-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            isHomeActive
              ? 'py-2 px-3.5 sm:px-4 bg-[#282a35] text-white shadow-md'
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
              ? 'py-2 px-3.5 sm:px-4 bg-[#282a35] text-white shadow-md'
              : 'p-2.5 text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Search Music"
        >
          <Search className={`w-4 h-4 ${isSearchActive ? 'text-white' : 'text-slate-400'}`} />
          {isSearchActive && <span>Search</span>}
        </button>

        {/* 3. Voice Search / Mic Button */}
        <button
          onClick={handleMicClick}
          className={`p-2.5 rounded-full transition-all cursor-pointer relative ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title={isListening ? 'Listening to voice...' : 'Voice Search'}
        >
          <Mic className={`w-4 h-4 ${isListening ? 'text-white' : 'text-slate-400'}`} />
          {isListening && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
          )}
        </button>

        {/* 4. Library Tab: Expands to pill with label when active, icon only when inactive */}
        <button
          onClick={() => onTabChange('library')}
          className={`flex items-center justify-center gap-2 rounded-full text-xs font-bold transition-all relative cursor-pointer ${
            isLibraryActive
              ? 'py-2 px-3.5 sm:px-4 bg-[#282a35] text-white shadow-md'
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

        {/* 5. Three Dots More Options (•••) - Opens/toggles BottomMenuPopup */}
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
