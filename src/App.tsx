import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WifiOff } from 'lucide-react';
import { INITIAL_TRACKS, INITIAL_PLAYLISTS } from './data/catalog';
import { ActiveTab, DailyMix, EqualizerState, Playlist, SonicPersona, Track } from './types/music';
import { audioEngine } from './services/audioEngine';
import { offlineStorage, OfflineStorageStats } from './services/offlineStorage';
import { mlService } from './services/mlService';
import { externalMusicService } from './services/externalMusicService';
import { historyStorage, UserProfile } from './services/historyStorage';

// UI Components
import { TopBar } from './components/TopBar';
import { PlayerBar } from './components/PlayerBar';
import { BottomNavDock } from './components/BottomNavDock';
import { BottomMenuPopup } from './components/BottomMenuPopup';
import { DailyMixView } from './components/DailyMixView';
import { DiscoverView } from './components/DiscoverView';
import { HistoryView } from './components/HistoryView';
import { MLPlaylistStudio } from './components/MLPlaylistStudio';
import { LibraryView } from './components/LibraryView';
import { PlaylistDetailView } from './components/PlaylistDetailView';
import { ImmersivePlayerModal } from './components/ImmersivePlayerModal';
import { SocialShareModal } from './components/SocialShareModal';
import { FriendActivityDrawer } from './components/FriendActivityDrawer';
import { QueueDrawer } from './components/QueueDrawer';
import { SonicPersonaModal } from './components/SonicPersonaModal';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { SpotifySyncModal } from './components/SpotifySyncModal';
import { GoogleAuthImporterModal } from './components/GoogleAuthImporterModal';
import { EqualizerModal } from './components/EqualizerModal';
import { OwnerAccessPortalModal } from './components/OwnerAccessPortalModal';
import { ApkDownloadModal } from './components/ApkDownloadModal';

