// The frame of a field where a value is typed or picked — input, textarea,
// select, combobox — beyond what Chakra draws: its corners, and how it shows
// that it has the focus or that it is refused. Shared by their recipes, so
// they all look alike.
// The size of a field at the default size (`md`): 44px tall, a comfortable
// target for a finger, with 14px of text inset. Taller than a button at its
// default size: a field set beside one says so with `size`.
export const FIELD_HEIGHT = 'sizes.11';
export const FIELD_INSET = '3.5';

export const fieldFrame = {
  // A step rounder than the rest (see semanticTokens/radii.ts)
  borderRadius: 'field',
  // A field takes the focus in the colour of the palette itself, a step
  // livelier than the ring of the other controls (`focusRing`): 4.58:1 on
  // white for the primary one, where a focus mark needs 3:1
  '--field-halo': 'colors.colorPalette.solid',
  '--focus-color': 'colors.colorPalette.solid',
  // What a field suggests while empty: 4.83:1 on white, as text needs 4.5:1
  _placeholder: { color: 'control.placeholder' },
  // Focused: a soft halo around the ring Chakra draws, so the field stands
  // out in a long form without a heavier border at rest
  _focusVisible: {
    // Set here, once the field has the focus: at rest Chakra's own ring
    // (`focusVisibleRing`) would set its colour back after this one
    focusRingColor: 'var(--field-halo)',
    boxShadow:
      '0 0 0 3px color-mix(in srgb, var(--field-halo) 25%, transparent)',
  },
  // Refused: the border reads twice as thick, by more than its colour. Drawn
  // inside, so that nothing moves when the error comes and goes.
  _invalid: {
    '--field-halo': 'colors.border.error',
    boxShadow: 'inset 0 0 0 1px var(--field-halo)',
    _focusVisible: {
      focusRingColor: 'var(--field-halo)',
      boxShadow:
        'inset 0 0 0 1px var(--field-halo), 0 0 0 3px color-mix(in srgb, var(--field-halo) 25%, transparent)',
    },
  },
};
