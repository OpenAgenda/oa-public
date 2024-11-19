#!/usr/bin/env node

import '../utils/loadEnvironment.js';

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fork } from 'node:child_process';
import concurrently from 'concurrently';

const portalDir = process.env.PORTAL_DEV
  ? path.join(import.meta.dirname, '../boot') // when developping agenda-portal lib
  : process.cwd(); // when developping portal using agenda-portal

if (process.env.NODE_ENV === 'production') {
  fork('server');
  // return;
} else {
  const script = process.env.PORTAL_DEV ? 'dev' : 'server';

  const browserRefreshBin = fileURLToPath(
    import.meta.resolve('browser-refresh/bin/browser-refresh'),
  );
  const webpackBin = fileURLToPath(
    import.meta.resolve('webpack/bin/webpack.js'),
  );

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
      command: `${webpackBin} serve --config ${path.join(import.meta.dirname, 'webpack.inte.js')} --hot`,
      cwd: path.dirname(import.meta.dirname), // to use the good webpack
      env: {
        PORTAL_DIR: portalDir,
        NODE_ENV: process.env.NODE_ENV ?? 'development',
      },
    },
  ]);
}
