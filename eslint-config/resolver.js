'use strict';

const fs = require('graceful-fs');
const path = require('path');
const { builtinModules } = require('module');
const enhancedResolve = require('enhanced-resolve');
const CachedInputFileSystem = require('enhanced-resolve/lib/CachedInputFileSystem');

const builtins = new Set(builtinModules);

const nodeFileSystem = new CachedInputFileSystem(fs, 4000);
const defaultResolver = enhancedResolve.create.sync(opts());

function resolve(source, file, config) {
  if (builtins.has(source)) {
    return { found: true, path: null };
  }

  try {
    const resolver = config ? enhancedResolve.create.sync(opts(config)) : defaultResolver;
    const result = resolver(path.dirname(file), source);

    return { found: true, path: result };
  } catch (e) {
    return { found: false };
  }
}

function opts(config) {
  return Object.assign({
    fileSystem: nodeFileSystem,
    conditionNames: ['node'],
    extensions: ['.mjs', '.js', '.json', '.node'],
  }, config);
}

module.exports = {
  interfaceVersion: 2,
  resolve,
};
