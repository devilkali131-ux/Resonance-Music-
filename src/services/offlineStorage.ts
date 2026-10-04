import { Track } from '../types/music';

const STORAGE_KEY_OFFLINE_TRACKS = 'resonance_offline_tracks_v1';
const STORAGE_KEY_OFFLINE_MODE = 'resonance_offline_mode_active';

export interface OfflineStorageStats {
  totalTracks: number;
  totalSizeMb: number;
  maxStorageMb: number;
}

class OfflineStorageManager {
  private offlineTrackIds: Set<string> = new Set();
  private simulatedOffline = false;

  constructor() {
    this.loadState();
  }

  private loadState() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OFFLINE_TRACKS);
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        this.offlineTrackIds = new Set(parsed);
      }
      const mode = localStorage.getItem(STORAGE_KEY_OFFLINE_MODE);
      this.simulatedOffline = mode === 'true';
    } catch (e) {
      console.error('Failed to load offline storage state', e);
    }
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        STORAGE_KEY_OFFLINE_TRACKS,
        JSON.stringify(Array.from(this.offlineTrackIds))
      );
      localStorage.setItem(STORAGE_KEY_OFFLINE_MODE, String(this.simulatedOffline));
    } catch (e) {
      console.error('Failed to save offline storage state', e);
    }
  }

  public isOfflineModeActive(): boolean {
    if (typeof window === 'undefined') return false;
    return this.simulatedOffline || !navigator.onLine;
  }

  public toggleSimulatedOffline(): boolean {
    this.simulatedOffline = !this.simulatedOffline;
    this.saveState();
    return this.isOfflineModeActive();
  }

  public isTrackDownloaded(trackId: string): boolean {
    return this.offlineTrackIds.has(trackId);
  }

  public async downloadTrack(track: Track, onProgress?: (percent: number) => void): Promise<boolean> {
    // Real download simulation with cache registration
    for (let p = 10; p <= 100; p += 30) {
      if (onProgress) onProgress(p);
      await new Promise((r) => setTimeout(r, 60));
    }

    this.offlineTrackIds.add(track.id);
    this.saveState();

    // Cache track metadata in localStorage cache
    try {
      const trackDataKey = `resonance_track_cache_${track.id}`;
      localStorage.setItem(trackDataKey, JSON.stringify({ ...track, isDownloaded: true }));
    } catch {
      // ignore quota limits
    }

    return true;
  }

  public removeOfflineTrack(trackId: string): void {
    this.offlineTrackIds.delete(trackId);
    this.saveState();
    try {
      localStorage.removeItem(`resonance_track_cache_${trackId}`);
    } catch {
      // ignore
    }
  }

  public getDownloadedTrackIds(): string[] {
    return Array.from(this.offlineTrackIds);
  }

  public getStorageStats(allTracks: Track[]): OfflineStorageStats {
    let totalSize = 0;
    allTracks.forEach((t) => {
      if (this.offlineTrackIds.has(t.id)) {
        totalSize += t.downloadSizeMb || 4.5;
      }
    });

    return {
      totalTracks: this.offlineTrackIds.size,
      totalSizeMb: Math.round(totalSize * 10) / 10,
      maxStorageMb: 512,
    };
  }
}

export const offlineStorage = new OfflineStorageManager();
