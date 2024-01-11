'use strict';

const fs = require('node:fs');
const Queues = require('@openagenda/queues');
const redis = require('redis');
const express = require('express');
const webpack = require('webpack');
const webpackConfig = require('./webpack.dev');

const compiler = webpack(webpackConfig);
const Service = require('./server');

const config = require('./config.dev');

const redisClient = redis.createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

const queue = Queues({
  redis: redisClient,
  prefix: 'agendadocxtest:',
})('docx');

const dev = express();

const service = Service({
  s3: config.s3,
  localTmpPath: config.localTmpPath,
  queue,
});

dev.use(
  require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
  }),
);

dev.use(require('webpack-hot-middleware')(compiler));

dev.get('/', (req, res) => {
  fs.readFile(`${__dirname}/index.html`, 'utf-8', (err, content) => {
    res.send(content);
  });
});

dev.use('/docx', service.app);

queue.run();

dev.listen(3000);
