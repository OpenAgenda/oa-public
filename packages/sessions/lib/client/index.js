"use strict";

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require('lodash');

var base64 = require('@openagenda/utils/base64');

var config = require('../../iso/config');
var validate = require('../../iso/cookie.validate.js');

var cookies = require('cookies-js');

module.exports = {
  getUser: getUser,
  notifications: {
    getCount: getNotificationCount,
    setCount: setNotificationCount
  },
  inbox: {
    getSummary: getInboxSummary,
    setSummary: setInboxSummary
  },
  isLogged: isLogged,
  flash: flash,
  test: {
    loadCookiesLib: function loadCookiesLib(c) {
      return cookies = c;
    }
  }
};

function getUser() {

  return _getSession().user || null;
}

function isLogged() {

  return !!getUser();
}

function getNotificationCount() {
  var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;


  var session = _getWritable() || {};

  if (now === null) {

    now = new Date();
  }

  if (!_.get(session, 'notifications.updatedAt', null)) {

    return null;
  }

  if (session.notifications.updatedAt.getTime() + config.notificationMaxAge < now.getTime()) {

    return null;
  }

  return session.notifications.count;
}

function getInboxSummary() {

  return _.get(_getWritable(), 'inbox');
}

function setInboxSummary(update) {

  var session = _getWritable() || {};

  session.inbox = update;

  _setWritable(session);
}

function setNotificationCount(count) {

  var writable = _getWritable() || {};

  writable.notifications = {
    updatedAt: new Date(),
    count: count
  };

  _setWritable(writable);
}

function flash() {

  var values = _getWritable(),
      flash = values ? values.flash : null;

  _setWritable(_.extend(values, { flash: null }));

  return flash;
}

function _setWritable(update) {

  var clean = void 0;

  try {

    clean = validate.writable(update);
  } catch (e) {

    clean = {};
  }

  cookies.set(config.cookies.writable, base64.encode((0, _stringify2.default)(clean)));
}

function _getSession() {

  return _get(config.cookies.session, validate) || validate.validateUnlogged.defaultValue;
}

function _getWritable() {

  return _get(config.cookies.writable, validate.writable, true);
}

function _get(name, validate) {
  var useDefault = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


  var cookieValue = cookies.get(name),
      clean = void 0;

  if (!cookieValue) return useDefault ? validate.default : null;

  try {

    clean = validate(JSON.parse(base64.decode(cookieValue)));
  } catch (e) {

    return useDefault ? validate.default : null;
  }

  return clean;
}
//# sourceMappingURL=index.js.map