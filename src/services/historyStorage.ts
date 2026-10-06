import { Track } from '../types/music';

export interface HistoryItem {
  id: string;
  track: Track;
  playedAt: number; // timestamp
  playCount: number;
}

const STORAGE_KEY = 'resonance_listening_history';
const PROFILE_KEY = 'resonance_user_profile';

export interface UserProfile {
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
  importedPlaylistsCount: number;
  role?: string;
}

const DEFAULT_GUEST_PROFILE: UserProfile = {
  name: 'Guest User',
  email: '',
  initials: 'G',
  isLoggedIn: false,
  importedPlaylistsCount: 0,
};

export const historyStorage = {
  getHistory(): HistoryItem[] {
    try {
      // Clean legacy keys
      localStorage.removeItem('echo_listening_history');
      localStorage.removeItem('echo_user_profile');
      localStorage.removeItem('aura_listening_history');

      const data =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem('veltra_listening_history') ||
        localStorage.getItem('lyra_listening_history');
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  addToHistory(track: Track): HistoryItem[] {
    try {
      const current = this.getHistory();
      const existingIdx = current.findIndex((h) => h.track.id === track.id);
      let updated: HistoryItem[];

      if (existingIdx >= 0) {
        const item = current[existingIdx];
        const newItem: HistoryItem = {
          ...item,
          track,
          playedAt: Date.now(),
          playCount: (item.playCount || 1) + 1,
        };
        updated = [newItem, ...current.filter((_, i) => i !== existingIdx)].slice(0, 50);
      } else {
        const newItem: HistoryItem = {
          id: `hist-${Date.now()}-${track.id}`,
          track,
          playedAt: Date.now(),
          playCount: 1,
        };
        updated = [newItem, ...current].slice(0, 50);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  removeFromHistory(trackId: string): HistoryItem[] {
    try {
      const current = this.getHistory();
      const updated = current.filter((h) => h.track.id !== trackId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('veltra_listening_history');
      localStorage.removeItem('lyra_listening_history');
      localStorage.removeItem('echo_listening_history');
      localStorage.removeItem('aura_listening_history');
    } catch {
      // Ignore
    }
  },

  // User Google Profile: By default signed out with NO personal details
  getUserProfile(): UserProfile {
    try {
      // Clean up any old personal storage
      localStorage.removeItem('echo_user_profile');
      localStorage.removeItem('aura_user_profile');
      const data =
        localStorage.getItem(PROFILE_KEY) ||
        localStorage.getItem('veltra_user_profile');
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Ignore
    }
    // Return signed out guest by default
    return DEFAULT_GUEST_PROFILE;
  },

  setUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore
    }
  },

  saveUserProfile(profile: UserProfile): void {
    this.setUserProfile(profile);
  },

  signOut(): UserProfile {
    try {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem('veltra_user_profile');
      localStorage.removeItem('lyra_user_profile');
      localStorage.removeItem('echo_user_profile');
      localStorage.removeItem('aura_user_profile');
    } catch {
      // Ignore
    }
    return DEFAULT_GUEST_PROFILE;
  },
};
