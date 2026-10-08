import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Heart,
  Trash2,
  FileText,
  RotateCcw,
  Sparkles,
  Music,
} from 'lucide-react';
import { Track } from '../types/music';
import { historyStorage, HistoryItem } from '../services/historyStorage';
import { AmbientArtGlow } from './AmbientArtGlow';
import { handleImageError } from '../utils/imageFallback';

interface HistoryViewProps {
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onToggleLike: (trackId: string) => void;
  onOpenLyrics?: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
}

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onToggleLike,
  onOpenLyrics,
  isFavorite,
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistoryItems(historyStorage.getHistory());
  }, [currentTrackId]);

  const handleClearHistory = () => {
    if (confirm('Clear all listening history?')) {
      historyStorage.clearHistory();
      setHistoryItems([]);
    }
  };

  const handleRemoveItem = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyStorage.removeFromHistory(trackId);
    setHistoryItems(updated);
  };

  return (
    <div className="space-y-6 pb-40 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0d0f1a]/85 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Listening History
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                {historyItems.length} tracks
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracks you've recently streamed across Resonance Music.
            </p>
          </div>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 border border-white/[0.08] hover:border-rose-500/40 text-xs font-semibold transition-all self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History Items List */}
      {historyItems.length > 0 ? (
        <div className="space-y-2.5">
          {historyItems.map((item, idx) => {
            const track = item.track;
            const isCurrent = currentTrackId === track.id;
            const liked = isFavorite(track.id);

            return (
              <div
                key={item.id || idx}
                onClick={() => onPlayTrack(track)}
                className={`flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#0c0e18]/80 hover:bg-white/[0.06] border border-white/[0.06] hover:border-cyan-500/40 transition-all cursor-pointer group shadow-md ${
                  isCurrent ? 'bg-cyan-500/10 border-cyan-400/40 ring-1 ring-cyan-400/30' : ''
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Track Thumbnail */}
                  <AmbientArtGlow
                    coverUrl={track.coverUrl}
                    accentColor={track.accentColor}
                    isPlaying={isCurrent && isPlaying}
                    glowIntensity="subtle"
                    className="flex-shrink-0"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/[0.1]">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        onError={handleImageError}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div
                        className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                          isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Play className="w-4 h-4 text-cyan-300 fill-current ml-0.5" />
                      </div>
                    </div>
                  </AmbientArtGlow>

                  {/* Title & Artist */}
                  <div className="min-w-0 flex-1">
                    <h4
                      className={`text-sm font-bold truncate ${
                        isCurrent ? 'text-cyan-300' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                </div>

                {/* Right metadata & actions */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] font-mono text-slate-400 block">
                      {formatRelativeTime(item.playedAt)}
                    </span>
                    {item.playCount > 1 && (
                      <span className="text-[10px] text-cyan-400 font-mono">
                        Played {item.playCount}x
                      </span>
                    )}
                  </div>

                  {onOpenLyrics && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenLyrics(track);
                      }}
                      title="View Lyrics"
                      className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/[0.06] rounded-xl transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(track.id);
                    }}
                    title="Like"
                    className="p-1.5 text-slate-400 hover:text-pink-400 hover:bg-white/[0.06] rounded-xl transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-pink-500 text-pink-500' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => handleRemoveItem(track.id, e)}
                    title="Remove from history"
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-white/[0.06] rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-[#0c0e18]/60 border border-white/[0.06] space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-500">
            <Music className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No listening history yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Play your favorite English and Hindi tracks from the Home or Search tabs to build your listening history.
          </p>
        </div>
      )}
    </div>
  );
};
