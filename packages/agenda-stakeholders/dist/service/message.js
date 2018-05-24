"use strict";

var _ = require('lodash');
var async = require('async');

var queue = require('@openagenda/queue');

var contextValidator = require('../iso/contextValidator');
var get = require('./get');
var list = require('./list');

var log = require('@openagenda/logs')('message');

module.exports = _.extend(queueMessage, {
  task: task,
  init: init
});

var q = void 0,
    queueConfig = void 0,
    interfaces = void 0;

/**
 * queue message content and recipients query
 */
function queueMessage(base, query, message, context, cb) {

  log('queuing message %s', message);

  var cleanContext = void 0;

  try {

    cleanContext = contextValidator(context);
  } catch (errs) {

    return cb(errs);
  }

  q({
    type: 'list',
    base: base,
    query: query,
    message: message,
    context: cleanContext
  }, function (err) {

    log('queued message %s', message);

    if (err) return cb(err);

    cb(null, {
      queued: true
    });
  });
}

/**
 * retrieve stakeholders targeted by query
 * and for each stakeholder queue message
 * process job.
 */
function listAndQueueStakeholders(_ref, cb) {
  var query = _ref.query,
      message = _ref.message,
      base = _ref.base,
      context = _ref.context;


  var limit = 20; // why not.

  var hasMore = true,
      offset = 0;

  async.whilst(function () {
    return hasMore;
  }, function (wcb) {

    list(base, query, offset, limit, function (err, stakeholders) {

      if (err) return wcb(err);

      if (!stakeholders.length) {

        hasMore = false;

        return wcb();
      }

      offset += limit;

      async.eachSeries(stakeholders, function (stakeholder, ecb) {

        q({ type: 'item', stakeholder: stakeholder, message: message, context: context }, ecb);
      }, wcb);
    });
  }, cb);
}

function processSingleMessage(_ref2, cb) {
  var stakeholder = _ref2.stakeholder,
      message = _ref2.message,
      context = _ref2.context;


  interfaces.onMessage(stakeholder, message, context, cb);
}

function task() {

  q.setConsumer(function (data, cb) {

    (data.type === 'list' ? listAndQueueStakeholders : processSingleMessage)(data, cb);
  });

  q.launch();

  return {
    shutdown: q.shutdown
  };
}

function init(config) {

  queueConfig = config.queue;

  interfaces = config.interfaces;

  q = queue(queueConfig.names.message, { redis: queueConfig.redis });
}
//# sourceMappingURL=message.js.map