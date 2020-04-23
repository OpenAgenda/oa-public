'use strict';

const path = require('path');

module.exports = {
  presets: [
    [
      require.resolve('@openagenda/babel-preset'),
      {
        reactIntl: {
          messagesDir: path.resolve(__dirname, 'dist/messages')
        }
      }
    ]
  ],
  sourceType: 'unambiguous'
};
