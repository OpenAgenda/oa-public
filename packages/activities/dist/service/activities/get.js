"use strict";

var _ = require('lodash');
var promisePlusCb = require('@openagenda/service-utils/promisePlusCb');
var schema = require('@openagenda/validators/schema');
var validators = require('@openagenda/validators');
var method = require('../../utils/method');

var config = void 0;
var knex = void 0;
var service = void 0;

schema.register({
  number: validators.number
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

function get(identifiers, activityId, cb) {

  var defaultHook = _.merge({}, {
    data: {
      id: activityId
    }
  });

  var promise = method([{
    field: {
      name: 'id',
      schema: {
        type: 'number',
        optional: false
      }
    }
  }, {
    field: {
      name: 'actor'
    }
  }, {
    field: {
      name: 'verb'
    }
  }, {
    field: {
      name: 'object'
    }
  }, {
    field: {
      name: 'target'
    }
  }, {
    field: {
      name: 'store'
    }
  }, {
    field: {
      name: 'created_at',
      dataKey: 'createdAt'
    }
  }, {
    field: {
      name: 'updated_at',
      dataKey: 'updatedAt'
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
      // if ( !params.internal && field.internal ) return prev;

      prev.push((field.table ? field.table + '.' + field.name : field.name) + (' as ' + (field.dataKey || field.name)));
      return prev;
    }, []);

    var where = hook.fields.reduce(function (prev, field) {
      if (!hook.data[field.dataKey || field.name]) return prev;

      prev[field.name] = hook.data[field.dataKey || field.name];
      return prev;
    }, {});

    var feedGetter = function feedGetter() {
      return identifiers ? service.feed(identifiers).get({ internal: true }) : Promise.resolve();
    };

    return feedGetter().then(function (feed) {

      var request = knex(config.schemas.activity).column(columnToSelect).where(where).limit(1);

      if (feed) {
        request.join(config.schemas.feed_activity, config.schemas.feed_activity + '.activity_id', config.schemas.activity + '.id');
      }

      return request.then(function (rows) {

        if (!rows.length) {

          throw new Error('Activity doesn\'t exists');
        }

        var activity = rows[0];

        activity.store = JSON.parse(activity.store);

        return Promise.resolve(activity);
      });
    });
  }, { defaultHook: defaultHook });

  return promisePlusCb(promise, cb);
};
//# sourceMappingURL=get.js.map