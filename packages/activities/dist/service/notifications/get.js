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

module.exports = Object.assign(get, { init: init });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex,
      s = _ref.service;


  config = c;
  knex = k;
  service = s;
}

function parseArguments(identifiers, query, options, cb) {

  var result = {
    identifiers: identifiers,
    query: query,
    options: options,
    cb: cb
  };

  var args = Array.isArray(arguments) ? arguments : Array.from(arguments);

  if (typeof args[args.length - 1] !== 'function') {
    args.push(null);
  }

  if (args.length === 3) {

    Object.assign(result, {
      identifiers: args[0],
      query: args[1],
      options: {},
      cb: args[2]
    });
  }

  return result;
}

function get() {
  var _parseArguments$apply = parseArguments.apply(null, arguments),
      identifiers = _parseArguments$apply.identifiers,
      query = _parseArguments$apply.query,
      options = _parseArguments$apply.options,
      cb = _parseArguments$apply.cb;

  var params = _.merge({
    excludeIds: []
  }, options);

  if (identifiers.entityType && identifiers.entityType !== 'user') {

    return promisePlusCb(Promise.reject(new VError('The notifications concern only feeds users')), cb);
  }

  var validateQuery = schema({
    feedId: {
      type: 'number',
      optional: true
    },
    verb: {
      type: 'text',
      max: 255,
      optional: false
    },
    groupBy: {
      type: 'text',
      max: 255,
      optional: true
    },
    state: {
      type: 'choice',
      options: notificationStates.codes,
      unique: true,
      optional: true
    }
  });

  if (typeof query !== 'number') {

    try {

      validateQuery(query);
    } catch (errors) {

      return promisePlusCb(Promise.reject(new VError({ info: { errors: errors } }, 'Query validation failed')), cb);
    }
  } else {

    query = { id: query };
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

    var request = knex(config.schemas.feed_notification).first().where(where).where('feed_id', feed.id);

    if (params.excludeIds) {
      request.whereNotIn('id', params.excludeIds);
    }

    return request.then(function (result) {

      if (result) {
        result = _.mapKeys(result, function (value, key) {
          return _.camelCase(key);
        });
        result.store = JSON.parse(result.store || '{}');
      }

      return result;
    });
  });

  return promisePlusCb(promise, cb);
};
//# sourceMappingURL=get.js.map