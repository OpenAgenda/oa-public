"use strict";

var _ = require('lodash');
var promisePlusCb = require('@openagenda/service-utils/promisePlusCb');
var schema = require('@openagenda/validators/schema');
var validators = require('@openagenda/validators');
var log = require('@openagenda/logs')('activities/feeds/create');
var method = require('../../utils/method');

var FEED_TYPES = require('../feedTypes');

var config = void 0;
var knex = void 0;
var service = void 0;

schema.register({
  choice: validators.choice,
  number: validators.number
});

module.exports = Object.assign(create, { init: init });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex,
      s = _ref.service;


  config = c;
  knex = k;
  service = s;
}

function parseArguments(identifiers, options, cb) {

  var result = {
    identifiers: identifiers,
    options: options,
    cb: cb
  };

  var args = Array.isArray(arguments) ? arguments : Array.from(arguments);

  if (typeof args[args.length - 1] !== 'function') {
    args.push(null);
  }

  if (args.length === 2) {

    Object.assign(result, {
      identifiers: args[0],
      options: {},
      cb: args[1]
    });
  }

  return result;
}

function create() {
  var _parseArguments$apply = parseArguments.apply(null, arguments),
      identifiers = _parseArguments$apply.identifiers,
      options = _parseArguments$apply.options,
      cb = _parseArguments$apply.cb;

  var entityType = identifiers.entityType,
      entityUid = identifiers.entityUid;


  var defaultHook = {
    data: {
      entityType: entityType,
      entityUid: entityUid
    }
  };

  var promise = method([{
    field: {
      name: 'entity_type',
      dataKey: 'entityType',
      schema: {
        type: 'choice',
        options: FEED_TYPES,
        unique: true,
        optional: false
      }
    }
  }, {
    field: {
      name: 'entity_uid',
      dataKey: 'entityUid',
      schema: {
        type: 'number',
        optional: false
      }
    }
  }], function (hook, next) {

    var dataSchema = hook.fields.reduce(function (prev, field) {
      if (!field.schema) return prev;

      prev[field.dataKey || field.name] = field.schema;

      return prev;
    }, {});

    var validate = schema(dataSchema);

    try {
      hook.data = validate(hook.data);
    } catch (e) {
      return next(e);
    }

    var fields = hook.fields.reduce(function (prev, field) {
      if (!hook.data[field.dataKey || field.name]) return prev;

      prev[field.name] = hook.data[field.dataKey || field.name];
      return prev;
    }, {});

    return service.feed(identifiers).get().then(function (feed) {

      if (feed) return Promise.reject(new Error('Feed already exists'));
    }).catch(function (error) {

      if (error && error.message === 'Feed doesn\'t exists') return;

      return Promise.reject(error);
    }).then(function () {

      return knex(config.schemas.feed).insert(fields);
    }).then(function (ids) {

      return service.feed(ids[0]).get(options);
    }).then(function (feed) {

      log.info('Feed created (type %s, uid %s)', feed.entityType, feed.entityUid);

      return feed;
    });
  }, { defaultHook: defaultHook });

  return promisePlusCb(promise, cb);
}
//# sourceMappingURL=create.js.map