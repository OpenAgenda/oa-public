'use strict';

module.exports = {
  presets: [
    require.resolve('@openagenda/babel-preset')
  ],
  plugins: [
    require.resolve('@loadable/babel-plugin')
  ],
  sourceType: 'unambiguous'
};
