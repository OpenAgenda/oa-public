'use strict';

const _ = require('lodash');
const bodyParser = require('body-parser');
const qs = require('qs');
const log = require('@openagenda/logs')('api/middleware/parseBodyData');

function parseTalendBody(req, res, next) {
  let rawBody = '';
  req.setEncoding('utf8');

  req.on('data', chunk => {
    rawBody += chunk;
  });
  req.on('end', () => {
    try {
      const parsed = qs.parse(rawBody);
      req.body = {
        ...parsed,
        data: JSON.parse(parsed.data),
      };
      next();
    } catch (e) {
      next(e);
    }
  });
  req.on('error', next);
}

module.exports = [
  (req, res, next) => {
    let parser;

    if (req.headers['content-type'] === 'raw') {
      log('applying talend body parser');
      parser = parseTalendBody;
    } else if (
      (req.headers['content-type'] !== 'application/json')
      && req.method !== 'PATCH'
    ) {
      log('applying raw body parser with inflate');
      parser = bodyParser.raw({
        inflate: true,
        limit: '500kb',
        type: 'text/plain',
      });
    } else {
      log('applying json body parser');
      parser = bodyParser.json();
    }

    parser(req, res, next);
  },
  (req, res, next) => {
    if (_.isBuffer(req.body)) {
      req.body = qs.parse(req.body.toString());
    }

    req.parsedData = req.body.data || req.body;

    log('got %j', req.parsedData);

    try {
      if (typeof req.parsedData === 'string') {
        req.parsedData = JSON.parse(req.parsedData);
      }
    } catch (e) {
      return res.status(400).json({
        error: 'provided json is invalid',
        agendaUid: req.params.agendaUid,
        body: req.body,
      });
    }

    next();
  },
];
