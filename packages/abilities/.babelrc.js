'use strict';

const oaConfig = require( '@openagenda/babel-config' );

// useful for jest and babel-node, the `rootMode: 'upward'` option is enough for @babel/cli
// babel-jest doesn't understand `extends`

module.exports = api => {
  const config = oaConfig( api );

  config.plugins.push( [
    'react-intl',
    { messagesDir: './build/messages/' }
  ] );

  return config;
};
