"use strict";

var queue = require('@openagenda/queue');

var config = void 0;
var knex = void 0;
var service = void 0;
var q = void 0;

module.exports = Object.assign(addActivity, { init: init });

function init(_ref) {
  var c = _ref.config,
      k = _ref.knex,
      s = _ref.service;


  config = c;
  knex = k;
  service = s;

  q = queue(config.queue.names.addActivity, { redis: config.queue.redis });
}

function addActivity(identifiers, activity, cb) {

  q({ identifiers: identifiers, activity: activity }, cb);
}
//# sourceMappingURL=addActivity.js.map