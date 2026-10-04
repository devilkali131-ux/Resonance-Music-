import React from 'react';
import { X, Users, Radio, Play, Sparkles } from 'lucide-react';
import { FriendActivity, Track } from '../types/music';

interface FriendActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  friends: FriendActivity[];
  tracks: Track[];
  onListenAlong: (track: Track) => void;
}

export const FriendActivityDrawer: React.FC<FriendActivityDrawerProps> = ({
  isOpen,
  onClose,
  friends,
  tracks,
  onListenAlong,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-80 bg-[#090b14]/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl flex flex-col select-none animate-slideLeft">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Friend Activity</h3>
            <p className="text-[11px] text-slate-400">Live social sessions & listen along</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Friends Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {friends.map((friend) => {
          const track = tracks.find((t) => t.id === friend.currentTrackId);
          if (!track) return null;

          return (
            <div
              key={friend.id}
              className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] space-y-3 transition-colors"
            >
              {/* User info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={friend.avatar}
                      alt={friend.userName}
                      className="w-9 h-9 rounded-full object-cover border border-white/[0.1]"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#090b14]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{friend.userName}</h4>
                    <span className="text-[10px] text-slate-400">{friend.startedAgo}</span>
                  </div>
                </div>

                {friend.isPartyHost && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 animate-pulse" /> Party
                  </span>
                )}
              </div>

              {/* Current Track & Listen Along */}
              <div className="flex items-center gap-3 p-2 rounded-xl bg-black/40 border border-white/[0.04]">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                </div>

                <button
                  onClick={() => onListenAlong(track)}
                  title="Listen along together in sync"
                  className="flex-shrink-0 px-2.5 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-[11px] rounded-lg transition-transform active:scale-95 flex items-center gap-1 shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Join</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
