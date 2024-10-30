import type { PaletteConfig } from './types';

export const DEFAULT_STOP = 500;
export const DEFAULT_STOPS = [
  0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000,
];

export const DEFAULT_PALETTE_CONFIG: PaletteConfig = {
  value: '',
  valueStop: DEFAULT_STOP,
  swatches: [],
  h: 0, // Hue
  s: 0, // Saturation
  lMin: 0, // Lightness/luminance minimum
  lMax: 100, // Lightness/luminance maximum
  useLightness: true,
};
