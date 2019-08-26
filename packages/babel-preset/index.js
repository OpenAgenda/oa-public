'use strict';

const path = require('path');
const { declare } = require('@babel/helper-plugin-utils');

function isBabelLoader(caller) {
  return !!(caller && caller.name === 'babel-loader');
}

function getBabelRuntimeName(corejs) {
  if (!corejs) {
    return '@babel/runtime';
  }

  if (typeof corejs === 'number') {
    return `@babel/runtime-corejs${corejs}`;
  }

  if (typeof corejs.version === 'number') {
    return `@babel/runtime-corejs${corejs.version}`;
  }

  throw new Error(`Preset @openagenda: 'corejs' option is invalid.`);
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

  const useAbsoluteRuntime = typeof options.absoluteRuntime === 'boolean' ? options.absoluteRuntime : true;
  const absoluteRuntimePath = useAbsoluteRuntime
    ? path.dirname(require.resolve(`${getBabelRuntimeName(corejs)}/package.json`))
    : undefined;

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
        corejs,
        absoluteRuntime: absoluteRuntimePath
      }
    ],
    require('@babel/plugin-syntax-dynamic-import'),
    isWebpack
      ? null
      : require('babel-plugin-dynamic-import-node'),

    require('@babel/plugin-proposal-object-rest-spread'),

    // Stage 0
    require('@babel/plugin-proposal-function-bind'),

    // Stage 1
    require('@babel/plugin-proposal-export-default-from'),
    require('@babel/plugin-proposal-do-expressions'),

    // Stage 2
    [
      require('@babel/plugin-proposal-decorators'),
      {
        legacy: true
      }
    ],
    require('@babel/plugin-proposal-export-namespace-from'),
    require('@babel/plugin-proposal-throw-expressions'),

    // Stage 3
    [
      require('@babel/plugin-proposal-class-properties'),
      {
        loose: true
      }
    ]
  ]
    .filter(v => v !== null);

  return {
    presets,
    plugins
  };
});
