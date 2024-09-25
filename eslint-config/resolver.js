const path = require('node:path');
const { builtinModules } = require('node:module');
const fs = require('graceful-fs');
const enhancedResolve = require('enhanced-resolve');
const CachedInputFileSystem = require('enhanced-resolve/lib/CachedInputFileSystem');

const builtins = new Set(builtinModules);

const nodeFileSystem = new CachedInputFileSystem(fs, 4000);

function opts(config) {
  return {
    fileSystem: nodeFileSystem,
    conditionNames: ['node'],
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.node'],
    ...config,
  };
}

const defaultResolver = enhancedResolve.create.sync(opts());

function resolve(source, file, config) {
  if (builtins.has(source)) {
    return { found: true, path: null };
  }

  try {
    const resolver = config
      ? enhancedResolve.create.sync(opts(config))
      : defaultResolver;
    const result = resolver(path.dirname(file), source);

    return { found: true, path: result };
  } catch (e) {
    return { found: false };
  }
}

module.exports = {
  interfaceVersion: 2,
  resolve,
};
