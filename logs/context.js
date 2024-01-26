'use strict';

const { AsyncLocalStorage } = require('node:async_hooks');

const context = new AsyncLocalStorage();

module.exports = context;
