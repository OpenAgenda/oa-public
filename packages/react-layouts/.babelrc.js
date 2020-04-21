'use strict';

const path = require('path');

module.exports = {
  presets: [
    require.resolve('@openagenda/babel-preset'),
    require.resolve('@emotion/babel-preset-css-prop')
  ],
  plugins: [
    [
      require.resolve('babel-plugin-react-intl'),
      {
        messagesDir: path.resolve(__dirname, 'dist/messages')
      }
    ]
  ],
  sourceType: 'unambiguous'
};
