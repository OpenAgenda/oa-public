// The frame of a field where a value is typed or picked — input, textarea,
// select, combobox — beyond what Chakra draws: its corners, and how it shows
// that it has the focus or that it is refused. Shared by their recipes, so
// they all look alike.
export const fieldFrame = {
  // A step rounder than the rest (see semanticTokens/radii.ts)
  borderRadius: 'field',
  '--field-halo': 'colors.colorPalette.focusRing',
  // Focused: a soft halo around the ring Chakra draws, so the field stands
  // out in a long form without a heavier border at rest
  _focusVisible: {
    boxShadow:
      '0 0 0 3px color-mix(in srgb, var(--field-halo) 25%, transparent)',
  },
  // Refused: the border reads twice as thick, by more than its colour. Drawn
  // inside, so that nothing moves when the error comes and goes.
  _invalid: {
    '--field-halo': 'colors.border.error',
    boxShadow: 'inset 0 0 0 1px var(--field-halo)',
    _focusVisible: {
      boxShadow:
        'inset 0 0 0 1px var(--field-halo), 0 0 0 3px color-mix(in srgb, var(--field-halo) 25%, transparent)',
    },
  },
};
