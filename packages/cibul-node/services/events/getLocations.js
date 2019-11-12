"use strict";

const _ = require('lodash');
const locations = require('@openagenda/agenda-locations');

module.exports = (uids, options, cb) => {
  // internal data is not always required
  locations.list({
    uid: uids
  }, 0, uids.length, Object.assign({ fromDb: true }, options), (err, locations) => {
    if (err) return cb(err);

    cb(null, locations.map(l => _.omit(l, 'store')));
  });
}
