"use strict";

var _ = require('lodash');
var feeds = require('./feeds');
var activities = require('./activities');
var notifications = require('./notifications');

var FEED_TYPES = require('./feedTypes');

var config = void 0;
var knex = void 0;

module.exports = Object.assign(feed, { init: init });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex;


  config = c;
  knex = k;
}

function feed(identifiers) {

  if (!_.isObject(identifiers)) identifiers = { id: identifiers };

  return _.deeply(_.mapValues)(Object.assign(feeds(identifiers), {
    activities: activities(identifiers),
    notifications: notifications(identifiers)
  }), function (v) {

    if (typeof v !== 'function') return v;

    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (!config) throw new Error('service not initialized');

      if (identifiers.entityType && !FEED_TYPES.includes(identifiers.entityType)) {

        throw new Error('You cannot use feed of type ' + identifiers.entityType);
      }

      return v.apply(null, args);
    };
  });
}

_.mixin({
  deeply: function deeply(map) {
    return function (obj, fn) {
      return map(_.mapValues(obj, function (v) {
        return _.isPlainObject(v) ? _.deeply(map)(v, fn) : v;
      }), fn);
    };
  }
});

/*
obj = _.deeply(_.mapKeys)(obj, (value, key) => {
  return key;
});

obj = _.deeply(_.mapValues)(obj, (value, key, object) => {
  return value;
});
*/
//# sourceMappingURL=feed.js.map