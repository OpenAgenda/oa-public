'use strict';

const { declare } = require( '@babel/helper-plugin-utils' );


module.exports = declare( ( api, options ) => {
  api.assertVersion( 7 );

  const debug = typeof options.debug === 'boolean' ? options.debug : false;
  const useBuiltIns = typeof options.useBuiltIns !== 'undefined' ? options.useBuiltIns : false;
  const development = typeof options.development === 'boolean'
    ? options.development
    : api.cache( () => process.env.NODE_ENV !== 'production' );

  const presets = [
    [
      '@babel/preset-env',
      {
        debug,
        useBuiltIns,
        targets: {
          browsers: [
            '> 0.25%',
            'last 2 versions',
            'Firefox >= 24',
            'Chrome >= 33',
            'Safari >= 9',
            'IE >= 11',
            'last 4 Edge versions'
          ],
          node: '8'
        }
      }
    ],
    [
      '@babel/preset-react',
      {
        development
      }
    ]
  ];

  const plugins = [
    'lodash',
    'add-module-exports',

    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 2
      }
    ],
    '@babel/plugin-proposal-object-rest-spread',

    // Stage 0
    "@babel/plugin-proposal-function-bind",

    // Stage 1
    "@babel/plugin-proposal-export-default-from",

    // Stage 2
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true
      }
    ],
    '@babel/plugin-proposal-export-namespace-from',

    // Stage 3
    [
      '@babel/plugin-proposal-class-properties',
      {
        loose: true
      }
    ]
  ];

  return {
    presets,
    plugins
  };
} );
