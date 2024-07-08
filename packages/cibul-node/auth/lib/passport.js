'use strict';

const passport = require('passport');

const strategies = {};

module.exports = {
  loadStrategy,
  use,
  authenticate,
  initialize,
};

function loadStrategy(name, libName, attr) {
  if (!attr) attr = 'Strategy';

  strategies[name] = require(libName)[attr];
}

function authenticate(name, options, authFunc) {
  return passport.authenticate(name, options, authFunc);
}

function use(name, strategyName, strategyParams, authFunc) {
  const strategyInstance = new strategies[strategyName](strategyParams, authFunc);

  passport.use(name, strategyInstance);
}

function initialize() {
  return passport.initialize();
}
