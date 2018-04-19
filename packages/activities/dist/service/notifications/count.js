"use strict";

var _ = require('lodash');
var VError = require('verror');
var promisePlusCb = require('@openagenda/service-utils/promisePlusCb');
var schema = require('@openagenda/validators/schema');
var validators = require('@openagenda/validators');
var notificationStates = require('../notificationStates');

var config = void 0;
var knex = void 0;
var service = void 0;

schema.register({
  choice: validators.choice,
  text: validators.text
});

module.exports = Object.assign(count, { init: init });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex,
      s = _ref.service;


  config = c;
  knex = k;
  service = s;
}

function parseArguments(identifiers, query, cb) {

  var result = {
    identifiers: identifiers,
    query: query,
    cb: cb
  };

  var args = Array.isArray(arguments) ? arguments : Array.from(arguments);

  if (typeof args[args.length - 1] !== 'function') {
    args.push(null);
  }

  if (args.length === 2) {

    Object.assign(result, {
      identifiers: args[0],
      query: { state: 0 },
      cb: args[1]
    });
  }

  return result;
}

function count() {
  var _parseArguments$apply = parseArguments.apply(null, arguments),
      identifiers = _parseArguments$apply.identifiers,
      query = _parseArguments$apply.query,
      cb = _parseArguments$apply.cb;

  if (identifiers.entityType && identifiers.entityType !== 'user') {

    return promisePlusCb(Promise.reject(new VError('The notifications concern only feeds users')), cb);
  }

  var validateQuery = schema({
    state: {
      type: 'choice',
      options: notificationStates.codes,
      unique: true,
      optional: true
    }
  });

  try {

    validateQuery(query);
  } catch (errors) {

    return promisePlusCb(Promise.reject(new VError({ info: { errors: errors } }, 'Query validation failed')), cb);
  }

  var where = _.pickBy(_.mapKeys(query, function (value, key) {
    return _.snakeCase(key);
  }), function (value) {
    return value !== undefined;
  });

  var promise = service.feed(identifiers).get({ internal: true }).then(function (feed) {

    if (feed === null) return Promise.reject(new VError('Feed not found'));

    if (feed.entityType && feed.entityType !== 'user') {
      return Promise.reject(new VError('The notifications concern only feeds users'));
    }

    return knex(config.schemas.feed_notification).first().count('id as count').where(where).where('feed_id', feed.id).then(function (_ref2) {
      var count = _ref2.count;
      return count;
    });
  });

  return promisePlusCb(promise, cb);
};
//# sourceMappingURL=count.js.map