export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<ActiveTab>('daily');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playingPlaylist, setPlayingPlaylist] = useState<Playlist | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Catalog & Playlists state
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [dailyMix, setDailyMix] = useState<DailyMix | null>(null);
  const [isRegeneratingDaily, setIsRegeneratingDaily] = useState(false);

  // Playback state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(INITIAL_TRACKS[0].duration);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isSynthesizedFallback, setIsSynthesizedFallback] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);

  // Sleep Timer state
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemainingSec, setSleepTimerRemainingSec] = useState<number | null>(null);

  // Equalizer State
  const [equalizer, setEqualizer] = useState<EqualizerState>({
    bass: 0,
    mid: 0,
    treble: 0,
    surround: false,
  });

  // Automatic Offline Detection & Restriction
  const [isDeviceOffline, setIsDeviceOffline] = useState(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsDeviceOffline(false);
      setOfflineNotice(null);
    };
    const handleOffline = () => {
      setIsDeviceOffline(true);
      setOfflineNotice('You are offline. Only downloaded music can be played.');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Offline Management state
  const [downloadedTrackIds, setDownloadedTrackIds] = useState<string[]>(
    offlineStorage.getDownloadedTrackIds()
  );
  const [downloadingTrackId, setDownloadingTrackId] = useState<string | null>(null);
  const [storageStats, setStorageStats] = useState<OfflineStorageStats>(
    offlineStorage.getStorageStats(tracks)
  );

  // Modals & Panels state
  const [isImmersiveOpen, setIsImmersiveOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isFriendDrawerOpen, setIsFriendDrawerOpen] = useState(false);
  const [isSonicPersonaOpen, setIsSonicPersonaOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isBottomMenuOpen, setIsBottomMenuOpen] = useState(false);
  const [isSpotifySyncOpen, setIsSpotifySyncOpen] = useState(false);
  const [isGoogleAuthOpen, setIsGoogleAuthOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isOwnerPortalOpen, setIsOwnerPortalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => historyStorage.getUserProfile());
  const [shareTargetTrack, setShareTargetTrack] = useState<Track | null>(null);
  const [shareTargetPlaylist, setShareTargetPlaylist] = useState<Playlist | null>(null);

  // User Profile & ML Persona
  const [persona, setPersona] = useState<SonicPersona | null>(null);
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<string[]>(
    mlService.getFavoriteTrackIds()
  );

  const likedPlaylist: Playlist = useMemo(
    () => ({
      id: 'favorites-playlist',
      name: 'Liked Songs',
      description: 'Your collection of loved and favorited tracks.',
      tagline: 'Favorites',
      accentColor: '#ec4899',
      coverGradient: 'linear-gradient(135deg, #831843 0%, #be185d 50%, #ec4899 100%)',
      trackIds: favoriteTrackIds,
      isAiGenerated: false,
      createdAt: 'Favorites',
      playCount: favoriteTrackIds.length,
    }),
    [favoriteTrackIds]
  );

  const downloadedPlaylist: Playlist = useMemo(
    () => ({
      id: 'downloaded-playlist',
      name: 'Downloaded Music',
      description: 'Songs saved offline to your device for playback without internet.',
      tagline: 'Offline Available',
      accentColor: '#10b981',
      coverGradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)',
      trackIds: downloadedTrackIds,
      isAiGenerated: false,
      createdAt: 'Offline Cache',
      playCount: downloadedTrackIds.length,
    }),
    [downloadedTrackIds]
  );

  // Sync Audio Engine state
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((event) => {
      setCurrentTime(event.currentTime);
      if (event.duration > 0) setDuration(event.duration);
      setIsPlaying(event.isPlaying);
      setBuffered(event.buffered);
      setIsSynthesizedFallback(!!event.isSynthesizedFallback);
      if (event.sleepTimerMinutes !== undefined) setSleepTimerMinutes(event.sleepTimerMinutes);
      if (event.sleepTimerRemainingSec !== undefined) setSleepTimerRemainingSec(event.sleepTimerRemainingSec);

      // Handle track completion
      if (event.isEnded || (event.currentTime >= event.duration && event.duration > 0 && event.isPlaying)) {
        handleTrackEnded();
      }
    });

    return () => unsubscribe();
  }, [queue, isRepeat, isShuffle, currentTrack, tracks]);

  // Load initial ML recommendations, Sonic Persona & Spotify/YouTube Music Trending
  useEffect(() => {
    async function initML() {
      try {
        const extTrending = await externalMusicService.getTrendingTracks();
        if (extTrending && extTrending.length > 0) {
          setTracks((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const newTracks = extTrending.filter((t) => !existingIds.has(t.id));
            return [...prev, ...newTracks];
          });
        }
      } catch (e) {
        console.warn('Could not preload external trending:', e);
      }
      const mix = await mlService.getDailyMix(tracks);
      setDailyMix(mix);
      const userPersona = await mlService.getSonicPersona();
      setPersona(userPersona);
    }
    initML();
  }, []);

  // Update storage stats when downloads change
  useEffect(() => {
    setStorageStats(offlineStorage.getStorageStats(tracks));
  }, [downloadedTrackIds, tracks]);

  // Handle Play/Pause
  const handleTogglePlay = () => {
    audioEngine.togglePlay();
  };

  // Play a specific track (with LRCLIB synced lyrics auto-fetch)
  const handlePlayTrack = useCallback(
    (track: Track, startTime = 0) => {
      // Offline Restriction: Only downloaded songs can be played when offline
      if (isDeviceOffline && !offlineStorage.isTrackDownloaded(track.id)) {
        setOfflineNotice('You are offline. Only downloaded music can be played.');
        setTimeout(() => {
          if (!isDeviceOffline) setOfflineNotice(null);
        }, 3500);
        return;
      }

      setCurrentTrack(track);
      mlService.recordPlay(track);
      historyStorage.addToHistory(track);

      // Automatically fetch real synchronized lyrics from LRCLIB if not already present
      if (!track.lyrics || track.lyrics.length === 0) {
        externalMusicService.getLyrics(track.title, track.artist, track.duration).then((lyricsRes) => {
          if (lyricsRes?.syncedLyrics?.length) {
            setCurrentTrack((curr) => {
              if (curr && curr.id === track.id) {
                return {
                  ...curr,
                  lyrics: lyricsRes.syncedLyrics,
                  plainLyrics: lyricsRes.plainLyrics,
                };
              }
              return curr;
            });
          }
        });
      }

      // Play through audio engine
      audioEngine.playTrack(track, startTime);
    },
    [isDeviceOffline]
  );

  // Handle Spotify Fast Sync completion
  const handleSpotifyImportComplete = (newPlaylist: Playlist, importedTracks: Track[]) => {
    setTracks((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const additions = importedTracks.filter((t) => !existingIds.has(t.id));
      return [...prev, ...additions];
    });
    setPlaylists((prev) => [newPlaylist, ...prev]);
    setSelectedPlaylist(newPlaylist);
  };

  // Play All in tracklist
  const handlePlayAll = (tracklist: Track[], shuffle = false) => {
    if (tracklist.length === 0) return;
    const list = shuffle ? [...tracklist].sort(() => Math.random() - 0.5) : tracklist;
    handlePlayTrack(list[0]);
    setQueue(list.slice(1));
  };

  // Previous & Next Track
  const handlePrevious = () => {
    if (currentTime > 4) {
      audioEngine.seek(0);
      return;
    }
    const idx = tracks.findIndex((t) => t.id === currentTrack?.id);
    const prevIdx = idx > 0 ? idx - 1 : tracks.length - 1;
    handlePlayTrack(tracks[prevIdx]);
  };

  const handleNext = () => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue((prev) => prev.slice(1));
      handlePlayTrack(nextTrack);
      return;
    }

    if (isShuffle) {
      const randomIdx = Math.floor(Math.random() * tracks.length);
      handlePlayTrack(tracks[randomIdx]);
      return;
    }

    const idx = tracks.findIndex((t) => t.id === currentTrack?.id);
    const nextIdx = (idx + 1) % tracks.length;
    handlePlayTrack(tracks[nextIdx]);
  };

  const handleTrackEnded = () => {
    if (isRepeat && currentTrack) {
      audioEngine.seek(0);
      audioEngine.playTrack(currentTrack);
      return;
    }
    handleNext();
  };

  // Seek
  const handleSeek = (seconds: number) => {
    audioEngine.seek(seconds);
    setCurrentTime(seconds);
  };

  // Volume & Mute
  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    audioEngine.setVolume(vol);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    audioEngine.toggleMute();
  };

  // Shuffle & Repeat toggles
  const handleToggleShuffle = () => setIsShuffle(!isShuffle);
  const handleToggleRepeat = () => setIsRepeat(!isRepeat);

  // Equalizer Change
  const handleEqualizerChange = (eq: EqualizerState) => {
    setEqualizer(eq);
    audioEngine.setEqualizer(eq);
  };

  // Like / Favorite
  const handleToggleLike = (trackId: string) => {
    mlService.toggleFavorite(trackId);
    setFavoriteTrackIds(mlService.getFavoriteTrackIds());
  };

  const isFavorite = (trackId: string) => favoriteTrackIds.includes(trackId);
  const isDownloaded = (trackId: string) => downloadedTrackIds.includes(trackId);

  // Offline Download handler - Enforce user login requirement
  const handleDownloadTrack = async (track: Track) => {
    if (!userProfile.isLoggedIn) {
      alert('Sign-in required: Only logged-in users can download and listen to offline songs.');
      setIsGoogleAuthOpen(true);
      return;
    }
    setDownloadingTrackId(track.id);
    await offlineStorage.downloadTrack(track);
    setDownloadedTrackIds(offlineStorage.getDownloadedTrackIds());
    setDownloadingTrackId(null);
  };

  const handleRemoveOfflineTrack = (trackId: string) => {
    offlineStorage.removeOfflineTrack(trackId);
    setDownloadedTrackIds(offlineStorage.getDownloadedTrackIds());
  };

  const handleDownloadAll = async () => {
    if (!userProfile.isLoggedIn) {
      alert('Sign-in required: Only logged-in users can download and listen to offline songs.');
      setIsGoogleAuthOpen(true);
      return;
    }
    for (const t of tracks) {
      if (!downloadedTrackIds.includes(t.id)) {
        await offlineStorage.downloadTrack(t);
      }
    }
    setDownloadedTrackIds(offlineStorage.getDownloadedTrackIds());
  };

  const handleToggleOfflineMode = () => {
    const active = offlineStorage.toggleSimulatedOffline();
    setIsDeviceOffline(active);
  };

  // Regenerate Daily Mix
  const handleRegenerateDailyMix = async () => {
    setIsRegeneratingDaily(true);
    const mix = await mlService.getDailyMix(tracks);
    setDailyMix(mix);
    setIsRegeneratingDaily(false);
  };

  // Generate Smart ML Playlist
  const handleGeneratePlaylist = async (
    prompt: string,
    mood: string,
    bpm: number,
    energy: number
  ) => {
    return await mlService.generateSmartPlaylist(prompt, mood, bpm, energy, tracks);
  };

  const handleSavePlaylist = (playlist: Playlist) => {
    setPlaylists((prev) => [playlist, ...prev]);
  };

  const handleCreatePlaylist = (newPlaylist: Playlist) => {
    setPlaylists((prev) => [newPlaylist, ...prev]);
    setSelectedPlaylist(newPlaylist);
  };

  // Social Share triggers
  const handleOpenShareTrack = (track: Track) => {
    setShareTargetTrack(track);
    setShareTargetPlaylist(null);
    setIsShareModalOpen(true);
  };

  const handleOpenSharePlaylist = (playlist: Playlist) => {
    setShareTargetPlaylist(playlist);
    setShareTargetTrack(null);
    setIsShareModalOpen(true);
  };

  // Listen Along with friend
  const handleListenAlong = (track: Track) => {
    handlePlayTrack(track, 30);
    setIsFriendDrawerOpen(false);
  };

  // History tracks list
  const historyTracks = useMemo(() => {
    const hist = mlService.getListeningHistory();
    return hist
      .map((h) => tracks.find((t) => t.id === h.trackId))
      .filter(Boolean) as Track[];
  }, [currentTime]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07080c] text-[#f1f3f7] select-none font-sans relative">
      {/* Top Header Bar with Brand and Quick Actions */}
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setSelectedPlaylist(null);
          if (q && activeTab !== 'discover' && activeTab !== 'search') {
            setActiveTab('search');
          }
        }}
        onSearchSubmit={(q) => {
          setSearchQuery(q);
          setSelectedPlaylist(null);
          setActiveTab('search');
        }}
        onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
        onOpenOwnerPortal={() => setIsOwnerPortalOpen(true)}
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onOpenShareModal={() => {
          if (currentTrack) handleOpenShareTrack(currentTrack);
        }}
        onToggleFriendDrawer={() => setIsFriendDrawerOpen(!isFriendDrawerOpen)}
        onNavigateTab={(tab) => {
          setActiveTab(tab as ActiveTab);
          setSelectedPlaylist(null);
        }}
        activeTab={activeTab}
        userProfile={userProfile}
      />

      {/* Top Automatic Offline Alert Bar */}
      {isDeviceOffline && (
        <div className="w-full bg-gradient-to-r from-amber-600/30 via-red-600/20 to-amber-600/30 border-b border-amber-500/40 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200 z-30 select-none animate-fadeIn flex-shrink-0">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
            <span className="font-medium">
              <strong>You are offline.</strong> Only downloaded music can be played without internet.
            </span>
          </div>
          <button
            onClick={() => setSelectedPlaylist(downloadedPlaylist)}
            className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-all cursor-pointer shadow-md flex-shrink-0 ml-2"
          >
            Play Downloaded ({downloadedTrackIds.length})
          </button>
        </div>
      )}

      {offlineNotice && (
        <div className="w-full bg-rose-500/20 border-b border-rose-500/30 px-4 py-2 flex items-center justify-center text-xs text-rose-200 z-30 animate-fadeIn flex-shrink-0">
          <span>{offlineNotice}</span>
        </div>
      )}

      {/* Main Expansive Scrollable Stage */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 pt-4 sm:pt-6 pb-44">
          {selectedPlaylist ? (
            <PlaylistDetailView
              playlist={selectedPlaylist}
              tracks={tracks}
              currentTrackId={currentTrack?.id || null}
              isPlaying={isPlaying}
              onBack={() => {
                setSelectedPlaylist(null);
                if (activeTab === 'favorites') setActiveTab('library');
              }}
              onPlayTrack={(track) => {
                setPlayingPlaylist(selectedPlaylist);
                handlePlayTrack(track);
              }}
              onPlayAll={(tracklist, shuffle) => {
                setPlayingPlaylist(selectedPlaylist);
                handlePlayAll(tracklist, shuffle);
              }}
              onToggleLike={handleToggleLike}
              onDownloadTrack={handleDownloadTrack}
              onSharePlaylist={handleOpenSharePlaylist}
              onShareTrack={handleOpenShareTrack}
              isFavorite={isFavorite}
              isDownloaded={isDownloaded}
            />
          ) : activeTab === 'favorites' ? (
            <PlaylistDetailView
              playlist={likedPlaylist}
              tracks={tracks}
              currentTrackId={currentTrack?.id || null}
              isPlaying={isPlaying}
              onBack={() => setActiveTab('library')}
              onPlayTrack={(track) => {
                setPlayingPlaylist(likedPlaylist);
                handlePlayTrack(track);
              }}
              onPlayAll={(tracklist, shuffle) => {
                setPlayingPlaylist(likedPlaylist);
                handlePlayAll(tracklist, shuffle);
              }}
              onToggleLike={handleToggleLike}
              onDownloadTrack={handleDownloadTrack}
              onSharePlaylist={handleOpenSharePlaylist}
              onShareTrack={handleOpenShareTrack}
              isFavorite={isFavorite}
              isDownloaded={isDownloaded}
            />
          ) : activeTab === 'daily' ? (
            <DailyMixView
              dailyMix={dailyMix}
              tracks={tracks}
              currentTrackId={currentTrack?.id || null}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onPlayAll={handlePlayAll}
              onToggleLike={handleToggleLike}
              onDownloadTrack={handleDownloadTrack}
              onShareTrack={handleOpenShareTrack}
              onOpenLyrics={(track) => {
                handlePlayTrack(track);
                setIsImmersiveOpen(true);
              }}
              onRegenerate={handleRegenerateDailyMix}
              isRegenerating={isRegeneratingDaily}
              isFavorite={isFavorite}
              isDownloaded={isDownloaded}
            />
          ) : activeTab === 'discover' || activeTab === 'search' ? (
            <DiscoverView
              tracks={tracks}
              currentTrackId={currentTrack?.id || null}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onToggleLike={handleToggleLike}
              onDownloadTrack={handleDownloadTrack}
              onShareTrack={handleOpenShareTrack}
              isFavorite={isFavorite}
              isDownloaded={isDownloaded}
              searchFilter={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setSelectedPlaylist(null);
              }}
              onOpenLyrics={(track) => {
                handlePlayTrack(track);
                setIsImmersiveOpen(true);
              }}
            />
          ) : activeTab === 'history' ? (
            <HistoryView
              currentTrackId={currentTrack?.id || null}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onToggleLike={handleToggleLike}
              onOpenLyrics={(track) => {
                handlePlayTrack(track);
                setIsImmersiveOpen(true);
              }}
              isFavorite={isFavorite}
            />
          ) : activeTab === 'ml-studio' ? (
            <MLPlaylistStudio
              availableTracks={tracks}
              onGeneratePlaylist={handleGeneratePlaylist}
              onPlayPlaylist={(p) => handlePlayAll(p.trackIds.map((id) => tracks.find((t) => t.id === id)).filter(Boolean) as Track[])}
              onSavePlaylist={handleSavePlaylist}
              currentTrackId={currentTrack?.id || null}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
            />
          ) : (
            <LibraryView
              viewMode="library"
              playlists={playlists}
              tracks={tracks}
              favoriteTrackIds={favoriteTrackIds}
              downloadedTrackIds={downloadedTrackIds}
              historyTracks={historyTracks}
              currentTrackId={currentTrack?.id || null}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onSelectPlaylist={(p) => setSelectedPlaylist(p)}
              onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
              onToggleLike={handleToggleLike}
              onDownloadTrack={(track) => handleDownloadTrack(track)}
              isDownloaded={(trackId) => isDownloaded(trackId)}
              onDownloadAll={handleDownloadAll}
              onOpenFavorites={() => {
                setActiveTab('favorites');
                setSelectedPlaylist(null);
              }}
            />
          )}
      </main>

      {/* Floating Bottom Navigation Dock (Matching video navigation structure & tab states) */}
      <BottomNavDock
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedPlaylist(null);
        }}
        onOpenMenuPopup={() => setIsBottomMenuOpen((prev) => !prev)}
        isMenuOpen={isBottomMenuOpen}
        offlineCount={downloadedTrackIds.length}
      />

      {/* Bottom Pop-up Menu Drawer */}
      <BottomMenuPopup
        isOpen={isBottomMenuOpen}
        onClose={() => setIsBottomMenuOpen(false)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedPlaylist(null);
        }}
        playlists={playlists}
        onSelectPlaylist={(p) => {
          setSelectedPlaylist(p);
        }}
        selectedPlaylistId={selectedPlaylist?.id || null}
        offlineCount={downloadedTrackIds.length}
        onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
        storageStats={storageStats}
        onOpenSpotifySync={() => setIsSpotifySyncOpen(true)}
        onOpenOwnerPortal={() => setIsOwnerPortalOpen(true)}
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
        userProfile={userProfile}
      />

      {/* Docked Player Bar (Bottom) */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        buffered={buffered}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        volume={volume}
        isMuted={isMuted}
        isLiked={currentTrack ? isFavorite(currentTrack.id) : false}
        isDownloaded={currentTrack ? isDownloaded(currentTrack.id) : false}
        isDownloading={downloadingTrackId === currentTrack?.id}
        isSynthesizedFallback={isSynthesizedFallback}
        playingPlaylist={playingPlaylist}
        onOpenPlayingPlaylist={(p) => setSelectedPlaylist(p)}
        onTogglePlay={handleTogglePlay}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleLike={() => currentTrack && handleToggleLike(currentTrack.id)}
        onDownloadTrack={() => currentTrack && handleDownloadTrack(currentTrack)}
        onShareTrack={() => currentTrack && handleOpenShareTrack(currentTrack)}
        onToggleLyrics={() => setIsImmersiveOpen(true)}
        onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
        onExpandImmersive={() => setIsImmersiveOpen(true)}
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
        isLyricsOpen={isLyricsOpen}
        isQueueOpen={isQueueOpen}
      />

      {/* Fullscreen Immersive Cinema Player Modal */}
      <ImmersivePlayerModal
        isOpen={isImmersiveOpen}
        onClose={() => setIsImmersiveOpen(false)}
        track={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onTogglePlay={handleTogglePlay}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSeek={handleSeek}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        isLiked={currentTrack ? isFavorite(currentTrack.id) : false}
        onToggleLike={() => currentTrack && handleToggleLike(currentTrack.id)}
        onShareTrack={() => currentTrack && handleOpenShareTrack(currentTrack)}
        equalizer={equalizer}
        onEqualizerChange={handleEqualizerChange}
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
        onDownloadTrack={() => currentTrack && handleDownloadTrack(currentTrack)}
        isDownloaded={currentTrack ? isDownloaded(currentTrack.id) : false}
        isDownloading={downloadingTrackId === currentTrack?.id}
        sleepTimerRemainingSec={sleepTimerRemainingSec}
        sleepTimerMinutes={sleepTimerMinutes}
        onSetSleepTimer={(mins) => audioEngine.setSleepTimer(mins)}
        activePlaylist={playingPlaylist}
        onOpenPlaylist={(p) => {
          setSelectedPlaylist(p);
          setIsImmersiveOpen(false);
        }}
        onAddToPlaylist={() => setIsCreatePlaylistOpen(true)}
      />

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        track={shareTargetTrack || currentTrack}
        playlist={shareTargetPlaylist}
        onOpenListenTogether={() => setIsFriendDrawerOpen(true)}
      />

      {/* Jam with Friends Drawer */}
      <FriendActivityDrawer
        isOpen={isFriendDrawerOpen}
        onClose={() => setIsFriendDrawerOpen(false)}
        tracks={tracks}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        onPlayTrack={handlePlayTrack}
        onTogglePlay={handleTogglePlay}
        userName={userProfile.name}
      />

      {/* Queue Drawer */}
      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        currentTrack={currentTrack}
        queue={queue}
        onPlayTrack={handlePlayTrack}
        onRemoveFromQueue={(idx) => setQueue((prev) => prev.filter((_, i) => i !== idx))}
        onClearQueue={() => setQueue([])}
        onMoveQueueItem={(from, to) => {
          setQueue((prev) => {
            const copy = [...prev];
            const [item] = copy.splice(from, 1);
            copy.splice(to, 0, item);
            return copy;
          });
        }}
      />

      {/* Sonic Persona Modal */}
      <SonicPersonaModal
        isOpen={isSonicPersonaOpen}
        onClose={() => setIsSonicPersonaOpen(false)}
        persona={persona}
        onShare={() => {
          if (currentTrack) handleOpenShareTrack(currentTrack);
        }}
      />

      {/* Create Custom Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        availableTracks={tracks}
        onCreate={handleCreatePlaylist}
      />

      {/* Spotify Fast Sync Modal */}
      <SpotifySyncModal
        isOpen={isSpotifySyncOpen}
        onClose={() => setIsSpotifySyncOpen(false)}
        onImportComplete={handleSpotifyImportComplete}
      />

      {/* Google Account & Multi-Platform Playlist Importer Modal */}
      <GoogleAuthImporterModal
        isOpen={isGoogleAuthOpen}
        onClose={() => setIsGoogleAuthOpen(false)}
        onImportPlaylist={(newPlaylist) => {
          setPlaylists((prev) => [newPlaylist, ...prev]);
          setSelectedPlaylist(newPlaylist);
        }}
        availableTracks={tracks}
        onProfileChange={(newProfile) => {
          setUserProfile(newProfile);
        }}
      />

      {/* Audio Equalizer Pop-up Modal with Prominent Close Cross Button */}
      <EqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
        equalizer={equalizer}
        onEqualizerChange={handleEqualizerChange}
      />

      {/* Owner Access Portal Modal (Restricted & Hidden for Normal Users) */}
      <OwnerAccessPortalModal
        isOpen={isOwnerPortalOpen}
        onClose={() => setIsOwnerPortalOpen(false)}
        onLoginSuccess={(profile) => {
          setUserProfile(profile);
          historyStorage.saveUserProfile(profile);
        }}
      />

      {/* Download Android APK & PWA Modal */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />
    </div>
  );
}
