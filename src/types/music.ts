export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export type ActiveTab =
  | 'daily'
  | 'discover'
  | 'search'
  | 'ml-studio'
  | 'library'
  | 'favorites'
  | 'history'
  | 'spotify-sync';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  audioUrl: string;
  coverUrl: string;
  genre: string;
  bpm: number;
  key: string;
  mood: string;
  plays: number;
  liked?: boolean;
  isDownloaded?: boolean;
  downloadSizeMb?: number;
  lyrics: LyricLine[];
  plainLyrics?: string;
  releaseYear: number;
  accentColor: string;
  description?: string;
  source?: 'resonance' | 'spotify' | 'youtube_music';
  externalUrl?: string;
  spotifyUrl?: string;
  youtubeMusicUrl?: string;
  youtubeVideoId?: string;
  popularity?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  tagline?: string;
  coverUrl?: string;
  coverGradient?: string;
  accentColor?: string;
  trackIds: string[];
  isAiGenerated?: boolean;
  createdAt: string;
  playCount: number;
  energyScore?: number;
}

export interface DailyMix {
  title: string;
  description: string;
  rationale: string;
  sonicInsight: string;
  energyScore: number;
  trackIds: string[];
  trendingGenres: string[];
  generatedAt: string;
}

export interface SonicRadar {
  energy: number;
  valence: number;
  danceability: number;
  focusScore: number;
  acousticness: number;
}

export interface SonicPersona {
  personaName: string;
  archetype: string;
  summary: string;
  topGenres: string[];
  radar: SonicRadar;
}

export interface FriendActivity {
  id: string;
  userName: string;
  avatar: string;
  status: 'listening' | 'idle' | 'party';
  currentTrackId: string;
  progressPercent: number;
  startedAgo: string;
  isPartyHost?: boolean;
}

export interface EqualizerState {
  bass: number; // -12 to 12 dB
  mid: number;  // -12 to 12 dB
  treble: number; // -12 to 12 dB
  surround: boolean;
}
