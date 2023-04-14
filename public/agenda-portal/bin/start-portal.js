#!/usr/bin/env node

'use strict';

const path = require('path');
const { fork } = require('child_process');
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

concurrently([
  {
    name: 'server',
    command: `yarn browser-refresh ${script}`,
    env: {
      NODE_ENV: 'development'
    }
  },
  {
    name: 'build',
    command: `yarn webpack serve --config ${path.join(__dirname, 'webpack.inte.js')} --hot`,
    cwd: path.dirname(__dirname), // to use the good webpack
    env: {
      PORTAL_DIR: portalDir,
      NODE_ENV: process.env.NODE_ENV ?? 'development'
    }
  }
]);
