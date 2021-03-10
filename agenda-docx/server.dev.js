'use strict';

const fs = require('fs');
const express = require('express');
const webpack = require('webpack');
const webpackConfig = require('./webpack.dev');

const compiler = webpack(webpackConfig);
const service = require('./server');

const dev = express();

service.init(require('./config.dev'));

dev.use(
  require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
  })
);

dev.use(require('webpack-hot-middleware')(compiler));

dev.get('/', (req, res) => {
  fs.readFile(`${__dirname}/index.html`, 'utf-8', (err, content) => {
    res.send(content);
  });
});

dev.use('/docx', service.app);

service.task();

dev.listen(3000);
