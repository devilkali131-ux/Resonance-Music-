import { EqualizerState, Track } from '../types/music';

type AudioEventCallback = (event: {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  buffered: number;
  isSynthesizedFallback?: boolean;
  isEnded?: boolean;
}) => void;

class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  // Synthesizer fallback state
  private isSynthesizing = false;
  private synthInterval: number | null = null;
  private synthStartTime = 0;
  private synthCurrentTime = 0;
  private synthDuration = 180;
  private synthCurrentTrack: Track | null = null;

  // YouTube Music Player state
  private ytPlayer: any = null;
  private ytPollTimer: any = null;
  private isYouTubeTrack = false;
  private ytCurrentTime = 0;
  private ytDuration = 0;
  private ytBuffered = 0;

  private currentTrack: Track | null = null;
  private isPlaying = false;
  private volume = 0.85;
  private isMuted = false;
  private listeners: Set<AudioEventCallback> = new Set();
  private isConnectedToWebAudio = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.crossOrigin = 'anonymous';

    this.audio.addEventListener('timeupdate', () => this.notify());
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.notify();
    });
    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notify();
    });
    this.audio.addEventListener('ended', () => {
      this.isPlaying = false;
      this.notify(true);
    });
    this.audio.addEventListener('error', (e) => {
      console.warn('Audio streaming encountered issue:', e);
      if (this.audio && this.audio.crossOrigin) {
        this.audio.crossOrigin = null;
        if (this.currentTrack?.audioUrl) {
          this.audio.src = this.currentTrack.audioUrl;
          this.audio.play().catch(() => {});
          return;
        }
      }
      if (this.currentTrack && !navigator.onLine) {
        this.startProceduralSynth(this.currentTrack);
      }
    });
  }

  private ensureAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      // Equalizer nodes
      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 200;

      this.midFilter = this.audioCtx.createBiquadFilter();
      this.midFilter.type = 'peaking';
      this.midFilter.frequency.value = 1000;
      this.midFilter.Q.value = 1;

      this.trebleFilter = this.audioCtx.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.value = 4000;

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = this.volume;

      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Chain: bass -> mid -> treble -> gain -> analyser -> destination
      this.bassFilter.connect(this.midFilter);
      this.midFilter.connect(this.trebleFilter);
      this.trebleFilter.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    // Connect audio element if not connected
    if (this.audio && this.audioCtx && !this.isConnectedToWebAudio && this.bassFilter) {
      try {
        this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
        this.sourceNode.connect(this.bassFilter);
        this.isConnectedToWebAudio = true;
      } catch (err) {
        // Source node already connected or cross-origin security constraint
        console.warn('Audio graph connection note:', err);
      }
    }
  }

  private initYouTubePlayer(videoId: string, startTime = 0) {
    if (typeof window === 'undefined') return;

    this.isYouTubeTrack = true;
    this.ytCurrentTime = startTime;
    this.ytDuration = this.currentTrack?.duration || 210;

    const onPlayerReady = (event: any) => {
      try {
        if (typeof event.target.unMute === 'function') {
          event.target.unMute();
        }
        event.target.setVolume(this.isMuted ? 0 : Math.round(this.volume * 100));
        if (startTime > 0) {
          event.target.seekTo(startTime, true);
        }
        event.target.playVideo();
        this.isPlaying = true;
        this.startYouTubePolling();
        this.notify();
      } catch (err) {
        console.warn('YT onPlayerReady error:', err);
      }
    };

    const onStateChange = (event: any) => {
      // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
      if (event.data === 1) {
        this.isPlaying = true;
        this.startYouTubePolling();
      } else if (event.data === 2) {
        this.isPlaying = false;
      } else if (event.data === 0) {
        this.isPlaying = false;
        this.stopYouTubePolling();
        this.notify(true);
        return;
      }
      this.notify();
    };

    if (this.ytPlayer && typeof this.ytPlayer.loadVideoById === 'function') {
      try {
        this.ytPlayer.loadVideoById({
          videoId,
          startSeconds: startTime,
        });
        this.ytPlayer.setVolume(this.isMuted ? 0 : Math.round(this.volume * 100));
        this.ytPlayer.playVideo();
        this.isPlaying = true;
        this.startYouTubePolling();
        this.notify();
        return;
      } catch (err) {
        console.warn('Error loading video on existing YT player:', err);
      }
    }

    const checkYTReady = (attempts = 0) => {
      const win = window as any;
      if (win.YT && win.YT.Player) {
        try {
          this.ytPlayer = new win.YT.Player('resonance-yt-player', {
            height: '160',
            width: '240',
            videoId,
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              enablejsapi: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
              origin: typeof window !== 'undefined' ? window.location.origin : undefined,
            },
            events: {
              onReady: onPlayerReady,
              onStateChange: onStateChange,
              onError: (e: any) => {
                console.warn('YouTube embed restricted, switching to real audio stream:', e);
                this.isYouTubeTrack = false;
                if (this.currentTrack) {
                  this.playAudioElement(this.currentTrack, startTime);
                }
              },
            },
          });
        } catch (e) {
          console.warn('YT Player instantiation error:', e);
        }
      } else if (attempts < 25) {
        setTimeout(() => checkYTReady(attempts + 1), 200);
      } else {
        // Fallback to direct audio stream if YouTube API timed out
        this.isYouTubeTrack = false;
        if (this.currentTrack) {
          this.playAudioElement(this.currentTrack, startTime);
        }
      }
    };

    checkYTReady();
  }

  private startYouTubePolling() {
    this.stopYouTubePolling();
    this.ytPollTimer = window.setInterval(() => {
      if (!this.ytPlayer) return;
      try {
        if (typeof this.ytPlayer.getCurrentTime === 'function') {
          const t = this.ytPlayer.getCurrentTime();
          if (!isNaN(t)) this.ytCurrentTime = t;
        }
        if (typeof this.ytPlayer.getDuration === 'function') {
          const d = this.ytPlayer.getDuration();
          if (d > 0) this.ytDuration = d;
        }
        if (typeof this.ytPlayer.getVideoLoadedFraction === 'function') {
          this.ytBuffered = (this.ytPlayer.getVideoLoadedFraction() || 0) * 100;
        }
        this.notify();
      } catch {
        // ignore
      }
    }, 250);
  }

  private stopYouTubePolling() {
    if (this.ytPollTimer) {
      clearInterval(this.ytPollTimer);
      this.ytPollTimer = null;
    }
  }

  private async playAudioElement(track: Track, startTime = 0) {
    if (!this.audio) return;
    try {
      this.audio.volume = this.isMuted ? 0 : this.volume;
      if (track.audioUrl && !track.audioUrl.includes('soundhelix') && !track.audioUrl.includes('freesound.org')) {
        this.audio.src = track.audioUrl;
        this.audio.currentTime = startTime;
        await this.audio.play();
        this.isPlaying = true;
        this.notify();
        return;
      }
      throw new Error('Need online audio resolution');
    } catch (err) {
      console.warn('Primary audio stream playback notice, resolving live online stream:', err);
      try {
        const resolveRes = await fetch(
          `/api/external/resolve-audio?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(
            track.artist
          )}`
        );
        if (resolveRes.ok) {
          const data = await resolveRes.json();
          if (data.audioUrl) {
            track.audioUrl = data.audioUrl;
            if (data.coverUrl && (!track.coverUrl || track.coverUrl.includes('placeholder'))) {
              track.coverUrl = data.coverUrl;
            }
            this.audio.volume = this.isMuted ? 0 : this.volume;
            this.audio.src = data.audioUrl;
            this.audio.currentTime = startTime;
            await this.audio.play();
            this.isPlaying = true;
            this.notify();
            return;
          }
        }
      } catch (resolveErr) {
        console.warn('Dynamic stream resolution error:', resolveErr);
      }

      if (!navigator.onLine) {
        this.startProceduralSynth(track);
      }
    }
  }

  public async playTrack(track: Track, startTime = 0, forceOfflineSynth = false) {
    this.ensureAudioContext();
    this.stopProceduralSynth();

    this.currentTrack = track;

    if (forceOfflineSynth || (!navigator.onLine && !track.isDownloaded)) {
      this.startProceduralSynth(track);
      return;
    }

    // Stop YouTube Player if running
    this.stopYouTubePolling();
    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      try {
        this.ytPlayer.pauseVideo();
      } catch {
        // ignore
      }
    }

    // 1. Direct audio stream playback (Prioritized for real, official high-fidelity full songs)
    const isDirectFullSong =
      track.audioUrl &&
      (track.audioUrl.includes('saavncdn') ||
        track.audioUrl.endsWith('.mp4') ||
        track.audioUrl.endsWith('.aac') ||
        track.audioUrl.endsWith('.mp3'));

    if (isDirectFullSong) {
      this.isYouTubeTrack = false;
      await this.playAudioElement(track, startTime);
      return;
    }

    // 2. If track has an iTunes 30s preview or missing full audio, auto-resolve full online stream
    if (
      track.audioUrl?.includes('itunes.apple.com') ||
      track.audioUrl?.includes('previewUrl') ||
      !track.audioUrl
    ) {
      try {
        const resolveRes = await fetch(
          `/api/external/resolve-audio?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(
            track.artist
          )}`
        );
        if (resolveRes.ok) {
          const data = await resolveRes.json();
          if (data.audioUrl) {
            track.audioUrl = data.audioUrl;
            if (data.coverUrl && (!track.coverUrl || track.coverUrl.includes('placeholder'))) {
              track.coverUrl = data.coverUrl;
            }
            if (data.duration && data.duration > 0) {
              track.duration = data.duration;
            }
            this.isYouTubeTrack = false;
            await this.playAudioElement(track, startTime);
            return;
          }
        }
      } catch (e) {
        console.warn('Auto resolve full stream notice:', e);
      }
    }

    // 3. YouTube video stream playback (if available and not restricted)
    if (track.youtubeVideoId) {
      if (this.audio) this.audio.pause();
      this.initYouTubePlayer(track.youtubeVideoId, startTime);
      return;
    }

    // 4. Fallback direct audio stream playback
    this.isYouTubeTrack = false;
    await this.playAudioElement(track, startTime);
  }

  public async togglePlay() {
    this.ensureAudioContext();

    if (this.isSynthesizing) {
      if (this.isPlaying) {
        this.stopProceduralSynth();
        this.isPlaying = false;
      } else if (this.synthCurrentTrack) {
        this.startProceduralSynth(this.synthCurrentTrack, this.synthCurrentTime);
      }
      this.notify();
      return;
    }

    if (this.isYouTubeTrack && this.ytPlayer) {
      try {
        if (this.isPlaying) {
          this.ytPlayer.pauseVideo();
          this.isPlaying = false;
        } else {
          this.ytPlayer.playVideo();
          this.isPlaying = true;
        }
        this.notify();
        return;
      } catch (err) {
        console.warn('YT toggle play error:', err);
      }
    }

    if (!this.audio) return;

    if (this.isPlaying) {
      this.audio.pause();
    } else {
      try {
        await this.audio.play();
      } catch {
        if (this.currentTrack) {
          this.startProceduralSynth(this.currentTrack);
        }
      }
    }
  }

  public pause() {
    if (this.isSynthesizing) {
      this.stopProceduralSynth();
      this.isPlaying = false;
      this.notify();
      return;
    }
    if (this.isYouTubeTrack && this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      try {
        this.ytPlayer.pauseVideo();
        this.isPlaying = false;
        this.notify();
        return;
      } catch {
        // ignore
      }
    }
    if (this.audio) {
      this.audio.pause();
    }
  }

  public seek(seconds: number) {
    if (this.isSynthesizing) {
      this.synthCurrentTime = Math.max(0, Math.min(seconds, this.synthDuration));
      this.synthStartTime = Date.now() - this.synthCurrentTime * 1000;
      this.notify();
      return;
    }
    if (this.isYouTubeTrack && this.ytPlayer && typeof this.ytPlayer.seekTo === 'function') {
      try {
        this.ytPlayer.seekTo(seconds, true);
        this.ytCurrentTime = seconds;
        this.notify();
        return;
      } catch {
        // ignore
      }
    }
    if (this.audio && !isNaN(seconds)) {
      this.audio.currentTime = seconds;
      this.notify();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.isYouTubeTrack && this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
      try {
        this.ytPlayer.setVolume(this.isMuted ? 0 : Math.round(this.volume * 100));
      } catch {
        // ignore
      }
    }
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);
    }
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
  }

  public setEqualizer(eq: EqualizerState) {
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    const t = this.audioCtx.currentTime;
    if (this.bassFilter) this.bassFilter.gain.setValueAtTime(eq.bass, t);
    if (this.midFilter) this.midFilter.gain.setValueAtTime(eq.mid, t);
    if (this.trebleFilter) this.trebleFilter.gain.setValueAtTime(eq.treble, t);
  }

  public getAudioContext(): AudioContext | null {
    this.ensureAudioContext();
    return this.audioCtx;
  }

  public getAnalyserNode(): AnalyserNode | null {
    this.ensureAudioContext();
    return this.analyserNode;
  }

  public getFrequencyData(array: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(array as unknown as Uint8Array<ArrayBuffer>);
      let total = 0;
      for (let i = 0; i < array.length; i++) {
        total += array[i];
      }
      // If analyser reports zero energy while playing (e.g. CORS restriction on media source), generate rhythmic beat spectrum
      if (total === 0 && this.isPlaying) {
        this.fillReactiveFrequency(array);
      }
    } else if (this.isPlaying) {
      this.fillReactiveFrequency(array);
    } else {
      for (let i = 0; i < array.length; i++) {
        array[i] = 0;
      }
    }
  }

  public getTimeDomainData(array: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteTimeDomainData(array as unknown as Uint8Array<ArrayBuffer>);
      let hasSignal = false;
      for (let i = 0; i < array.length; i++) {
        if (Math.abs(array[i] - 128) > 2) {
          hasSignal = true;
          break;
        }
      }
      if (!hasSignal && this.isPlaying) {
        this.fillReactiveWaveform(array);
      }
    } else if (this.isPlaying) {
      this.fillReactiveWaveform(array);
    } else {
      for (let i = 0; i < array.length; i++) {
        array[i] = 128;
      }
    }
  }

  private fillReactiveFrequency(array: Uint8Array) {
    const now = Date.now();
    const bpm = this.currentTrack?.bpm || 120;
    const beatPeriod = (60 / bpm) * 1000;
    const beatPhase = (now % beatPeriod) / beatPeriod;
    const bassKick = Math.exp(-beatPhase * 6); // Sharp kick decay

    for (let i = 0; i < array.length; i++) {
      const freqFactor = 1 - (i / array.length) * 0.6;
      const oscillation = Math.sin(now / (80 + i * 5) + i * 0.4) * 0.5 + 0.5;
      const bassWeight = i < 8 ? bassKick * 140 : 0;
      const midHigh = oscillation * 90 * freqFactor;
      array[i] = Math.min(255, Math.floor(bassWeight + midHigh + 30));
    }
  }

  private fillReactiveWaveform(array: Uint8Array) {
    const now = Date.now();
    const bpm = this.currentTrack?.bpm || 120;
    const beatPeriod = (60 / bpm) * 1000;
    const beatPhase = (now % beatPeriod) / beatPeriod;
    const amp = 30 + Math.exp(-beatPhase * 4) * 40;

    for (let i = 0; i < array.length; i++) {
      const angle = (i / array.length) * Math.PI * 4 + now / 100;
      array[i] = Math.floor(128 + Math.sin(angle) * amp + (Math.random() - 0.5) * 6);
    }
  }

  // High-fidelity procedural synth fallback
  private startProceduralSynth(track: Track, startSec = 0) {
    this.ensureAudioContext();
    if (!this.audioCtx || !this.bassFilter) return;

    this.isSynthesizing = true;
    this.isPlaying = true;
    this.synthCurrentTrack = track;
    this.synthDuration = track.duration || 180;
    this.synthCurrentTime = startSec;
    this.synthStartTime = Date.now() - startSec * 1000;

    // Musical scale frequencies for key
    const scaleBaseFreq = track.genre === 'Lo-Fi' ? 196 : track.genre === 'Cyberpunk' ? 146.8 : 220; // A3 or D3 or G3
    const intervals = [1, 1.2, 1.333, 1.5, 1.8]; // Minor pentatonic harmonic ratios

    let step = 0;
    const bpm = track.bpm || 120;
    const stepDurationMs = (60 / bpm / 2) * 1000; // 8th note

    if (this.synthInterval) {
      window.clearInterval(this.synthInterval);
    }

    this.synthInterval = window.setInterval(() => {
      if (!this.audioCtx || !this.isPlaying || !this.bassFilter) return;

      this.synthCurrentTime = (Date.now() - this.synthStartTime) / 1000;
      if (this.synthCurrentTime >= this.synthDuration) {
        this.synthCurrentTime = 0;
        this.synthStartTime = Date.now();
      }

      const now = this.audioCtx.currentTime;

      // 1. Bass pulse oscillator
      if (step % 2 === 0) {
        const bassOsc = this.audioCtx.createOscillator();
        const bassGain = this.audioCtx.createGain();
        bassOsc.type = 'sawtooth';
        const bassNote = scaleBaseFreq * 0.5 * (step % 8 === 0 ? 1 : 1.2);
        bassOsc.frequency.setValueAtTime(bassNote, now);

        bassGain.gain.setValueAtTime(0.2, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + (stepDurationMs * 1.5) / 1000);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bassFilter);
        bassOsc.start(now);
        bassOsc.stop(now + (stepDurationMs * 1.8) / 1000);
      }

      // 2. Melodic arpeggio chord note
      const arpHarmonic = intervals[step % intervals.length];
      const leadOsc = this.audioCtx.createOscillator();
      const leadGain = this.audioCtx.createGain();
      leadOsc.type = track.genre === 'Lo-Fi' ? 'sine' : 'triangle';
      leadOsc.frequency.setValueAtTime(scaleBaseFreq * arpHarmonic, now);

      leadGain.gain.setValueAtTime(0.12, now);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + stepDurationMs / 1000);

      leadOsc.connect(leadGain);
      leadGain.connect(this.bassFilter);
      leadOsc.start(now);
      leadOsc.stop(now + stepDurationMs / 1000);

      // 3. Subtle analog noise hi-hat
      if (step % 2 === 1) {
        const bufferSize = this.audioCtx.sampleRate * 0.05;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;

        const noiseGain = this.audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.05, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.bassFilter);
        noise.start(now);
      }

      step = (step + 1) % 16;
      this.notify();
    }, stepDurationMs);
  }

  private stopProceduralSynth() {
    this.isSynthesizing = false;
    if (this.synthInterval) {
      window.clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  public subscribe(cb: AudioEventCallback): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(isEnded = false) {
    let curTime = 0;
    let dur = this.currentTrack?.duration || 210;
    let buffered = 0;

    if (this.isSynthesizing) {
      curTime = this.synthCurrentTime;
      dur = this.synthDuration;
      buffered = 100;
    } else if (this.isYouTubeTrack) {
      curTime = this.ytCurrentTime;
      dur = this.ytDuration > 0 ? this.ytDuration : this.currentTrack?.duration || 210;
      buffered = this.ytBuffered;
    } else if (this.audio) {
      curTime = this.audio.currentTime || 0;
      dur = !isNaN(this.audio.duration) && this.audio.duration > 0 ? this.audio.duration : this.currentTrack?.duration || 0;
      if (this.audio.buffered && this.audio.buffered.length > 0 && dur > 0) {
        buffered = (this.audio.buffered.end(this.audio.buffered.length - 1) / dur) * 100;
      }
    }

    const payload = {
      currentTime: curTime,
      duration: dur,
      isPlaying: this.isPlaying,
      buffered,
      isSynthesizedFallback: this.isSynthesizing,
      isEnded,
    };

    this.listeners.forEach((cb) => cb(payload));
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      volume: this.volume,
      isMuted: this.isMuted,
      currentTrack: this.currentTrack,
      isSynthesized: this.isSynthesizing,
    };
  }
}

export const audioEngine = new AudioEngine();
