'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('helpers');
const validator = require('../validator');
const cookieValidate = require('../../../iso/cookie.validate');

function callbackify(p, cb) {
  p.then(
    (result) => {
      // do not handle sync errors in callback with promise
      process.nextTick(cb.bind(null, null, result));
    },
    (err) => {
      process.nextTick(cb.bind(null, err));
    },
  );
}

function callInterface(interfaces, name, args) {
  return new Promise((rs, rj) => {
    interfaces[name].apply(
      null,
      (_.isArray(args) ? args : [args]).concat((err, result) => {
        if (err) return rj(err);

        rs(result);
      }),
    );
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
  } catch (e) {
    log('error', e);
  }

  Object.keys(clean).forEach((k) => {
    session[k] = clean[k];
  });

  return session;
}

function generateSessionUser(config, user) {
  const { cultures, expire } = config;

  const latestActivity = new Date();
  const expires = new Date(latestActivity.getTime() + expire * 1000);

  const validate = validator({ cultures });

  try {
    return {
      sessionUser: validate({
        latestActivity,
        expires,
        ...user,
      }),
      expires,
      errors: [],
    };
  } catch (errors) {
    return {
      errors,
    };
  }
}

module.exports = {
  cleanSession,
  callbackify,
  getUser,
  generateSessionUser,
};
