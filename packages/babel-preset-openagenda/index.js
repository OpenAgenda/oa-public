'use strict';

const { declare } = require( '@babel/helper-plugin-utils' );

function isBabelLoader( caller ) {
  return !!(caller && caller.name === 'babel-loader');
}

module.exports = declare( ( api, options ) => {
  api.assertVersion( 7 );

  const isWebpack = api.caller( isBabelLoader );

  const debug = typeof options.debug === 'boolean' ? options.debug : false;
  const useBuiltIns = typeof options.useBuiltIns !== 'undefined' ? options.useBuiltIns : 'usage';
  const corejs = typeof options.corejs !== 'undefined' ? options.corejs : { version: 3, proposals: true };
  const modules = typeof options.modules !== 'undefined' ? options.modules : 'auto';
  const development = typeof options.development === 'boolean'
    ? options.development
    : api.cache( () => process.env.NODE_ENV !== 'production' );

  const presets = [
    [
      require( '@babel/preset-env' ).default,
      {
        debug,
        useBuiltIns,
        corejs,
        modules,
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
      require( '@babel/preset-react' ).default,
      {
        development
      }
    ]
  ];

  const plugins = [
    require( 'babel-plugin-lodash' ),
    require( 'babel-plugin-add-module-exports' ),
    [
      require( '@babel/plugin-transform-runtime' ).default,
      {
        corejs
      }
    ],
    require( '@babel/plugin-syntax-dynamic-import' ).default,
    isWebpack
      ? null
      : require( 'babel-plugin-dynamic-import-node' ),
    require( '@babel/plugin-proposal-object-rest-spread' ).default,

    // Stage 0
    require( '@babel/plugin-proposal-function-bind' ).default,

    // Stage 1
    require( '@babel/plugin-proposal-export-default-from' ).default,
    require( '@babel/plugin-proposal-do-expressions' ).default,

    // Stage 2
    [
      require( '@babel/plugin-proposal-decorators' ).default,
      {
        legacy: true
      }
    ],
    require( '@babel/plugin-proposal-export-namespace-from' ).default,
    require( '@babel/plugin-proposal-throw-expressions' ).default,

    // Stage 3
    [
      require( '@babel/plugin-proposal-class-properties' ).default,
      {
        loose: true
      }
    ]
  ]
    .filter( Boolean );

  return {
    presets,
    plugins
  };
} );
