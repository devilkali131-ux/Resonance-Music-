import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, CheckCircle2, Music, Loader2, Disc } from 'lucide-react';
import { externalMusicService } from '../services/externalMusicService';
import { Playlist, Track } from '../types/music';

interface SpotifySyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (playlist: Playlist, tracks: Track[]) => void;
}

export const SpotifySyncModal: React.FC<SpotifySyncModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setSuccessCount(null);

    try {
      const res = await externalMusicService.importSpotify(inputVal.trim());
      if (res && res.success && res.tracks && res.tracks.length > 0) {
        const newPlaylist: Playlist = {
          id: `spot-sync-${Date.now()}`,
          name: res.playlistName || 'Spotify Imported Mix',
          description: `Fast-synced directly from Spotify with real-time stream matching.`,
          tagline: 'Spotify Fast Sync',
          accentColor: '#1db954',
          coverGradient: 'linear-gradient(135deg, #090a0f 0%, #064e3b 50%, #1db954 100%)',
          trackIds: res.tracks.map((t) => t.id),
          isAiGenerated: false,
          createdAt: new Date().toISOString(),
          playCount: 1,
        };

        setSuccessCount(res.tracks.length);
        setTimeout(() => {
          onImportComplete(newPlaylist, res.tracks);
          setIsLoading(false);
          setInputVal('');
          onClose();
        }, 1200);
      } else {
        setErrorMsg('Could not find tracks matching this link or query. Please try another name.');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMsg('Failed to sync from Spotify. Please check network connection.');
      setIsLoading(false);
    }
  };

  const quickPicks = [
    { title: "Today's Top Hits", tag: 'Global' },
    { title: 'Synthwave & Retrowave', tag: 'Electronic' },
    { title: 'Chill Lo-Fi Study Beats', tag: 'Focus' },
    { title: 'Deep House Relax', tag: 'Groove' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0c0e17] border border-white/[0.1] p-6 sm:p-8 shadow-2xl shadow-black/90">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#1db954]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1db954]/20 border border-[#1db954]/30 flex items-center justify-center">
            <Disc className="w-6 h-6 text-[#1db954]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Spotify Fast Sync</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/30">
                Resonance Feature
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly sync Spotify tracks & playlists with playable YouTube Music streams
            </p>
          </div>
        </div>

        {/* Sync Form */}
        <form onSubmit={handleSync} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Spotify Link, Playlist Name, or Search Query
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. https://open.spotify.com/playlist/... or 'Today’s Top Hits'"
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.1] text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#1db954] focus:bg-white/[0.07] transition-all"
              autoFocus
            />
          </div>

          {/* Quick suggestions */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400">Quick suggestions:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickPicks.map((pick) => (
                <button
                  type="button"
                  key={pick.title}
                  onClick={() => setInputVal(pick.title)}
                  className="px-2.5 py-1 rounded-xl text-xs bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <span>{pick.title}</span>
                  <span className="text-[9px] text-[#1db954] font-mono">({pick.tag})</span>
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {successCount !== null && (
            <div className="p-3 rounded-xl bg-[#1db954]/15 border border-[#1db954]/30 text-[#1db954] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Successfully synced {successCount} tracks! Opening in library...</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1db954] text-slate-950 hover:bg-[#1ed760] disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-[#1db954]/25 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Syncing & Matching...</span>
                </>
              ) : (
                <>
                  <span>Fast Sync Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
