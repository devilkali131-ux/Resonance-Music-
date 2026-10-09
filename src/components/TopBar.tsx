import React, { useRef } from 'react';
import {
  Search,
  Share2,
  Users,
  Shield,
  LogIn,
  Sliders,
} from 'lucide-react';
import { historyStorage, UserProfile } from '../services/historyStorage';

interface TopBarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
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

export const TopBar: React.FC<TopBarProps> = ({
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

  // Owner authentication check - strictly visible ONLY when logged in from owner's email id
  const isOwner =
    currentProfile.isLoggedIn &&
    currentProfile.email.toLowerCase().trim() === 'devilkali131@gmail.com';

  const logoClicksRef = useRef<number[]>([]);

  const logoClicksRef = useRef<number[]>([]);

  const handleLogoClick = () => {
    const now = Date.now();
    logoClicksRef.current = [...logoClicksRef.current.filter((t) => now - t < 1500), now];
    if (logoClicksRef.current.length >= 3) {
      logoClicksRef.current = [];
      if (onOpenOwnerPortal) {
        onOpenOwnerPortal();
        return;
      }
    }
    if (onNavigateTab) onNavigateTab('daily');
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

      {/* Clean Center Stage Indicator - Free of search bar clutter */}
      <div className="flex-1 flex items-center justify-center">
        {activeTab === 'search' || activeTab === 'discover' ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 text-xs font-mono font-medium">
            <Search className="w-3.5 h-3.5" />
            <span>Search & Discover Hub</span>
          </span>
        ) : activeTab === 'library' || activeTab === 'favorites' ? (
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-400 tracking-wide font-mono uppercase">
            Your Library & Collections
          </span>
        ) : null}
      </div>

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
