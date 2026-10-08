import React from 'react';
import {
  Play,
  Shuffle,
  Music,
  Heart,
  Download,
  Share2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Playlist, Track } from '../types/music';
import { handleImageError } from '../utils/imageFallback';

interface PlaylistDetailViewProps {
  playlist: Playlist;
  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onBack: () => void;
  onPlayTrack: (track: Track) => void;
  onPlayAll: (tracks: Track[], shuffle?: boolean) => void;
  onToggleLike: (trackId: string) => void;
  onDownloadTrack: (track: Track) => void;
  onSharePlaylist: (playlist: Playlist) => void;
  onShareTrack: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
  isDownloaded: (trackId: string) => boolean;
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
  playlist,
  tracks,
  currentTrackId,
  isPlaying,
  onBack,
  onPlayTrack,
  onPlayAll,
  onToggleLike,
  onDownloadTrack,
  onSharePlaylist,
  onShareTrack,
  isFavorite,
  isDownloaded,
}) => {
  const playlistTracks = (playlist?.trackIds || [])
    .map((id) => (tracks || []).find((t) => t && t.id === id))
    .filter(Boolean) as Track[];

  const totalDuration = playlistTracks.reduce((acc, t) => acc + (t?.duration || 0), 0);
  const totalMins = Math.round(totalDuration / 60);

  return (
    <div className="space-y-8 pb-32">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Library</span>
      </button>

      {/* Playlist Hero */}
      <section className="flex flex-col sm:flex-row items-start sm:items-end gap-6 p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] shadow-xl relative overflow-hidden">
        <div
          className="w-40 h-40 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-2xl border border-white/[0.1] relative overflow-hidden"
          style={{ background: playlist.coverGradient || 'linear-gradient(135deg, #090a0f, #1e1b4b)' }}
        >
          {playlist.coverUrl ? (
            <img
              src={playlist.coverUrl}
              alt={playlist.name}
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music className="w-16 h-16 text-white/80" />
          )}
        </div>

        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Playlist
            </span>
            {playlist.isAiGenerated && (
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                <Sparkles className="w-3 h-3 text-cyan-400" /> ML Curated
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {playlist.name}
          </h1>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {playlist.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
            <span>{playlistTracks.length} tracks</span>
            <span aria-hidden="true">·</span>
            <span>{totalMins} minutes</span>
            <span aria-hidden="true">·</span>
            <span>Created {playlist.createdAt}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onPlayAll(playlistTracks, false)}
              className="flex items-center gap-2 px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play All</span>
            </button>

            <button
              onClick={() => onPlayAll(playlistTracks, true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-xs rounded-xl border border-white/[0.08] active:scale-95 transition-all"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>

            <button
              onClick={() => onSharePlaylist(playlist)}
              className="p-2.5 text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-xl border border-white/[0.06] transition-all ml-auto"
              title="Share Playlist"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Tracklist Table */}
      <section className="divide-y divide-white/[0.04] bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden">
        {playlistTracks.map((track, i) => {
          const isCurrent = currentTrackId === track.id;
          const liked = isFavorite(track.id);
          const downloaded = isDownloaded(track.id);

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
                <span className="w-5 text-center text-xs font-mono text-slate-500 group-hover:hidden">
                  {i + 1}
                </span>
                <span className="hidden group-hover:flex w-5 h-5 items-center justify-center text-cyan-400">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </span>

                <img
                  src={track.coverUrl}
                  alt={track.title}
                  onError={handleImageError}
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
                <span>{track.bpm} BPM</span>
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
                  onClick={() => onDownloadTrack(track)}
                  title={downloaded ? 'Downloaded offline' : 'Download track'}
                  className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {downloaded ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => onShareTrack(track)}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
