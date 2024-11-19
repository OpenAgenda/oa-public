import './setEnv.js';

import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotReloadMiddleware from 'webpack-hot-middleware';
import Portal from '@openagenda/agenda-portal';
import webpackConfig from './webpack.config.js';

const dev = express();
const compiler = webpack(webpackConfig);

dev.use(
  webpackDevMiddleware(compiler, {
    publicPath: '/js',
  }),
);

dev.use(webpackHotReloadMiddleware(compiler));

Portal.loadDevApp(dev);

await import('../boot/server.js');
