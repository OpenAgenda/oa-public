'use strict';

module.exports = {
  babelrcRoots: [
    // Keep the root as a root
    '.',
  ],
  presets: [
    require.resolve('@openagenda/babel-preset')
  ],
  sourceType: 'unambiguous'
};
