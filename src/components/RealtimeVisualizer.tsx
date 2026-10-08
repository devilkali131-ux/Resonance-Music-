import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import { Activity, BarChart2, Radio } from 'lucide-react';

export type VisualizerMode = 'bars' | 'wave' | 'mirror';

interface RealtimeVisualizerProps {
  isPlaying: boolean;
  accentColor?: string;
  className?: string;
  height?: number;
  mode?: VisualizerMode;
  interactive?: boolean;
  showHUD?: boolean;
}

export const RealtimeVisualizer: React.FC<RealtimeVisualizerProps> = ({
  isPlaying,
  accentColor = '#00f0ff',
  className = '',
  height = 42,
  mode: initialMode = 'bars',
  interactive = true,
  showHUD = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentMode, setCurrentMode] = useState<VisualizerMode>(initialMode);

  // Peak caps smoothing buffer
  const peaksRef = useRef<number[]>([]);
  const prevHeightsRef = useRef<number[]>([]);

  // Cycle mode
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
      const displayWidth = canvas.clientWidth || 240;
      const displayHeight = canvas.clientHeight || height;

      if (canvas.width !== Math.round(displayWidth * dpr) || canvas.height !== Math.round(displayHeight * dpr)) {
        canvas.width = Math.round(displayWidth * dpr);
        canvas.height = Math.round(displayHeight * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      if (currentMode === 'bars') {
        audioEngine.getFrequencyData(freqData);

        // Responsive bar count for studio EQ fidelity
        const barCount = displayWidth < 200 ? 20 : displayWidth < 300 ? 28 : 36;
        const spacing = 2;
        const totalSpacing = (barCount - 1) * spacing;
        const barWidth = Math.max(2.5, (displayWidth - totalSpacing) / barCount);

        if (peaksRef.current.length !== barCount) {
          peaksRef.current = new Array(barCount).fill(0);
          prevHeightsRef.current = new Array(barCount).fill(0);
        }

        for (let i = 0; i < barCount; i++) {
          const sampleIdx = Math.floor((i / barCount) * 48);
          const rawVal = freqData[sampleIdx] || 0;
          const normalized = isPlaying ? rawVal / 255 : 0.04;

          // Attack & Decay smoothing for natural audio motion
          const targetHeight = Math.max(2, normalized * (displayHeight - 4));
          const currentHeight = prevHeightsRef.current[i] || 0;
          const smoothedHeight = currentHeight + (targetHeight - currentHeight) * 0.45;
          prevHeightsRef.current[i] = smoothedHeight;

          // Peak falloff
          if (smoothedHeight > peaksRef.current[i]) {
            peaksRef.current[i] = smoothedHeight;
          } else {
            peaksRef.current[i] = Math.max(2, peaksRef.current[i] - 0.7);
          }

          const x = i * (barWidth + spacing);
          const y = displayHeight - smoothedHeight;

          // Rich studio neon gradient fill
          const grad = ctx.createLinearGradient(0, displayHeight, 0, y);
          grad.addColorStop(0, `${accentColor}33`);
          grad.addColorStop(0.5, accentColor);
          grad.addColorStop(1, '#ffffff');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, smoothedHeight, [2, 2, 0, 0]);
          ctx.fill();

          // Peak cap floating indicator
          if (isPlaying && peaksRef.current[i] > 4) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = accentColor;
            ctx.shadowBlur = 4;
            ctx.fillRect(x, displayHeight - peaksRef.current[i] - 1.5, barWidth, 1.5);
            ctx.shadowBlur = 0;
          }
        }
      } else if (currentMode === 'wave') {
        audioEngine.getTimeDomainData(waveData);

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = isPlaying ? 10 : 3;

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

        // Secondary subtle glow ribbon underneath
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ffffff88';
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (currentMode === 'mirror') {
        audioEngine.getFrequencyData(freqData);

        const barCount = displayWidth < 200 ? 16 : 24;
        const spacing = 2;
        const totalSpacing = (barCount - 1) * spacing;
        const barWidth = Math.max(2, (displayWidth - totalSpacing) / barCount);
        const midY = displayHeight / 2;

        for (let i = 0; i < barCount; i++) {
          const sampleIdx = Math.floor((i / barCount) * 40);
          const rawVal = freqData[sampleIdx] || 0;
          const h = isPlaying ? (rawVal / 255) * (displayHeight * 0.46) : 2;

          const x = i * (barWidth + spacing);

          const grad = ctx.createLinearGradient(0, midY - h, 0, midY + h);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.3, accentColor);
          grad.addColorStop(0.7, accentColor);
          grad.addColorStop(1, '#ffffff');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, midY - h, barWidth, Math.max(3, h * 2), 2);
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
    <div className={`relative flex flex-col w-full select-none ${className}`}>
      {/* Studio Header HUD */}
      {showHUD && (
        <div className="flex items-center justify-between text-[10px] text-white/50 font-mono tracking-wider mb-1.5 px-1">
          <div className="flex items-center gap-1.5 text-white/70">
            <Radio className={`w-3 h-3 ${isPlaying ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="font-semibold uppercase tracking-widest text-[9px]">
              Studio Sound • {currentMode === 'bars' ? 'Spectrum EQ' : currentMode === 'wave' ? 'Oscilloscope' : 'Stereo Mirror'}
            </span>
          </div>

          {interactive && (
            <div className="flex items-center gap-1 bg-white/[0.06] rounded-lg p-0.5 border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setCurrentMode('bars')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all cursor-pointer ${
                  currentMode === 'bars' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Frequency Spectrum Bars"
              >
                <BarChart2 className="w-2.5 h-2.5 inline mr-0.5" />
                EQ
              </button>
              <button
                type="button"
                onClick={() => setCurrentMode('wave')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all cursor-pointer ${
                  currentMode === 'wave' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Sine Wave Oscilloscope"
              >
                <Activity className="w-2.5 h-2.5 inline mr-0.5" />
                Wave
              </button>
              <button
                type="button"
                onClick={() => setCurrentMode('mirror')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-all cursor-pointer ${
                  currentMode === 'mirror' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Stereo Mirror Spectrum"
              >
                Mirror
              </button>
            </div>
          )}
        </div>
      )}

      {/* Canvas Display */}
      <div
        ref={containerRef}
        onClick={handleToggleMode}
        title={interactive ? `Click to cycle visualizer mode (Current: ${currentMode})` : undefined}
        className="relative w-full rounded-xl overflow-hidden cursor-pointer"
        style={{ height }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
};
