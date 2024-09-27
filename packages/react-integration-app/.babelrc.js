'use strict';

module.exports = {
  presets: [
    [
      require.resolve('@openagenda/babel-preset'),
      {
        modules: 'commonjs',
      },
    ],
  ],
  sourceType: 'unambiguous',
};
