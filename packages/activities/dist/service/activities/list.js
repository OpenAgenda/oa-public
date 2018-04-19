"use strict";

var _ = require('lodash');
var parseListArguments = require('@openagenda/service-utils/parseListArguments');
var promisePlusCb = require('@openagenda/service-utils/promisePlusCb');
var schema = require('@openagenda/validators/schema');
var validators = require('@openagenda/validators');

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

  args.query = _.pick(args.query, ['actor', 'verb', 'object', 'target', 'createdAt']);

  var validateArgs = schema({
    query: {
      type: 'pass'
    },
    offset: {
      type: 'number'
    },
    limit: {
      type: 'number',
      max: 100
    },
    options: {
      type: 'pass'
    },
    cb: {
      type: 'pass'
    }
  });

  var _validateArgs = validateArgs(args),
      query = _validateArgs.query,
      fromId = _validateArgs.offset,
      limit = _validateArgs.limit,
      options = _validateArgs.options,
      cb = _validateArgs.cb;

  var params = _.merge({
    feeds: false // TODO get feeds in which the activities are
  }, options);

  var feedGetter = function feedGetter() {
    return identifiers ? service.feed(identifiers).get({ internal: true }) : Promise.resolve();
  };

  var promise = feedGetter().then(function (feed) {

    var columnToSelect = ['id', 'actor', 'verb', 'object', 'target', 'store', 'created_at', 'updated_at'].reduce(function (prev, name) {
      prev.push(config.schemas.activity + '.' + name + ' as ' + _.camelCase(name));
      return prev;
    }, []);

    var _query = query,
        createdAt = _query.createdAt;

    query = _.pick(query, 'actor', 'verb', 'object', 'target');

    var request = knex(config.schemas.activity).column(columnToSelect).where(query).orderBy('id', 'desc').limit(limit);

    if (fromId) {
      request.where('id', '<', fromId);
    }

    if (createdAt && createdAt.$lte) {
      request.where('created_at', '<=', createdAt.$lte);
    }

    if (createdAt && createdAt.$gte) {
      request.where('created_at', '>=', createdAt.$gte);
    }

    if (typeof createdAt === 'number') {
      request.where('created_at', '=', createdAt);
    }

    if (feed !== undefined) {

      request.join(config.schemas.feed_activity, config.schemas.feed_activity + '.activity_id', config.schemas.activity + '.id').where(config.schemas.feed_activity + '.feed_id', feed ? feed.id : 0);
    }

    return request.then(function (rows) {

      return rows.map(function (row) {

        row.store = JSON.parse(row.store);
        return row;
      });
    });
  });

  return promisePlusCb(promise, cb);
};
//# sourceMappingURL=list.js.map