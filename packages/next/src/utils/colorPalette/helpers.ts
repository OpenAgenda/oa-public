import { getLuminance } from 'color2k';

export function unsignedModulo(x: number, n: number) {
  return ((x % n) + n) % n;
}

export function clamp(x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max);
}

export function lightnessFromHSLum(H: number, S: number, Lum: number) {
  const vals = {};
  for (let L = 99; L >= 0; L--) {
    vals[L] = Math.abs(Lum - getLuminance(`hsl(${H}, ${S}%, ${L}%)`) * 100);
  }

  // Run through all these and find the closest to 0
  let lowestDiff = 100;
  let newL = 100;
  for (let i = Object.keys(vals).length - 1; i >= 0; i--) {
    if (vals[i] < lowestDiff) {
      newL = i;
      lowestDiff = vals[i];
    }
  }

  return newL;
}
