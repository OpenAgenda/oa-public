export type SwatchValue = {
  hex: string;
  stop: number;
};

export type PaletteConfig = {
  value: string;
  valueStop: number;
  swatches: SwatchValue[];
  useLightness: boolean;
  h: number;
  s: number;
  lMin: number;
  lMax: number;
};
