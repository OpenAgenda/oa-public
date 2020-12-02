'use strict';

process.env.NODE_ENV = 'development';

const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotReloadMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('./webpack.config');
const Portal = require('..');

const dev = express();
const compiler = webpack(webpackConfig);

dev.use(
  webpackDevMiddleware(compiler, {
    publicPath: '/js'
  })
);

dev.use(webpackHotReloadMiddleware(compiler));

Portal.loadDevApp(dev);

require('../boot/server');
