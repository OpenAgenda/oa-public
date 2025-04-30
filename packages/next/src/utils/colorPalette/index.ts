// based on https://github.com/SimeonGriggs/tints.dev

import { getLuminance, parseToHsla, toHex } from 'color2k';
import {
  createSaturationScale,
  createHueScale,
  createDistributionValues,
} from './scales';
import { unsignedModulo, clamp, lightnessFromHSLum } from './helpers';
import { DEFAULT_PALETTE_CONFIG } from './constants';
import type { PaletteConfig } from './types';

type PartialPaletteConfig = {
  value: string;
} & Partial<Omit<PaletteConfig, 'value'>>;

export function createSwatches(paletteConfig: PartialPaletteConfig) {
  const { value } = paletteConfig;

  // Tweaks may be passed in, otherwise use defaults
  const valueStop = paletteConfig.valueStop ?? DEFAULT_PALETTE_CONFIG.valueStop;
  const useLightness =
    paletteConfig.useLightness ?? DEFAULT_PALETTE_CONFIG.useLightness;
  const h = paletteConfig.h ?? DEFAULT_PALETTE_CONFIG.h;
  const s = paletteConfig.s ?? DEFAULT_PALETTE_CONFIG.s;
  const lMin = paletteConfig.lMin ?? DEFAULT_PALETTE_CONFIG.lMin;
  const lMax = paletteConfig.lMax ?? DEFAULT_PALETTE_CONFIG.lMax;

  // Create hue and saturation scales based on tweaks
  const hueScale = createHueScale(h, valueStop);
  const saturationScale = createSaturationScale(s, valueStop);

  // Get the base hex's H/S/L values
  const [valueH, valueS, valueL] = parseToHsla(value);

  // Create lightness scales based on tweak + lightness/luminance of current value
  const lightnessValue = useLightness
    ? valueL * 100
    : getLuminance(value) * 100;
  const distributionScale = createDistributionValues(
    lMin,
    lMax,
    lightnessValue,
    valueStop,
  );

  const swatches = hueScale.map(({ stop }, stopIndex) => {
    const newH = unsignedModulo(valueH + hueScale[stopIndex].tweak, 360);
    const newS = clamp(valueS * 100 + saturationScale[stopIndex].tweak, 0, 100);
    const newL = clamp(
      useLightness
        ? distributionScale[stopIndex].tweak
        : lightnessFromHSLum(newH, newS, distributionScale[stopIndex].tweak),
      0,
      100,
    );

    const newHex = toHex(`hsla(${newH}, ${newS}%, ${newL}%)`);

    return {
      stop,
      hex: stop === valueStop ? value.toUpperCase() : newHex.toUpperCase(),
    };
  });

  return swatches;
}

export default function createColorPalette(
  paletteConfig: PartialPaletteConfig,
) {
  return createSwatches(paletteConfig).reduce(
    (accu, swatch) => ({
      ...accu,
      [swatch.stop]: { value: swatch.hex },
    }),
    {},
  );
}
