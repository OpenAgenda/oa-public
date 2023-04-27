'use strict';

const model = require('../model');
const getSocialLinks = require('./lib/getSocialLinks');

const instanciate = require('./instance');
const getIcsHead = require('./instance/ics').head;

module.exports = {
  initless: true,
  search: () => new Error('event.search is no longer available'),
  getSocialLinks,
  list: model.events().list,
  instanciate,
  STATETYPES: model.events().STATETYPES,
  getIcsHead,
};

module.exports.mw = require('./middleware')(module.exports);

module.exports.exports = require('./exportLib')(module.exports);
