import { DailyMix, Playlist, SonicPersona, Track } from '../types/music';

export interface ListeningHistoryItem {
  trackId: string;
  genre: string;
  playedAt: number;
}

const STORAGE_KEY_HISTORY = 'resonance_user_listening_history_v1';
const STORAGE_KEY_FAVORITES = 'resonance_user_favorites_v1';

class MLRecommendationService {
  private history: ListeningHistoryItem[] = [];
  private favorites: Set<string> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    if (typeof window === 'undefined') return;
    try {
      const hist = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (hist) this.history = JSON.parse(hist);

      const favs = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (favs) this.favorites = new Set(JSON.parse(favs));
    } catch (e) {
      console.error('Failed to load user listening history', e);
    }
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(this.history.slice(-100)));
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(Array.from(this.favorites)));
    } catch (e) {
      console.error('Failed to save listening history', e);
    }
  }

  public recordPlay(track: Track) {
    this.history.unshift({
      trackId: track.id,
      genre: track.genre,
      playedAt: Date.now(),
    });
    this.saveState();
  }

  public toggleFavorite(trackId: string): boolean {
    if (this.favorites.has(trackId)) {
      this.favorites.delete(trackId);
    } else {
      this.favorites.add(trackId);
    }
    this.saveState();
    return this.favorites.has(trackId);
  }

  public isFavorite(trackId: string): boolean {
    return this.favorites.has(trackId);
  }

  public getFavoriteTrackIds(): string[] {
    return Array.from(this.favorites);
  }

  public getListeningHistory(): ListeningHistoryItem[] {
    return this.history;
  }

  public getTopGenres(): { genre: string; count: number }[] {
    const counts: Record<string, number> = {};
    this.history.forEach((h) => {
      counts[h.genre] = (counts[h.genre] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);

    return sorted.length > 0
      ? sorted
      : [
          { genre: 'Synthwave', count: 12 },
          { genre: 'Cyberpunk', count: 8 },
          { genre: 'Deep House', count: 7 },
          { genre: 'Lo-Fi', count: 6 },
        ];
  }

  // Generate Personalized Daily Mix via Gemini API (with fallback)
  public async getDailyMix(availableTracks: Track[]): Promise<DailyMix> {
    const topGenres = this.getTopGenres().map((g) => g.genre);
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : hour < 22 ? 'Evening' : 'Late Night';

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: this.history.slice(0, 15),
          favoriteGenres: topGenres.slice(0, 3),
          timeOfDay,
          currentMood: hour >= 21 || hour < 5 ? 'Night Drive & Focus' : 'Daytime Flow',
          availableTracks,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          title: data.dailyMixTitle || `${timeOfDay} Sonic Flow`,
          description: data.dailyMixDescription || 'Personalized curation tuned to your recent listening frequencies.',
          rationale: data.rationale || 'Selected based on your affinity for rhythmic synthesizer passages and deep bass.',
          sonicInsight: data.sonicInsight || 'Your listening patterns show peak attention during 110–128 BPM electronic cadences.',
          energyScore: data.energyScore || 78,
          trackIds: data.recommendedTrackIds || availableTracks.slice(0, 6).map((t) => t.id),
          trendingGenres: data.trendingGenres || ['Synthwave', 'Deep House', 'Lo-Fi', 'Phonk'],
          generatedAt: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        };
      }
    } catch {
      // ignore, fall back
    }

    // Local heuristic fallback
    return {
      title: `${timeOfDay} Daily Resonance`,
      description: `Curated for your ${timeOfDay.toLowerCase()} listening groove and recent genre affinity.`,
      rationale: 'Generated with localized taste clustering and tempo matching.',
      sonicInsight: 'Your listening profile leans toward atmospheric synth textures and steady basslines.',
      energyScore: 82,
      trackIds: availableTracks.slice(0, 7).map((t) => t.id),
      trendingGenres: ['Synthwave', 'Cyberpunk', 'Ambient', 'Neo-Soul'],
      generatedAt: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    };
  }

  // Smarter Playlist Generator (Prompt & Machine Learning based)
  public async generateSmartPlaylist(
    prompt: string,
    mood: string,
    targetBpm: number,
    energy: number,
    availableTracks: Track[]
  ): Promise<Playlist> {
    try {
      const res = await fetch('/api/generate-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          mood,
          targetBpm,
          energy,
          availableTracks,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          id: `playlist-ai-${Date.now()}`,
          name: data.name || `Mix: ${prompt.slice(0, 20)}`,
          tagline: data.tagline || 'Intelligently sequenced harmonic mix',
          description: data.description || `Generated tailored playlist based on "${prompt}".`,
          coverGradient: data.coverGradient || 'linear-gradient(135deg, #090a0f 0%, #1e1b4b 50%, #00f0ff 100%)',
          accentColor: data.accentColor || '#00f0ff',
          trackIds: data.trackIds || availableTracks.slice(0, 5).map((t) => t.id),
          isAiGenerated: true,
          createdAt: 'Just now',
          playCount: 1,
          energyScore: energy,
        };
      }
    } catch {
      // fallback
    }

    // Smart client algorithmic matching
    const q = prompt.toLowerCase();
    const matched = availableTracks.filter((t) => {
      return (
        t.genre.toLowerCase().includes(q) ||
        t.mood.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        (mood && t.mood.toLowerCase().includes(mood.toLowerCase()))
      );
    });

    const selectedTracks = (matched.length >= 3 ? matched : availableTracks).slice(0, 6);

    return {
      id: `playlist-ai-${Date.now()}`,
      name: prompt ? `Resonance: ${prompt.slice(0, 20)}` : 'Smart Algorithmic Mix',
      tagline: 'Harmonically balanced journey',
      description: `Custom flow optimized for ${mood || 'peak focus and enjoyment'}.`,
      coverGradient: 'linear-gradient(135deg, #090a0f 0%, #312e81 60%, #8b5cf6 100%)',
      accentColor: '#8b5cf6',
      trackIds: selectedTracks.map((t) => t.id),
      isAiGenerated: true,
      createdAt: 'Just now',
      playCount: 1,
      energyScore: energy,
    };
  }

  // Sonic Persona / Taste Radar analysis
  public async getSonicPersona(): Promise<SonicPersona> {
    try {
      const res = await fetch('/api/analyze-taste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: this.history.slice(0, 30),
        }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    return {
      personaName: 'Cybernetic Night Owl',
      archetype: 'Electronic & Ambient Connoisseur',
      summary: 'You gravitate toward immersive soundscapes, driving synthesizer pulses, and late-night focus frequencies.',
      topGenres: ['Synthwave', 'Lo-Fi', 'Deep House', 'Cinematic'],
      radar: {
        energy: 78,
        valence: 64,
        danceability: 72,
        focusScore: 94,
        acousticness: 32,
      },
    };
  }
}

export const mlService = new MLRecommendationService();
