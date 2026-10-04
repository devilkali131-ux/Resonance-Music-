import React, { useState } from 'react';
import { X, Plus, Music, Check } from 'lucide-react';
import { Playlist, Track } from '../types/music';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTracks: Track[];
  onCreate: (playlist: Playlist) => void;
}

const GRADIENTS = [
  'linear-gradient(135deg, #090a0f 0%, #1e1b4b 60%, #00f0ff 100%)',
  'linear-gradient(135deg, #0f0a1c 0%, #4c1d95 60%, #8b5cf6 100%)',
  'linear-gradient(135deg, #1c0a00 0%, #7c2d12 60%, #f59e0b 100%)',
  'linear-gradient(135deg, #061a14 0%, #064e3b 60%, #10b981 100%)',
  'linear-gradient(135deg, #1f0814 0%, #831843 60%, #ec4899 100%)',
];

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  availableTracks,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleTrack = (id: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlaylist: Playlist = {
      id: `playlist-custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom curated collection.',
      coverGradient: selectedGradient,
      trackIds: selectedTrackIds.length > 0 ? selectedTrackIds : availableTracks.slice(0, 4).map((t) => t.id),
      createdAt: 'Just now',
      playCount: 0,
      isAiGenerated: false,
    };

    onCreate(newPlaylist);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-lg bg-[#090b14] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create New Playlist</h3>
              <p className="text-xs text-slate-400">Curate and organize your favorite audio tracks</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Playlist Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Midnight Cyber Run"
              className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Heavy synthesizer beats for nighttime workouts"
              className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Gradient theme selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cover Visual Theme
            </label>
            <div className="flex gap-2">
              {GRADIENTS.map((g, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedGradient(g)}
                  className={`w-9 h-9 rounded-xl cursor-pointer border-2 transition-transform ${
                    selectedGradient === g
                      ? 'scale-110 border-white shadow-lg'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  style={{ background: g }}
                />
              ))}
            </div>
          </div>

          {/* Select Tracks */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Add Initial Tracks ({selectedTrackIds.length} selected)
            </label>
            <div className="max-h-40 overflow-y-auto divide-y divide-white/[0.04] border border-white/[0.06] rounded-xl bg-white/[0.01]">
              {availableTracks.map((track) => {
                const isSelected = selectedTrackIds.includes(track.id);
                return (
                  <div
                    key={track.id}
                    onClick={() => toggleTrack(track.id)}
                    className="flex items-center justify-between p-2.5 hover:bg-white/[0.03] cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-7 h-7 rounded-md object-cover flex-shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-white truncate">{track.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                          : 'border-white/[0.1] text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
