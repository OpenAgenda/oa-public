'use strict';

/* eslint-disable global-require */

const { declare } = require('@babel/helper-plugin-utils');

// caller: {
//   name: 'babel-loader',
//   target: 'web',
//   supportsStaticESM: true,
//   supportsDynamicImport: true,
//   supportsHotReload: true
// }

function isBabelLoader(caller) {
  return !!(caller && caller.name === 'babel-loader');
}

function hasSupportHotReload(caller) {
  return !!(caller && caller.supportsHotReload);
}

module.exports = declare((api, options) => {
  api.assertVersion(7);

  const env = api.env();
  const isWebpack = api.caller(isBabelLoader);
  const supportHotReload = api.caller(hasSupportHotReload);

  const envOpts = {
    debug: false,
    loose: false,
    modules: 'auto',
    shippedProposals: true,
  };

  const transformRuntime = 'transformRuntime' in options ? options.transformRuntime : true;

  let useBuiltIns;

  if ('useBuiltIns' in options) {
    useBuiltIns = options.useBuiltIns;
  } else if (transformRuntime) {
    useBuiltIns = 'usage';
  } else {
    useBuiltIns = false;
  }

  let corejs;

  if ('corejs' in options) {
    corejs = options.corejs;
  } else if (useBuiltIns) {
    corejs = { version: 3, proposals: true };
  }

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

  if ('targets' in options) {
    envOpts.targets = options.targets;
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
        ...envOpts,
      },
    ],
    require('@babel/preset-typescript'),
    [
      require('@babel/preset-react'),
      {
        development,
        runtime: 'automatic',
        importSource: options.importSource,
      },
    ],
  ];

  const plugins = [
    require('@sigmacomputing/babel-plugin-lodash'),
    require('babel-plugin-add-module-exports'),
    transformRuntime
      ? [
        require('@babel/plugin-transform-runtime'),
        {
          corejs,
          version: require('@babel/helpers/package.json').version,
        },
      ]
      : null,

    isWebpack && supportHotReload ? require('react-refresh/babel') : null,
    !isWebpack && env !== 'test' && reactIntlOpts
      ? [require('babel-plugin-react-intl'), reactIntlOpts]
      : null,
  ].filter(Boolean);

  return {
    presets,
    plugins,
  };
});
