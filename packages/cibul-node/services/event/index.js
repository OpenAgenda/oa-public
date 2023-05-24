'use strict';

const model = require('../model');
const getSocialLinks = require('./lib/getSocialLinks');

const instanciate = require('./instance');
const getIcsHead = require('./instance/ics').head;

function get(params, cb) {
  model.events().get(params, (err, result) => {
    if (err) return cb(err);

    cb(null, result ? module.exports.instanciate(result) : null);
  });
}

module.exports = {
  initless: true,
  search: () => new Error('event.search is no longer available'),
  getSocialLinks,
  list: model.events().list,
  get,
  instanciate,
  STATETYPES: model.events().STATETYPES,
  getIcsHead,
};

module.exports.mw = require('./middleware')(module.exports);

module.exports.exports = require('./exportLib')(module.exports);
