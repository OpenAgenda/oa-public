'use strict';

const path = require('path');
const { builtinModules } = require('module');
const enhancedResolve = require('enhanced-resolve');

const builtins = new Set(builtinModules);

function resolve(source, file, config) {
  if (builtins.has(source)) {
    return { found: true, path: null };
  }

  try {
    const resolver = config ? enhancedResolve.create.sync(config) : enhancedResolve.sync;
    const result = resolver(path.dirname(file), source);

    return { found: true, path: result };
  } catch (e) {
    return { found: false };
  }
};

module.exports = {
  interfaceVersion: 2,
  resolve
};
