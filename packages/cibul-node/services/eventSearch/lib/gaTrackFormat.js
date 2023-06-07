'use strict';

const gaTrack = require('../../../lib/gaTrack');

const gaTrackFormat = (req, res, next) => {
  gaTrack(req, req.agenda, 'events', 'export', req.params.format);
  next();
};

module.exports = gaTrackFormat;
