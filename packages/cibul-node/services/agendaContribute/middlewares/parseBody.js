'use strict';

const _ = require('lodash');
const qs = require('qs');
const bodyParser = require('body-parser');
const log = require('@openagenda/logs')('services/agendaContribute/parseBody');

module.exports = function parseBody(req, res, next) {
  let rawBody = '';

  req.setEncoding('utf8');

  req.on('data', chunk => {
    rawBody += chunk;
  });

  req.on('end', () => {
    try {
      console.log(rawBody);
    } catch(e) {
      log('ERROR', e);
    }
  });

  req.on('error', next);
};
