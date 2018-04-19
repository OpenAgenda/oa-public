"use strict";

var VError = require('verror');
var promisePlusCb = require('@openagenda/service-utils/promisePlusCb');

var config = void 0;
var knex = void 0;
var service = void 0;

module.exports = Object.assign(remove, { init: init });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex,
      s = _ref.service;


  config = c;
  knex = k;
  service = s;
}

function remove(identifiers, query, cb) {

  if (identifiers.entityType && identifiers.entityType !== 'user') {

    return promisePlusCb(Promise.reject(new VError('The notifications concern only feeds users')), cb);
  }

  var promise = service.feed(identifiers).get({ internal: true }).then(function (feed) {

    if (feed === null) {
      return Promise.reject(new VError('Feed not found'));
    }

    if (feed.entityType !== 'user') {
      return Promise.reject(new VError('The notifications concern only user feeds'));
    }

    return service.feed(feed).notifications.list(query).then(function (notifs) {

      return knex(config.schemas.feed_notification).where('feed_id', feed.id).whereIn('id', notifs.map(function (v) {
        return v.id;
      })).delete();
    });
  });

  return promisePlusCb(promise, cb);
};
//# sourceMappingURL=remove.js.map