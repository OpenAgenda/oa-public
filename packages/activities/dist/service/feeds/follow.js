"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var log = require('@openagenda/logs')('activities/feeds/follow');
var promisePlusCb = require('@openagenda/service-utils/promisePlusCb');

var config = void 0;
var knex = void 0;
var service = void 0;

module.exports = Object.assign(follow, { init: init });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex,
      s = _ref.service;


  config = c;
  knex = k;
  service = s;
}

function parseArguments(identifiers, originFeedId, store, cb) {

  var result = {
    identifiers: identifiers,
    originFeedId: originFeedId,
    store: store,
    cb: cb
  };

  var args = Array.isArray(arguments) ? arguments : Array.from(arguments);

  if (typeof args[args.length - 1] !== 'function') {
    args.push(null);
  }

  if (args.length === 3) {

    Object.assign(result, {
      identifiers: args[0],
      originFeedId: args[1],
      store: {},
      cb: args[2]
    });
  }

  return result;
}

function follow() {
  var _parseArguments$apply = parseArguments.apply(null, arguments),
      identifiers = _parseArguments$apply.identifiers,
      originFeedId = _parseArguments$apply.originFeedId,
      store = _parseArguments$apply.store,
      cb = _parseArguments$apply.cb;

  var promise = service.feed(identifiers).get({ internal: true }).then(function (targetFeed) {

    return service.feed(originFeedId).get({ internal: true }).then(function (originFeed) {
      return { targetFeed: targetFeed, originFeed: originFeed };
    });
  }).then(function (_ref2) {
    var targetFeed = _ref2.targetFeed,
        originFeed = _ref2.originFeed;


    if (targetFeed === null || originFeed === null) return 0;

    return knex(config.schemas.feed_follow).select().where({ target_feed: targetFeed.id, origin_feed: originFeed.id }).limit(1).then(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 1),
          feed_follow = _ref4[0];

      if (feed_follow) throw new Error('Feed already followed');

      return { targetFeed: targetFeed, originFeed: originFeed };
    });
  }).then(function (_ref5) {
    var targetFeed = _ref5.targetFeed,
        originFeed = _ref5.originFeed;


    if (!targetFeed || !originFeed) return 0;

    return knex(config.schemas.feed_follow).insert({ target_feed: targetFeed.id, origin_feed: originFeed.id, store: JSON.stringify(store || {}) }).then(function (_ref6) {
      var _ref7 = _slicedToArray(_ref6, 1),
          feedFollowId = _ref7[0];

      return feedFollowId;
    }).then(function (result) {

      log('Feed n° %d follow feed n° %d', targetFeed.id, originFeed.id);

      return result;
    });
  });

  return promisePlusCb(promise, cb);
}
//# sourceMappingURL=follow.js.map