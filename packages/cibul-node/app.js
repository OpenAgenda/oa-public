"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const qs = require('qs');

const app = express();

app
  .set('trust proxy', ['loopback', 'uniquelocal'])
  .set('query parser', str => qs.parse(str, { allowPrototypes: true, arrayLimit: Infinity }))
  .use(bodyParser.json({ limit: '5mb' }))
  .use(bodyParser.urlencoded({ limit: '500kb', extended: true }))
  .use((req, res, next) => {
    req.app = app;
    res.setHeader('X-Powered-By', 'OpenAgenda');
    next();
  });

module.exports = app;
