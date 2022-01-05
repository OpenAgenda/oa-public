'use strict';

const path = require('path');
const { fork } = require('child_process');
const concurrently = require('concurrently');
const loadEnvironment = require('../utils/loadEnvironment');

const envDir = process.env.PORTAL_DEV
  ? path.join(__dirname, '../boot')
  : process.cwd();

loadEnvironment(envDir);

if (process.env.NODE_ENV !== 'production') {
  const script = process.env.PORTAL_DEV ? 'dev' : 'server';

  concurrently([
    {
      name: 'server',
      command: `browser-refresh ${script}`
    },
    {
      name: 'build',
      command: `webpack serve --config ${path.join(__dirname, 'webpack.dev.js')} --hot`,
      cwd: path.dirname(__dirname), // to use the good webpack
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORTAL_DEV_SERVER_PORT: process.env.PORTAL_DEV_SERVER_PORT,
        PORTAL_SASS_PATH: process.env.PORTAL_SASS_PATH,
        PORTAL_ASSETS_FOLDER: process.env.PORTAL_ASSETS_FOLDER
      }
    }
  ]);
} else {
  fork('server');
}
