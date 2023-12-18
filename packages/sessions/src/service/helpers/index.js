'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('helpers');
const cookieValidate = require('../../../iso/cookie.validate');

function callbackify(p, cb) {
  p.then(result => {
    // do not handle sync errors in callback with promise
    process.nextTick(cb.bind(null, null, result));
  }, err => {
    process.nextTick(cb.bind(null, err));
  });
}

function callInterface(interfaces, name, args) {
  return new Promise((rs, rj) => {
    interfaces[name].apply(null, (_.isArray(args) ? args : [args]).concat((err, result) => {
      if (err) return rj(err);

      rs(result);
    }));
  });
}

function getUser(interfaces, identifier) {
  try {
    return callInterface(interfaces, 'getUser', identifier);
  } catch (e) {
    log('error', e);

    throw e;
  }
}

function cleanSession(session = {}, data = {}) {
  const filtered = _.pick(session, Object.keys(session));

  let clean = {};

  try {
    clean = cookieValidate(_.extend(filtered, data));
  } catch (e) { log('error', e); }

  Object.keys(clean).forEach(k => {
    session[k] = clean[k];
  });

  return session;
}

module.exports = {
  cleanSession,
  callbackify,
  getUser,
};
