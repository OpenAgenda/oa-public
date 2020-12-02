'use strict';

const { declare } = require('@babel/helper-plugin-utils');

// caller: {
//   name: 'babel-loader',
//   supportsStaticESM: true,
//   supportsDynamicImport: true
// }

function isBabelLoader(caller) {
  return !!(caller && caller.name === 'babel-loader');
}

function hasSupportDynamicImport(caller) {
  return !!(caller && caller.supportsDynamicImport);
}

module.exports = declare((api, options) => {
  api.assertVersion(7);

  const env = api.env();
  const isWebpack = api.caller(isBabelLoader);
  const supportDynamicImport = api.caller(hasSupportDynamicImport);

  const envOpts = {
    debug: false,
    loose: false,
    modules: 'auto',
    shippedProposals: true
  };

  const transformRuntime = 'transformRuntime' in options ? options.transformRuntime : true;
  const useBuiltIns = 'useBuiltIns' in options
    ? options.useBuiltIns
    : transformRuntime
      ? 'usage'
      : false;
  const corejs = 'corejs' in options
    ? options.corejs
    : useBuiltIns
      ? { version: 3, proposals: true }
      : undefined;
  const development = 'development' in options
    ? options.development
    : api.cache(() => process.env.NODE_ENV !== 'production');
  let reactIntlOpts = null;

  switch (env) {
    case 'esm': // ESM
      envOpts.modules = false;
      break;
    case 'development': // CommonJS
    default:
      // ...
      break;
  }

  if ('modules' in options) {
    envOpts.modules = options.modules;
  }

  if ('loose' in options) {
    envOpts.loose = options.loose;
  }

  if ('reactIntl' in options) {
    reactIntlOpts = options.reactIntl;
  }

  const presets = [
    [
      require('@babel/preset-env'),
      {
        useBuiltIns,
        corejs,
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
        },
        ...envOpts
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
    transformRuntime ? [
      require('@babel/plugin-transform-runtime'),
      {
        corejs,
        version: require('@babel/helpers/package.json').version
      }
    ] : null,

    // Stage 0
    require('@babel/plugin-proposal-function-bind'),

    // Stage 1
    require('@babel/plugin-proposal-export-default-from'),
    require('@babel/plugin-proposal-logical-assignment-operators'),
    [
      require('@babel/plugin-proposal-optional-chaining'),
      {
        loose: envOpts.loose
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
        loose: envOpts.loose
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
    !supportDynamicImport ? require('babel-plugin-dynamic-import-node') : null,
    require('@babel/plugin-syntax-import-meta'),
    [
      require('@babel/plugin-proposal-class-properties'),
      {
        loose: envOpts.loose
      }
    ],
    require('@babel/plugin-proposal-json-strings'),

    isWebpack && development ? require('react-hot-loader/babel') : null,
    !isWebpack && reactIntlOpts ? [
      require('babel-plugin-react-intl'),
      reactIntlOpts
    ] : null
  ]
    .filter(Boolean);

  return {
    presets,
    plugins
  };
});
