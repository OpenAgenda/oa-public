"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _ = require('lodash');
var async = require('async');
var VError = require('verror');
var nodefn = require('when/node');
var promisePlusCb = require('@openagenda/service-utils/promisePlusCb');
var schema = require('@openagenda/validators/schema');
var validators = require('@openagenda/validators');
var method = require('../../utils/method');

var config = void 0;
var knex = void 0;
var service = void 0;

schema.register({
  text: validators.text,
  pass: validators.pass
});

module.exports = Object.assign(add, { init: init });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex,
      s = _ref.service;


  config = c;
  knex = k;
  service = s;
}

function parseArguments(identifiers, data, feedsIdentifiers, cb) {

  var result = {
    identifiers: identifiers,
    data: data,
    feedsIdentifiers: feedsIdentifiers,
    cb: cb
  };

  var args = Array.isArray(arguments) ? arguments : Array.from(arguments);

  if (typeof args[args.length - 1] !== 'function') {
    args.push(null);
  }

  if (args.length === 3) {

    Object.assign(result, {
      identifiers: args[0],
      data: args[1],
      feedsIdentifiers: null,
      cb: args[2]
    });
  }

  return result;
}

function add() {
  var _parseArguments$apply = parseArguments.apply(null, arguments),
      identifiers = _parseArguments$apply.identifiers,
      data = _parseArguments$apply.data,
      feedsIdentifiers = _parseArguments$apply.feedsIdentifiers,
      cb = _parseArguments$apply.cb;

  var defaultHook = _.merge({}, {
    data: data
  });

  var promise = method([{
    field: {
      name: 'actor',
      schema: {
        type: 'text',
        max: 255,
        optional: false
      }
    }
  }, {
    field: {
      name: 'verb',
      schema: {
        type: 'text',
        max: 255,
        optional: false
      }
    }
  }, {
    field: {
      name: 'object',
      schema: {
        type: 'text',
        max: 255,
        optional: true
      }
    }
  }, {
    field: {
      name: 'target',
      schema: {
        type: 'text',
        max: 255,
        optional: true
      }
    }
  }, {
    field: {
      name: 'store',
      schema: {
        type: 'pass',
        optional: true
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

    hook.data.store = JSON.stringify(hook.data.store || {});

    var fields = hook.fields.reduce(function (prev, field) {
      if (!hook.data[field.dataKey || field.name]) return prev;

      prev[field.name] = hook.data[field.dataKey || field.name];
      return prev;
    }, {});

    var feedsToGet = (identifiers ? [identifiers] : []).concat(feedsIdentifiers || []);

    return nodefn.call(async.mapSeries, feedsToGet, function (item, mcb) {
      return service.feed(item).get({
        internal: true,
        followedBy: true
      }, mcb);
    }).then(function (feeds) {

      if (!feeds.length) {
        throw new Error('You should choose at least one feed for add activity');
      }

      if (feeds.filter(function (v) {
        return !v;
      }).length) {
        throw new VError('One or more feeds doesn\'t exist in feeds %j', feedsToGet);
      }

      return knex(config.schemas.activity).insert(fields).then(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 1),
            activityId = _ref3[0];

        return service.activities.get(activityId);
      }).then(function (activity) {
        var _feeds$map;

        var feedContainsActivity = [];
        var followers = (_feeds$map = feeds.map(function (v) {
          return { targetFeed: v.id };
        })).concat.apply(_feeds$map, _toConsumableArray(feeds.map(function (v) {
          return v.followedBy;
        })));

        return nodefn.call(async.whilst, function () {
          return followers.length;
        }, function (wcb) {

          async.eachSeries(followers, function (follower, ecb) {

            if (~feedContainsActivity.findIndex(function (v) {
              return v.targetFeed === follower.targetFeed;
            })) {
              followers = followers.filter(function (v) {
                return v.targetFeed !== follower.targetFeed;
              });
              return ecb();
            }

            var filterFollows = [];

            if (follower.id && config.filterFollows) {
              filterFollows = config.filterFollows.filter(function (v) {
                return ~[].concat(v.verb).indexOf(activity.verb);
              });
            }

            (filterFollows.some(function (v) {
              return v.getFeeds;
            }) ? Promise.all([service.feed(follower.originFeed).get({ internal: true }), service.feed(follower.targetFeed).get({ internal: true })]) : Promise.resolve([follower.originFeed, follower.targetFeed])).then(function (_ref4) {
              var _ref5 = _slicedToArray(_ref4, 2),
                  originFeed = _ref5[0],
                  targetFeed = _ref5[1];

              async.everySeries(filterFollows, function (item, cb) {
                return item.filter(activity, item.getFeeds ? originFeed : follower.originFeed, item.getFeeds ? targetFeed : follower.targetFeed, follower, cb);
              }, function (err, acceptedFilter) {

                if (err || !acceptedFilter) {
                  followers = followers.filter(function (v) {
                    return v.targetFeed !== follower.targetFeed;
                  });
                  return ecb(err);
                }

                knex(config.schemas.feed_activity).insert({
                  feed_id: follower.targetFeed,
                  activity_id: activity.id
                }).asCallback(function (err) {

                  if (err) return ecb(err);

                  feedContainsActivity.push(follower);

                  service.feed(follower.targetFeed).notifications.addActivity(activity, function () {
                    return ecb();
                  });
                });
              });
            });
          }, function (err) {

            if (err) return wcb(err);

            async.concatSeries(followers, function (item, ccb) {

              service.feed(item.targetFeed).get({
                internal: true,
                followedBy: true
              }).then(function (feed) {
                return ccb(null, feed.followedBy);
              }).catch(ccb);
            }, function (err, results) {

              if (err) return wcb(err);

              followers = results;

              wcb();
            });
          });
        }).then(function () {
          return activity;
        });
      });
    });
  }, { defaultHook: defaultHook });

  return promisePlusCb(promise, cb);
};
//# sourceMappingURL=add.js.map