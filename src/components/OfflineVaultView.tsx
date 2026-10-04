import React from 'react';
import {
  HardDriveDownload,
  Wifi,
  WifiOff,
  Play,
  Trash2,
  Share2,
  Heart,
  CheckCircle,
  Database,
  ArrowDownToLine,
} from 'lucide-react';
import { Track } from '../types/music';
import { OfflineStorageStats } from '../services/offlineStorage';

interface OfflineVaultViewProps {
  tracks: Track[];
  downloadedTrackIds: string[];
  stats: OfflineStorageStats;
  isOffline: boolean;
  onToggleOffline: () => void;
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onRemoveOfflineTrack: (trackId: string) => void;
  onDownloadAll: () => void;
  onToggleLike: (trackId: string) => void;
  onShareTrack: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
}

export const OfflineVaultView: React.FC<OfflineVaultViewProps> = ({
  tracks,
  downloadedTrackIds,
  stats,
  isOffline,
  onToggleOffline,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onRemoveOfflineTrack,
  onDownloadAll,
  onToggleLike,
  onShareTrack,
  isFavorite,
}) => {
  const offlineTracks = tracks.filter((t) => downloadedTrackIds.includes(t.id));
  const storagePercent = Math.min(100, (stats.totalSizeMb / stats.maxStorageMb) * 100);

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Persistent Storage
          </span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <HardDriveDownload className="w-8 h-8 text-amber-400" />
          <span>Offline Vault</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Zero buffer lag. Stream and replay downloaded tracks anywhere, whether in airplane mode or in remote areas.
        </p>
      </div>

      {/* Offline Mode Switch & Storage Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Offline Mode Status Banner */}
        <div
          className={`p-6 rounded-3xl border transition-all ${
            isOffline
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-white/[0.02] border-white/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isOffline ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {isOffline ? 'Offline Playback Mode' : 'Online Streaming Mode'}
                </h4>
                <p className="text-xs text-slate-400">
                  {isOffline
                    ? 'Playing from local IndexedDB cache & procedural engine'
                    : 'Network active. Ready to download any track'}
                </p>
              </div>
            </div>

            <button
              onClick={onToggleOffline}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all active:scale-95 ${
                isOffline
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                  : 'bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/[0.1]'
              }`}
            >
              {isOffline ? 'Switch Online' : 'Simulate Offline'}
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Resonance uses a dual-engine architecture: cached audio files play instantly, backed by our procedural Web Audio synthesizer so you never experience silence.
          </p>
        </div>

        {/* Local Storage Quota Card */}
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Vault Storage Allocation</span>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-semibold">
              {stats.totalSizeMb} MB / {stats.maxStorageMb} MB
            </span>
          </div>

          {/* Storage bar */}
          <div className="h-2 w-full bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, storagePercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{offlineTracks.length} tracks stored</span>
            <button
              onClick={onDownloadAll}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Download Full Catalog</span>
            </button>
          </div>
        </div>
      </div>

      {/* Offline Tracklist */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-white">Downloaded Tracks</h3>

        {offlineTracks.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.01]">
            <HardDriveDownload className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">Your Offline Vault is empty</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Download any song from the Daily Mix, Discover, or your Playlists to store it here for seamless offline listening.
            </p>
            <button
              onClick={onDownloadAll}
              className="mt-4 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20"
            >
              Download Recommended Tracks Now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden">
            {offlineTracks.map((track, i) => {
              const isCurrent = currentTrackId === track.id;
              const liked = isFavorite(track.id);

              return (
                <div
                  key={track.id}
                  className={`group flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors ${
                    isCurrent ? 'bg-cyan-500/10' : ''
                  }`}
                >
                  <div
                    onClick={() => onPlayTrack(track)}
                    className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                  >
                    <span className="w-5 text-center text-xs font-mono text-slate-500">
                      {i + 1}
                    </span>
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-cyan-300' : 'text-slate-100'
                        }`}
                      >
                        {track.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 w-36">
                    <span>{track.genre}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Cached
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 w-12 text-right">
                      {Math.floor(track.duration / 60)}:
                      {(track.duration % 60).toString().padStart(2, '0')}
                    </span>

                    <button
                      onClick={() => onToggleLike(track.id)}
                      className="p-1.5 text-slate-400 hover:text-pink-400 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${liked ? 'fill-pink-500 text-pink-500' : ''}`}
                      />
                    </button>

                    <button
                      onClick={() => onShareTrack(track)}
                      className="p-1.5 text-slate-400 hover:text-white transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onRemoveOfflineTrack(track.id)}
                      title="Remove from Offline Vault"
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
