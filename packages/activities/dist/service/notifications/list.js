"use strict";

var _ = require('lodash');
var parseListArguments = require('@openagenda/service-utils/parseListArguments');
var promisePlusCb = require('@openagenda/service-utils/promisePlusCb');
var schema = require('@openagenda/validators/schema');
var validators = require('@openagenda/validators');
var log = require('@openagenda/logs')('activities/notifications/list');
var VError = require('verror');
var notificationStates = require('../notificationStates');

var config = void 0;
var knex = void 0;
var service = void 0;

schema.register({
  text: validators.text,
  pass: validators.pass,
  number: validators.number
});

module.exports = Object.assign(list, { init: init });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex,
      s = _ref.service;


  config = c;
  knex = k;
  service = s;
}

function list(identifiers) {

  var args = parseListArguments.apply(null, Array.from(arguments).slice(1));

  args.query = _.pick(args.query, ['ids', 'actor', 'verb', 'object', 'target', 'groupBy', 'state', 'createdAt']);

  var validateArgs = schema({
    query: {
      type: 'pass'
    },
    offset: {
      type: 'number'
    },
    limit: {
      type: 'number'
    },
    options: {
      type: 'pass'
    },
    cb: {
      type: 'pass'
    }
  });

  try {

    args = validateArgs(args);
  } catch (errors) {

    return promisePlusCb(Promise.reject(new VError({ info: { errors: errors } }, 'Arguments validation failed')), cb);
  }

  var _args = args,
      query = _args.query,
      fromId = _args.offset,
      limit = _args.limit,
      options = _args.options,
      cb = _args.cb;


  var params = _.merge({}, options);

  if (identifiers.entityType && identifiers.entityType !== 'user') {

    return promisePlusCb(Promise.reject(new VError('The notifications concern only feeds users')), cb);
  }

  var validateQuery = schema({
    verb: {
      type: 'text',
      max: 255,
      optional: true
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
    },
    stateNot: {
      type: 'choice',
      options: notificationStates.codes,
      unique: true,
      optional: true
    },
    ids: {
      type: 'number',
      list: true,
      optional: true
    }
  });

  try {

    validateQuery(query);
  } catch (errors) {

    return promisePlusCb(Promise.reject(new VError({ info: { errors: errors } }, 'Query validation failed')), cb);
  }

  var _query = query,
      ids = _query.ids,
      stateNot = _query.stateNot;

  query = _.mapKeys(_.pick(query, 'verb', 'groupBy', 'state'), function (value, key) {
    return _.snakeCase(key);
  });

  var promise = service.feed(identifiers).get({ internal: true }).then(function (feed) {

    if (feed === null) return Promise.reject(new VError('Feed not found'));

    if (feed.entityType && feed.entityType !== 'user') {
      return Promise.reject(new VError('The notifications concern only feeds users'));
    }

    var request = knex(config.schemas.feed_notification).select().where(query).where('feed_id', feed.id).orderBy('updated_at', 'desc').orderBy('id', 'desc');

    if (ids) {
      request.whereIn('id', ids);
    } else {
      request.limit(limit);
    }

    if (stateNot !== undefined) {
      request.where('state', '<>', stateNot);
    }

    if (fromId) {
      request.where('id', '<', fromId);
    }

    return request.then(function (rows) {

      return rows.map(function (row) {

        row = _.mapKeys(row, function (value, key) {
          return _.camelCase(key);
        });
        row.store = JSON.parse(row.store || '{}');
        return row;
      });
    });
  }).catch(function (err) {

    log.error(err);

    return Promise.reject(err);
  });

  return promisePlusCb(promise, cb);
};
//# sourceMappingURL=list.js.map