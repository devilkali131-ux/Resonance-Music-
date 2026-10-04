import { LyricLine, Track } from '../types/music';

class ExternalMusicService {
  private cachedTrending: Track[] = [];
  private cachedHome: { trending: Track[]; newMusic: Track[] } | null = null;

  public async getHomeMusic(): Promise<{ trending: Track[]; newMusic: Track[] }> {
    if (this.cachedHome && this.cachedHome.trending.length > 0) {
      return this.cachedHome;
    }
    try {
      const res = await fetch('/api/external/home');
      if (res.ok) {
        const data = await res.json();
        this.cachedHome = {
          trending: data.trending || [],
          newMusic: data.newMusic || [],
        };
        return this.cachedHome;
      }
    } catch (e) {
      console.warn('Failed to fetch home music:', e);
    }
    const trending = await this.getTrendingTracks();
    return { trending, newMusic: [] };
  }

  public async getTrendingTracks(): Promise<Track[]> {
    if (this.cachedTrending.length > 0) {
      return this.cachedTrending;
    }

    try {
      const res = await fetch('/api/external/trending');
      if (res.ok) {
        const data = await res.json();
        this.cachedTrending = data.trending || [];
        return this.cachedTrending;
      }
    } catch (e) {
      console.warn('Failed to fetch external trending:', e);
    }
    return [];
  }

  public async searchTracks(
    query: string,
    platform: 'all' | 'spotify' | 'youtube_music' = 'all'
  ): Promise<Track[]> {
    if (!query.trim()) return [];

    try {
      const res = await fetch(
        `/api/external/search?q=${encodeURIComponent(query)}&platform=${platform}`
      );
      if (res.ok) {
        const data = await res.json();
        return data.results || [];
      }
    } catch (e) {
      console.warn('Failed to search external tracks:', e);
    }
    return [];
  }

  public async getSuggestions(query: string): Promise<string[]> {
    if (!query.trim()) return [];
    try {
      const res = await fetch(`/api/external/suggestions?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        return data.suggestions || [];
      }
    } catch (e) {
      console.warn('Failed to fetch suggestions:', e);
    }
    return [];
  }

  public async getLyrics(
    title: string,
    artist: string,
    duration?: number
  ): Promise<{ syncedLyrics: LyricLine[]; plainLyrics: string } | null> {
    try {
      const res = await fetch(
        `/api/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}${
          duration ? `&duration=${duration}` : ''
        }`
      );
      if (res.ok) {
        const data = await res.json();
        return {
          syncedLyrics: data.syncedLyrics || [],
          plainLyrics: data.plainLyrics || '',
        };
      }
    } catch (e) {
      console.warn('Failed to fetch live lyrics:', e);
    }
    return null;
  }

  public async importSpotify(
    urlOrQuery: string
  ): Promise<{ success: boolean; playlistName: string; tracks: Track[] } | null> {
    try {
      const res = await fetch('/api/spotify/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlOrQuery, title: urlOrQuery }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to import Spotify playlist:', e);
    }
    return null;
  }
}

export const externalMusicService = new ExternalMusicService();
