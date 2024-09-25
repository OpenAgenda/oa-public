#!/usr/bin/env node

'use strict';

const path = require('node:path');
const { fork } = require('node:child_process');
const concurrently = require('concurrently');
const loadEnvironment = require('../utils/loadEnvironment');

const portalDir = process.env.PORTAL_DEV
  ? path.join(__dirname, '../boot') // when developping agenda-portal lib
  : process.cwd(); // when developping portal using agenda-portal

loadEnvironment(portalDir);

if (process.env.NODE_ENV === 'production') {
  fork('server');
  return;
}

const script = process.env.PORTAL_DEV ? 'dev' : 'server';

const browserRefreshBin = require.resolve(
  'browser-refresh/bin/browser-refresh',
);
const webpackBin = require.resolve('webpack/bin/webpack');

concurrently([
  {
    name: 'server',
    command: `${browserRefreshBin} ${script}`,
    env: {
      NODE_ENV: 'development',
    },
  },
  {
    name: 'build',
    command: `${webpackBin} serve --config ${path.join(__dirname, 'webpack.inte.js')} --hot`,
    cwd: path.dirname(__dirname), // to use the good webpack
    env: {
      PORTAL_DIR: portalDir,
      NODE_ENV: process.env.NODE_ENV ?? 'development',
    },
  },
]);
