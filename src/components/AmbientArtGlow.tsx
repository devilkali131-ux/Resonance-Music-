import React, { useEffect, useState } from 'react';
import { extractDominantPalette, TrackPalette } from '../utils/colorExtractor';

interface AmbientArtGlowProps {
  coverUrl: string;
  accentColor?: string;
  isPlaying?: boolean;
  className?: string;
  glowIntensity?: 'subtle' | 'medium' | 'high' | 'immersive';
  children?: React.ReactNode;
}

export const AmbientArtGlow: React.FC<AmbientArtGlowProps> = ({
  coverUrl,
  accentColor = '#00f0ff',
  isPlaying = false,
  className = '',
  glowIntensity = 'medium',
  children,
}) => {
  const [palette, setPalette] = useState<TrackPalette>({
    primary: accentColor,
    secondary: '#8b5cf6',
    glow: 'rgba(0, 240, 255, 0.45)',
    gradient: `linear-gradient(135deg, ${accentColor} 0%, #8b5cf6 100%)`,
    rgbPrimary: [0, 240, 255],
    rgbSecondary: [139, 92, 246],
  });

  useEffect(() => {
    let isMounted = true;
    extractDominantPalette(coverUrl, accentColor).then((p) => {
      if (isMounted) {
        setPalette(p);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [coverUrl, accentColor]);

  // Configure blur and spread based on intensity
  const blurClass =
    glowIntensity === 'subtle'
      ? 'blur-md opacity-60 scale-95'
      : glowIntensity === 'high'
      ? 'blur-2xl opacity-80 scale-110'
      : glowIntensity === 'immersive'
      ? 'blur-3xl opacity-90 scale-125'
      : 'blur-xl opacity-75 scale-105';

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Dynamic Ambient Glow Layer 1: Primary Dominant Color */}
      <div
        className={`absolute -inset-1.5 rounded-2xl transition-all duration-700 pointer-events-none ${blurClass} ${
          isPlaying ? 'animate-pulse' : 'opacity-40'
        }`}
        style={{
          background: `radial-gradient(circle, ${palette.primary} 0%, ${palette.secondary} 70%, transparent 100%)`,
          filter: `drop-shadow(0 0 16px ${palette.glow})`,
        }}
      />

      {/* Dynamic Ambient Glow Layer 2: Secondary Tone Halo for Rich Depth */}
      <div
        className={`absolute -inset-2 rounded-2xl transition-all duration-1000 pointer-events-none blur-lg mix-blend-screen ${
          isPlaying ? 'opacity-70 scale-100' : 'opacity-20 scale-95'
        }`}
        style={{
          background: palette.gradient,
        }}
      />

      {/* Front-facing Content / Artwork */}
      <div className="relative z-10 w-full h-full rounded-inherit overflow-hidden">
        {children}
      </div>
    </div>
  );
};
