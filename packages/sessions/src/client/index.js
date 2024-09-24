'use strict';

const _ = require('lodash');

const base64 = require('@openagenda/utils/base64');

const cookies = require('js-cookie');
const config = require('../../iso/config');
const validate = require('../../iso/cookie.validate');

function _get(name, validateFn, useDefault = false) {
  const cookieValue = cookies.get(name);
  let clean;

  if (!cookieValue) return useDefault ? validateFn.default : null;

  try {
    clean = validateFn(JSON.parse(base64.decode(cookieValue)));
  } catch (e) {
    return useDefault ? validateFn.default : null;
  }

  return clean;
}

function _getSession() {
  return (
    _get(config.cookies.session, validate)
    || validate.validateUnlogged.defaultValue
  );
}

function _getWritable() {
  return _get(config.cookies.writable, validate.writable, true);
}

function _setWritable(update) {
  let clean;

  try {
    clean = validate.writable(update);
  } catch (e) {
    clean = {};
  }

  cookies.set(config.cookies.writable, base64.encode(JSON.stringify(clean)), {
    secure: true,
    sameSite: 'Lax',
  });
}

function getUser() {
  return _getSession().user || null;
}

function getExpires() {
  const date = _getSession().expires || null;

  return date ? new Date(date) : null;
}

function isLogged() {
  return !!getUser();
}

function getNotificationCount(n = null) {
  const session = _getWritable() || {};

  const now = n === null ? new Date() : n;

  if (!_.get(session, 'notifications.updatedAt', null)) {
    return null;
  }

  if (
    session.notifications.updatedAt.getTime() + config.notificationMaxAge
    < now.getTime()
  ) {
    return null;
  }

  return session.notifications.count;
}

function getInboxSummary() {
  return _.get(_getWritable(), 'inbox');
}

function setInboxSummary(update) {
  const session = _getWritable() || {};

  session.inbox = update;

  _setWritable(session);
}

function setNotificationCount(count) {
  const writable = _getWritable() || {};

  writable.notifications = {
    updatedAt: new Date(),
    count,
  };

  _setWritable(writable);
}

function flash() {
  const values = _getWritable();

  const flashText = values ? values.flash : null;

  _setWritable(_.extend(values, { flash: null }));

  return flashText;
}

module.exports = {
  getUser,
  getExpires,
  notifications: {
    getCount: getNotificationCount,
    setCount: setNotificationCount,
  },
  inbox: {
    getSummary: getInboxSummary,
    setSummary: setInboxSummary,
  },
  isLogged,
  flash,
};
