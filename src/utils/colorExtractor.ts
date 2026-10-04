/**
 * Dynamic color extraction utility for extracting dominant & vibrant colors
 * from track album artwork via HTML5 canvas analysis.
 */

export interface TrackPalette {
  primary: string;
  secondary: string;
  glow: string;
  gradient: string;
  rgbPrimary: [number, number, number];
  rgbSecondary: [number, number, number];
}

const paletteCache = new Map<string, TrackPalette>();

const DEFAULT_PALETTE: TrackPalette = {
  primary: '#00f0ff',
  secondary: '#8b5cf6',
  glow: 'rgba(0, 240, 255, 0.45)',
  gradient: 'linear-gradient(135deg, rgba(0, 240, 255, 0.7) 0%, rgba(139, 92, 246, 0.5) 100%)',
  rgbPrimary: [0, 240, 255],
  rgbSecondary: [139, 92, 246],
};

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s, l];
}

export function extractDominantPalette(
  imageUrl: string,
  fallbackAccent?: string
): Promise<TrackPalette> {
  if (paletteCache.has(imageUrl)) {
    return Promise.resolve(paletteCache.get(imageUrl)!);
  }

  return new Promise((resolve) => {
    // If running server-side or image is empty
    if (typeof window === 'undefined' || !imageUrl) {
      resolve(DEFAULT_PALETTE);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timeout = setTimeout(() => {
      // Fallback if image load hangs or has CORS blocks
      const fallback = createFallbackPalette(fallbackAccent);
      paletteCache.set(imageUrl, fallback);
      resolve(fallback);
    }, 1500);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(createFallbackPalette(fallbackAccent));
          return;
        }

        // Downscale image to 40x40 for instant sampling
        const width = 40;
        const height = 40;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height).data;
        const colorBuckets: { r: number; g: number; b: number; score: number }[] = [];

        // Sample pixels with a step to extract vibrant and dominant hues
        for (let i = 0; i < imageData.length; i += 16) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          if (a < 128) continue; // Skip transparent

          const [h, s, l] = rgbToHsl(r, g, b);

          // Discard pure blacks, whites, and extremely washed-out grays for glow purposes
          if (l < 0.12 || l > 0.92 || s < 0.18) continue;

          // Vibrancy score: prioritize high saturation and balanced lightness
          const score = s * 1.5 + (0.5 - Math.abs(l - 0.5));
          colorBuckets.push({ r, g, b, score });
        }

        if (colorBuckets.length === 0) {
          const fallback = createFallbackPalette(fallbackAccent);
          paletteCache.set(imageUrl, fallback);
          resolve(fallback);
          return;
        }

        // Sort by vibrancy score
        colorBuckets.sort((a, b) => b.score - a.score);

        const primaryCol = colorBuckets[0];
        // Find a distinct secondary color
        let secondaryCol = colorBuckets[Math.min(colorBuckets.length - 1, 5)];
        for (let j = 1; j < colorBuckets.length; j++) {
          const dist =
            Math.abs(colorBuckets[j].r - primaryCol.r) +
            Math.abs(colorBuckets[j].g - primaryCol.g) +
            Math.abs(colorBuckets[j].b - primaryCol.b);
          if (dist > 80) {
            secondaryCol = colorBuckets[j];
            break;
          }
        }

        const primaryRgb: [number, number, number] = [primaryCol.r, primaryCol.g, primaryCol.b];
        const secondaryRgb: [number, number, number] = [secondaryCol.r, secondaryCol.g, secondaryCol.b];

        const primaryStr = `rgb(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]})`;
        const secondaryStr = `rgb(${secondaryRgb[0]}, ${secondaryRgb[1]}, ${secondaryRgb[2]})`;
        const glowStr = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.6)`;
        const gradientStr = `linear-gradient(135deg, rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, 0.8) 0%, rgba(${secondaryRgb[0]}, ${secondaryRgb[1]}, ${secondaryRgb[2]}, 0.6) 100%)`;

        const palette: TrackPalette = {
          primary: primaryStr,
          secondary: secondaryStr,
          glow: glowStr,
          gradient: gradientStr,
          rgbPrimary: primaryRgb,
          rgbSecondary: secondaryRgb,
        };

        paletteCache.set(imageUrl, palette);
        resolve(palette);
      } catch {
        const fallback = createFallbackPalette(fallbackAccent);
        paletteCache.set(imageUrl, fallback);
        resolve(fallback);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      const fallback = createFallbackPalette(fallbackAccent);
      paletteCache.set(imageUrl, fallback);
      resolve(fallback);
    };

    img.src = imageUrl;
  });
}

function createFallbackPalette(accent?: string): TrackPalette {
  const baseHex = accent || '#00f0ff';
  return {
    primary: baseHex,
    secondary: '#8b5cf6',
    glow: `rgba(0, 240, 255, 0.5)`,
    gradient: `linear-gradient(135deg, ${baseHex} 0%, #8b5cf6 100%)`,
    rgbPrimary: [0, 240, 255],
    rgbSecondary: [139, 92, 246],
  };
}
