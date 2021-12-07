'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const qs = require('qs');

const app = express();

function rawBodySaver(req, res, buf) {
  req.rawBody = buf;
}

app
  .set('trust proxy', ['loopback', 'uniquelocal'])
  .set('query parser', str => qs.parse(str, { allowPrototypes: true, arrayLimit: Infinity }))
  .use(bodyParser.json({ limit: '5mb', verify: rawBodySaver }))
  .use(bodyParser.urlencoded({ limit: '500kb', extended: true, verify: rawBodySaver }))
  .use((req, res, next) => {
    req.app = app;
    res.setHeader('X-Powered-By', 'OpenAgenda');
    next();
  });

module.exports = app;
