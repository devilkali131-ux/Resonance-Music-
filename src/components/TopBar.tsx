import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Share2,
  X,
  Clock,
  TrendingUp,
  Activity,
  Users,
  Shield,
  ArrowUpRight,
  LogIn,
  Sliders,
  Smartphone,
  Download,
} from 'lucide-react';
import { externalMusicService } from '../services/externalMusicService';
import { historyStorage, UserProfile } from '../services/historyStorage';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit?: (q: string) => void;
  onNavigateTab?: (tab: string) => void;
  onToggleFriendDrawer?: () => void;
  onOpenOwnerPortal?: () => void;
  onOpenShareModal?: () => void;
  onOpenGoogleAuth?: () => void;
  onOpenEqualizer?: () => void;
  onOpenApkModal?: () => void;
  activeTab?: string;
  userProfile?: UserProfile;
}

const TRENDING_SUGGESTIONS = [
  'Die With A Smile',
  'Starboy',
  'Blinding Lights',
  'Espresso',
  'Birds of a Feather',
  'Kesariya',
  'Lut Gaye',
  'Chaleya',
];

const STORAGE_KEY_SEARCH_HISTORY = 'veltra_search_history';

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onNavigateTab,
  onToggleFriendDrawer,
  onOpenOwnerPortal,
  onOpenShareModal,
  onOpenGoogleAuth,
  onOpenEqualizer,
  onOpenApkModal,
  activeTab = 'daily',
  userProfile: propUserProfile,
}) => {
  const currentProfile = propUserProfile || historyStorage.getUserProfile();
  const isHomeTab = activeTab === 'daily';
  const isSearchTab = activeTab === 'search' || activeTab === 'discover';

  // Owner authentication check - strictly visible ONLY when logged in from owner's email id
  const isOwner =
    currentProfile.isLoggedIn &&
    currentProfile.email.toLowerCase().trim() === 'devilkali131@gmail.com';

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleLogoClick = () => {
    if (onNavigateTab) onNavigateTab('daily');
  };

  // Load search history from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEARCH_HISTORY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  const saveToHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    try {
      const updated = [
        trimmed,
        ...history.filter((h) => h.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, 8);
      setHistory(updated);
      localStorage.setItem(STORAGE_KEY_SEARCH_HISTORY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = history.filter((h) => h !== item);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SEARCH_HISTORY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Live dictionary search suggestions debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    const timer = setTimeout(() => {
      externalMusicService
        .getSuggestions(searchQuery)
        .then((res) => {
          setSuggestions(res);
          setIsLoadingSuggestions(false);
        })
        .catch(() => {
          setIsLoadingSuggestions(false);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTerm = (term: string) => {
    saveToHistory(term);
    onSearchChange(term);
    if (onSearchSubmit) {
      onSearchSubmit(term);
    }
    setIsDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        handleSelectTerm(searchQuery.trim());
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2.5 sm:gap-6 px-3.5 sm:px-8 py-2.5 sm:py-3 bg-[#070914]/90 backdrop-blur-2xl border-b border-cyan-500/20 shadow-lg shadow-black/50 select-none">
      {/* Brand Identity & Logo (Left) - Always prominently shows App Name on Home Tab across all devices */}
      {/* Triple-click logo secretly unlocks Owner Access Portal for the owner */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        <div
          className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-2xl overflow-hidden bg-black/50 border border-cyan-400/30 flex items-center justify-center shadow-lg shadow-cyan-500/20 group cursor-pointer"
          onClick={handleLogoClick}
          title="Resonance Music Home"
        >
          <img
            src="/resonance-logo.svg"
            alt="Resonance Music"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <div
          className="cursor-pointer"
          onClick={handleLogoClick}
        >
          <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
            Resonance
            <span className="text-[9px] sm:text-[10px] uppercase font-mono px-1.5 sm:px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-pink-500/20 text-cyan-300 border border-cyan-400/40">
              Music
            </span>
          </h1>
          <p className="text-[10px] text-slate-400 hidden sm:block">Pure Stream & Studio Sound</p>
        </div>
      </div>

      {/* Clean Search Bar: ONLY on Search & Discover tabs, hidden on Home and Library */}
      {isSearchTab ? (
        <div ref={containerRef} className="relative flex-1 max-w-xl mx-1 sm:mx-4 animate-fadeIn">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsDropdownOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search songs, artists, albums, or lyrics..."
              className="w-full pl-10 pr-12 py-2 sm:py-2.5 text-xs sm:text-sm bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.14] border border-white/25 focus:border-cyan-400 rounded-2xl text-white placeholder:text-slate-400 focus:outline-none transition-all shadow-inner focus:ring-1 focus:ring-cyan-400/40"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  onSearchChange('');
                  setSuggestions([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white/[0.04] rounded border border-white/[0.08]">
                ↵
              </kbd>
            )}
          </div>

          {/* Live Search Dictionary Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-[#0c0e18]/95 border border-white/[0.12] rounded-2xl shadow-2xl backdrop-blur-3xl z-50 overflow-hidden animate-fadeIn max-h-80 overflow-y-auto scrollbar-none">
              {/* Live Autocomplete Suggestions */}
              {suggestions.length > 0 && (
                <div className="px-2 pb-2">
                  <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                    <span>Suggestions</span>
                    {isLoadingSuggestions && <span className="animate-pulse">Loading...</span>}
                  </div>
                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectTerm(item)}
                      className="flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:text-white hover:bg-cyan-500/15 rounded-xl cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Search className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Search History */}
              {history.length > 0 && (
                <div className="px-2 pt-1 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    <span>Recent Searches</span>
                    <button
                      onClick={() => {
                        setHistory([]);
                        localStorage.removeItem(STORAGE_KEY_SEARCH_HISTORY);
                      }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  {history.map((term) => (
                    <div
                      key={term}
                      onClick={() => handleSelectTerm(term)}
                      className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{term}</span>
                      </div>
                      <button
                        onClick={(e) => clearHistoryItem(e, term)}
                        className="p-1 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Popular Trending Quick Chips */}
              <div className="px-3 pt-2 pb-1 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                  <TrendingUp className="w-3 h-3 text-amber-400" />
                  <span>Trending Searches</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SUGGESTIONS.map((trend) => (
                    <button
                      key={trend}
                      onClick={() => handleSelectTerm(trend)}
                      className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/[0.06] text-xs text-slate-300 transition-all cursor-pointer"
                    >
                      {trend}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Right Actions: Equalizer Pop-up, Jam with Friends, Owner Portal, and Sign In Button */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 z-20">
        {/* Audio Equalizer Pop-up Button */}
        {onOpenEqualizer && (
          <button
            onClick={onOpenEqualizer}
            title="Audio Equalizer (Pop-up)"
            className="hidden xs:flex sm:flex p-2 text-slate-300 hover:text-cyan-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-full transition-all cursor-pointer flex-shrink-0"
          >
            <Sliders className="w-4 h-4" />
          </button>
        )}

        {/* Share Button (High Visibility) */}
        {onOpenShareModal && (
          <button
            onClick={onOpenShareModal}
            title="Share Song & App"
            className="p-2 text-slate-300 hover:text-cyan-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-full transition-all cursor-pointer shadow-sm active:scale-95 flex-shrink-0"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}

        {/* Jam with Friends (Live Sync) */}
        {onToggleFriendDrawer && (
          <button
            onClick={onToggleFriendDrawer}
            title="Jam with Friends (Live Sync)"
            className="p-2 text-slate-300 hover:text-cyan-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-full transition-all relative cursor-pointer flex-shrink-0"
          >
            <Users className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#070914] animate-pulse" />
          </button>
        )}

        {/* Owner Access Portal Button - HIDDEN for normal users, only visible when logged in as owner */}
        {isOwner && onOpenOwnerPortal && (
          <button
            onClick={onOpenOwnerPortal}
            title="Owner Access Portal (Account Recovery & Management)"
            className="p-2 text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 rounded-full transition-all cursor-pointer animate-fadeIn flex-shrink-0"
          >
            <Shield className="w-4 h-4" />
          </button>
        )}

        {/* Download App / Android APK Button (Available on larger screens) */}
        {!isHomeTab && onOpenApkModal && (
          <button
            onClick={onOpenApkModal}
            title="Download App (Android APK & PWA)"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 transition-all text-xs font-bold active:scale-95 cursor-pointer shadow-sm flex-shrink-0"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Get App</span>
          </button>
        )}

        {/* HIGH-VISIBILITY SIGN IN / USER PROFILE BUTTON (GUARANTEED 100% VISIBLE ON ALL SCREENS) */}
        <button
          onClick={onOpenGoogleAuth || onOpenOwnerPortal}
          className={`flex items-center gap-1.5 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer flex-shrink-0 shadow-lg whitespace-nowrap ${
            currentProfile.isLoggedIn
              ? 'px-2.5 sm:px-3 bg-white/[0.08] hover:bg-white/[0.14] border border-cyan-400/50 text-white'
              : 'px-3 sm:px-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black shadow-cyan-400/30'
          }`}
          title={
            currentProfile.isLoggedIn
              ? `Signed in as ${currentProfile.name} (Click to Switch Account)`
              : 'Sign In to Account'
          }
        >
          {currentProfile.isLoggedIn ? (
            <>
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center font-black text-[10px] text-slate-950 flex-shrink-0">
                {currentProfile.initials || 'U'}
              </div>
              <span className="text-xs font-bold text-white max-w-[60px] sm:max-w-[100px] truncate">
                {currentProfile.name.split(' ')[0]}
              </span>
            </>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5 text-slate-950 stroke-[3] flex-shrink-0" />
              <span className="text-xs font-black text-slate-950 tracking-tight">
                Sign In
              </span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
