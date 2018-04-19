"use strict";

var log = require('@openagenda/logs')('activities/feeds/unfollow');
var promisePlusCb = require('@openagenda/service-utils/promisePlusCb');

var config = void 0;
var knex = void 0;
var service = void 0;

module.exports = Object.assign(unfollow, { init: init });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex,
      s = _ref.service;


  config = c;
  knex = k;
  service = s;
}

function unfollow(identifiers, followedFeedIdentifiers, cb) {

  var promise = service.feed(identifiers).get({ internal: true }).then(function (feed) {

    if (feed === null) {

      return 0;
    }

    return service.feed(followedFeedIdentifiers).get({ internal: true }).then(function (followedFeed) {

      if (followedFeed === null) {

        return 0;
      }

      return knex(config.schemas.feed_follow).delete().where({
        origin_feed: followedFeed.id,
        target_feed: feed.id
      }).then(function (result) {

        log('Feed n° %s unfollow feed n° %s', feed.id, followedFeed.id);

        return result;
      });
    });
  });

  return promisePlusCb(promise, cb);
}
//# sourceMappingURL=unfollow.js.map