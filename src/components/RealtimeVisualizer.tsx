import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../services/audioEngine';

export type VisualizerMode = 'bars' | 'wave' | 'mirror';

interface RealtimeVisualizerProps {
  isPlaying: boolean;
  accentColor?: string;
  className?: string;
  height?: number;
  mode?: VisualizerMode;
  interactive?: boolean;
}

export const RealtimeVisualizer: React.FC<RealtimeVisualizerProps> = ({
  isPlaying,
  accentColor = '#00f0ff',
  className = '',
  height = 28,
  mode: initialMode = 'bars',
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentMode, setCurrentMode] = useState<VisualizerMode>(initialMode);
  const [peakCaps, setPeakCaps] = useState<number[]>([]);

  // Peak caps smoothing buffer
  const peaksRef = useRef<number[]>([]);

  // Cycle mode on click if interactive
  const handleToggleMode = () => {
    if (!interactive) return;
    setCurrentMode((prev) => (prev === 'bars' ? 'wave' : prev === 'wave' ? 'mirror' : 'bars'));
  };

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Buffer arrays for frequency & waveform
    const freqData = new Uint8Array(64);
    const waveData = new Uint8Array(64);

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth || 100;
      const displayHeight = canvas.clientHeight || height;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      if (currentMode === 'bars') {
        audioEngine.getFrequencyData(freqData);

        // Adjust bar count based on mobile width
        const barCount = displayWidth < 120 ? 16 : displayWidth < 200 ? 24 : 36;
        const totalSpacing = barCount * 1.5;
        const barWidth = Math.max(2, (displayWidth - totalSpacing) / barCount);

        if (peaksRef.current.length !== barCount) {
          peaksRef.current = new Array(barCount).fill(0);
        }

        for (let i = 0; i < barCount; i++) {
          const sampleIdx = Math.floor((i / barCount) * 40);
          const rawVal = freqData[sampleIdx] || 0;
          const normalized = isPlaying ? rawVal / 255 : 0.05;
          const barHeight = Math.max(3, normalized * (displayHeight - 4));

          // Update peak cap with smooth falloff
          if (barHeight > peaksRef.current[i]) {
            peaksRef.current[i] = barHeight;
          } else {
            peaksRef.current[i] = Math.max(3, peaksRef.current[i] - 0.6);
          }

          const x = i * (barWidth + 1.5);
          const y = displayHeight - barHeight;

          // Gradient fill tailored to track accent
          const grad = ctx.createLinearGradient(0, displayHeight, 0, y);
          grad.addColorStop(0, accentColor);
          grad.addColorStop(1, '#ffffff');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
          ctx.fill();

          // Peak cap dot
          if (isPlaying && peaksRef.current[i] > 6) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, displayHeight - peaksRef.current[i] - 1.5, barWidth, 1.5);
          }
        }
      } else if (currentMode === 'wave') {
        audioEngine.getTimeDomainData(waveData);

        ctx.lineWidth = 2;
        ctx.strokeStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = isPlaying ? 8 : 2;

        ctx.beginPath();
        const sliceWidth = displayWidth / (waveData.length - 1);
        let x = 0;

        for (let i = 0; i < waveData.length; i++) {
          const v = waveData[i] / 128.0;
          const y = (v * displayHeight) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
      } else if (currentMode === 'mirror') {
        audioEngine.getFrequencyData(freqData);

        const barCount = displayWidth < 120 ? 12 : 20;
        const barWidth = Math.max(2, (displayWidth / barCount) * 0.7);
        const midY = displayHeight / 2;

        for (let i = 0; i < barCount; i++) {
          const sampleIdx = Math.floor((i / barCount) * 32);
          const rawVal = freqData[sampleIdx] || 0;
          const h = isPlaying ? (rawVal / 255) * (displayHeight * 0.45) : 2;

          const x = (i / barCount) * displayWidth;

          const grad = ctx.createLinearGradient(0, midY - h, 0, midY + h);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.5, accentColor);
          grad.addColorStop(1, '#ffffff');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, midY - h, barWidth, h * 2, 2);
          ctx.fill();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, accentColor, currentMode, height]);

  return (
    <div
      ref={containerRef}
      onClick={handleToggleMode}
      title={interactive ? `Audio Visualizer (${currentMode.toUpperCase()} mode - Click to switch)` : 'Real-time Audio Visualizer'}
      className={`relative cursor-pointer group flex items-center justify-center ${className}`}
      style={{ height }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {interactive && (
        <span className="absolute -top-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md text-[9px] font-mono text-cyan-300 px-1.5 py-0.5 rounded border border-white/[0.1] pointer-events-none whitespace-nowrap z-20">
          Mode: {currentMode}
        </span>
      )}
    </div>
  );
};
