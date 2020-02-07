'use strict';

const { declare } = require('@babel/helper-plugin-utils');

function isBabelLoader(caller) {
  return !!(caller && caller.name === 'babel-loader');
}


module.exports = declare((api, options) => {
  api.assertVersion(7);

  const isWebpack = api.caller(isBabelLoader);

  const debug = typeof options.debug === 'boolean' ? options.debug : false;
  const useBuiltIns = typeof options.useBuiltIns !== 'undefined' ? options.useBuiltIns : 'usage';
  const corejs = typeof options.corejs !== 'undefined' ? options.corejs : { version: 3, proposals: true };
  const modules = typeof options.modules !== 'undefined' ? options.modules : 'auto';
  const development = typeof options.development === 'boolean'
    ? options.development
    : api.cache(() => process.env.NODE_ENV !== 'production');

  const presets = [
    [
      require('@babel/preset-env'),
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
      require('@babel/preset-react'),
      {
        development
      }
    ]
  ];

  const plugins = [
    require('babel-plugin-lodash'),
    require('babel-plugin-add-module-exports'),
    [
      require('@babel/plugin-transform-runtime'),
      {
        corejs
      }
    ],

    // Stage 0
    require('@babel/plugin-proposal-function-bind'),

    // Stage 1
    require('@babel/plugin-proposal-export-default-from'),
    require('@babel/plugin-proposal-logical-assignment-operators'),
    [
      require('@babel/plugin-proposal-optional-chaining'),
      {
        loose: false
      }
    ],
    [
      require('@babel/plugin-proposal-pipeline-operator'),
      {
        proposal: 'minimal'
      }
    ],
    [
      require('@babel/plugin-proposal-nullish-coalescing-operator'),
      {
        loose: false
      }
    ],
    require('@babel/plugin-proposal-do-expressions'),

    // Stage 2
    [
      require('@babel/plugin-proposal-decorators'),
      {
        legacy: true
      }
    ],
    require('@babel/plugin-proposal-function-sent'),
    require('@babel/plugin-proposal-export-namespace-from'),
    require('@babel/plugin-proposal-numeric-separator'),
    require('@babel/plugin-proposal-throw-expressions'),

    // Stage 3
    require('@babel/plugin-syntax-dynamic-import'),
    isWebpack ? null : require('babel-plugin-dynamic-import-node'),
    require('@babel/plugin-syntax-import-meta'),
    [
      require('@babel/plugin-proposal-class-properties'),
      {
        loose: true
      }
    ],
    require('@babel/plugin-proposal-json-strings'),

    isWebpack && development ? require('react-hot-loader/babel') : null
  ]
    .filter(Boolean);

  return {
    presets,
    plugins
  };
});
