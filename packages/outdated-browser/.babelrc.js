'use strict';

module.exports = {
  presets: [
    [
      require.resolve('@openagenda/babel-preset'),
      {
        modules: 'commonjs',
        targets: {
          browsers: [
            'ie 6',
          ],
        },
      }
    ]
  ],
};
