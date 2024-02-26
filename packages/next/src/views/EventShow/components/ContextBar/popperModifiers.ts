export const fullWidth = [
  {
    name: 'computeStyles',
    options: {
      roundOffsets: ({ y }) => ({
        x: 0,
        y,
      }),
    },
  },
  {
    name: 'menuStyles',
    enabled: true,
    phase: 'beforeWrite',
    requires: ['computeStyles'],
    fn: ({ state }) => {
      state.styles.popper.width = '100%';
    },
    effect: ({ state }) => {
      state.elements.popper.style.width = '100%';
    },
  },
];
