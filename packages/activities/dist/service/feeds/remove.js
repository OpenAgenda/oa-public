"use strict";

var promisePlusCb = require('@openagenda/service-utils/promisePlusCb');
var log = require('@openagenda/logs')('activities/feeds/remove');

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

function remove(identifiers, cb) {

  var promise = service.feed(identifiers).get({ internal: true }).then(function (feed) {

    if (!feed) {

      return 0;
    }

    return knex(config.schemas.feed).delete().where({ id: feed.id }).then(function (result) {

      log('Feed removed (type %s, uid: %s)', feed.entityType, feed.entityUid);

      return result;
    });
  });

  return promisePlusCb(promise, cb);
}
//# sourceMappingURL=remove.js.map