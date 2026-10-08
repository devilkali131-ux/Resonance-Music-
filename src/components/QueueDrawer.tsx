import React from 'react';
import { X, ListMusic, Play, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Track } from '../types/music';
import { handleImageError } from '../utils/imageFallback';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: Track | null;
  queue: Track[];
  onPlayTrack: (track: Track) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
  onMoveQueueItem: (from: number, to: number) => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  currentTrack,
  queue,
  onPlayTrack,
  onRemoveFromQueue,
  onClearQueue,
  onMoveQueueItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-80 sm:w-96 bg-[#090b14]/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl flex flex-col select-none animate-slideLeft">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <ListMusic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Play Queue</h3>
            <p className="text-[11px] text-slate-400">{queue.length} upcoming tracks</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={onClearQueue}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Currently Playing */}
        {currentTrack && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Now Playing
            </span>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                onError={handleImageError}
                className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-cyan-300 truncate">{currentTrack.title}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentTrack.artist}</p>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/20">
                Playing
              </span>
            </div>
          </div>
        )}

        {/* Up Next List */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Up Next
          </span>
          {queue.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Queue is empty. Select any track to add.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04] bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden">
              {queue.map((track, i) => (
                <div
                  key={`${track.id}-${i}`}
                  className="group flex items-center justify-between p-3 hover:bg-white/[0.04] transition-colors"
                >
                  <div
                    onClick={() => onPlayTrack(track)}
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      onError={handleImageError}
                      className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate group-hover:text-cyan-300">
                        {track.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {i > 0 && (
                      <button
                        onClick={() => onMoveQueueItem(i, i - 1)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {i < queue.length - 1 && (
                      <button
                        onClick={() => onMoveQueueItem(i, i + 1)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onRemoveFromQueue(i)}
                      className="p-1 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
