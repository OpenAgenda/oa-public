"use strict";

var _ = require('lodash');
var promisePlusCb = require('@openagenda/service-utils/promisePlusCb');
var schema = require('@openagenda/validators/schema');
var validators = require('@openagenda/validators');
var method = require('../../utils/method');

var FEED_TYPES = require('../feedTypes');

var config = void 0;
var knex = void 0;

schema.register({
  choice: validators.choice,
  number: validators.number
});

module.exports = Object.assign(get, { init: init });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex;


  config = c;
  knex = k;
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

function get() {
  var _parseArguments$apply = parseArguments.apply(null, arguments),
      identifiers = _parseArguments$apply.identifiers,
      options = _parseArguments$apply.options,
      cb = _parseArguments$apply.cb;

  var entityType = identifiers.entityType,
      entityUid = identifiers.entityUid,
      id = identifiers.id;


  var params = _.merge({
    internal: false,
    followed: false,
    followedBy: false
  }, options);

  var defaultHook = _.merge({}, {
    data: {
      entityType: entityType,
      entityUid: entityUid,
      id: id
    }
  });

  var promise = method([{
    field: {
      name: 'id',
      internal: true
    },
    before: function before(field, fields, hook, next) {
      if (hook.data.id) {
        field.schema = {
          type: 'number',
          optional: false
        };
      }

      next();
    }
  }, {
    field: {
      name: 'entity_type',
      dataKey: 'entityType'
    },
    before: function before(field, fields, hook, next) {
      if (!hook.data.id) {
        field.schema = {
          type: 'choice',
          options: FEED_TYPES,
          unique: true,
          optional: false
        };
      }

      next();
    }
  }, {
    field: {
      name: 'entity_uid',
      dataKey: 'entityUid'
    },
    before: function before(field, fields, hook, next) {
      if (!hook.data.id) {
        field.schema = {
          type: 'number',
          optional: false
        };
      }

      next();
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

    var columnToSelect = hook.fields.reduce(function (prev, field) {
      if (!params.internal && field.internal) return prev;

      prev.push((field.table ? field.table + '.' + field.name : field.name) + (' as ' + (field.dataKey || field.name)));
      return prev;
    }, []);

    if (!params.internal && (params.followed || params.followedBy)) {
      columnToSelect.push('id');
    }

    var where = hook.fields.reduce(function (prev, field) {
      if (!hook.data[field.dataKey || field.name]) return prev;

      prev[field.name] = hook.data[field.dataKey || field.name];
      return prev;
    }, {});

    return knex(config.schemas.feed).first(columnToSelect).where(where).then(function (feed) {

      if (!feed || !params.followed) return feed;

      return knex(config.schemas.feed_follow).select().where({ target_feed: feed.id }).then(function (rows) {

        feed.followed = rows.map(function (row) {
          var mappedFeed = _.mapKeys(row, function (v, k) {
            return _.camelCase(k);
          });
          mappedFeed.store = JSON.parse(mappedFeed.store || '{}');
          return mappedFeed;
        });

        return feed;
      });
    }).then(function (feed) {

      if (!feed || !params.followedBy) return feed;

      return knex(config.schemas.feed_follow).select().where({ origin_feed: feed.id }).then(function (rows) {

        feed.followedBy = rows.map(function (row) {
          var mappedFeed = _.mapKeys(row, function (v, k) {
            return _.camelCase(k);
          });
          mappedFeed.store = JSON.parse(mappedFeed.store || '{}');
          return mappedFeed;
        });

        return feed;
      });
    }).then(function (feed) {

      if (!feed) return null;

      if (!params.internal && (params.followed || params.followedBy)) {
        feed = _.omit(feed, 'id');
      }

      return feed;
    });
  }, { defaultHook: defaultHook });

  return promisePlusCb(promise, cb);
};
//# sourceMappingURL=get.js.map