'use strict';

const _ = require('lodash');

const log = require('../lib/Log')('middleware/error');

const pageGlobals = require('./pageGlobals');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  const message = _.get(err, 'response.data.error', _.get(err, 'message'));

  log('error', message || err);

  pageGlobals(req, res, () => {
    res.status(500).render(
      'error',
      _.assign(req.data || {}, {
        message: process.env.NODE_ENV === 'development' ? message : null
      })
    );
  });
};
