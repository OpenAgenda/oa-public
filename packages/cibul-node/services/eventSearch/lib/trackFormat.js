'use strict';

const track = require('../../../lib/track');

const trackFormat = (req, res, next) => {
  track(req, req.agenda, 'events', 'export', req.params.format);
  next();
};

module.exports = trackFormat;
