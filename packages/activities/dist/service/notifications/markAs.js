"use strict";

var _ = require('lodash');
var VError = require('verror');
var promisePlusCb = require('@openagenda/service-utils/promisePlusCb');
var notificationStates = require('../notificationStates');

var config = void 0;
var knex = void 0;
var service = void 0;

module.exports = Object.assign(markAs, { init: init });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex,
      s = _ref.service;


  config = c;
  knex = k;
  service = s;
}

function parseArguments(identifiers, query, newState, options, cb) {

  var result = {
    identifiers: identifiers,
    query: query,
    newState: newState,
    options: options,
    cb: cb
  };

  var args = Array.isArray(arguments) ? arguments : Array.from(arguments);

  if (typeof args[args.length - 1] !== 'function') {
    args.push(null);
  }

  if (args.length === 4) {

    Object.assign(result, {
      identifiers: args[0],
      query: args[1],
      newState: args[2],
      options: {},
      cb: args[3]
    });
  }

  return result;
}

function markAs() {
  var _parseArguments$apply = parseArguments.apply(null, arguments),
      identifiers = _parseArguments$apply.identifiers,
      query = _parseArguments$apply.query,
      newState = _parseArguments$apply.newState,
      options = _parseArguments$apply.options,
      cb = _parseArguments$apply.cb;

  if (identifiers.entityType && identifiers.entityType !== 'user') {

    return promisePlusCb(Promise.reject(new VError('The notifications concern only feeds users')), cb);
  }

  var params = _.merge({
    allowRegress: true,
    listArgs: []
  }, options);

  if (typeof newState === 'string') newState = notificationStates.reverse[newState];

  var promise = service.feed(identifiers).get({ internal: true }).then(function (feed) {

    if (feed === null) {
      return Promise.reject(new VError('Feed not found'));
    }

    if (feed.entityType !== 'user') {
      return Promise.reject(new VError('The notifications concern only user feeds'));
    }

    return service.feed(feed).notifications.list.apply(null, [query].concat(params.listArgs)).then(function (notifs) {

      var request = knex(config.schemas.feed_notification).where('feed_id', feed.id).whereIn('id', notifs.map(function (v) {
        return v.id;
      }));

      if (!params.allowRegress) {
        request.where('state', '<', newState);
      }

      return request.update({
        state: newState
      }).then(function () {
        return service.feed(feed).notifications.list.apply(null, [query].concat(params.listArgs));
      });
    });
  });

  return promisePlusCb(promise, cb);
};
//# sourceMappingURL=markAs.js.map