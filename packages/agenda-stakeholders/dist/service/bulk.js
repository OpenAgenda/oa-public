"use strict";

var _ = require('lodash');
var async = require('async');

var queue = require('@openagenda/queue');

var create = require('./create');
var get = require('./get');
var types = require('../iso/credentialTypes');
var update = require('./update');

var log = require('@openagenda/logs')('bulkCreate');

module.exports = _.extend(bulk, {
  task: task,
  init: init
});

var q = void 0,
    queueConfig = void 0,
    interfaces = void 0;

/**
 * this guy takes emails. Or stakeholder data
 * and decides whether to put in queue
 * or to process on the fly.
 */
function bulk(base, listData, options, cb) {

  if (arguments.length === 3) {

    options = {};
    cb = arguments[2];
  }

  if (!_.isArray(listData)) {

    return cb('input data must be a list');
  }

  if (listData.length > queueConfig.threshold) {

    _queue(base, listData, options, cb);
  } else {

    _process(base, listData, options, cb);
  }
}

/**
 * this guy processes bulky work
 * onCreate is likely used for testing only
 */
function task() {
  var onCreate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;


  q.setConsumer(function (_ref, cb) {
    var base = _ref.base,
        data = _ref.data,
        options = _ref.options;


    _processSingle(base, data, options, function (err, result) {

      if (onCreate) onCreate(err, result);

      cb(err, result);
    });
  });

  q.launch();

  return {
    shutdown: q.shutdown
  };
}

function init(config) {

  queueConfig = config.queue;

  interfaces = config.interfaces;

  q = queue(queueConfig.names.bulk, { redis: queueConfig.redis });
}

function _process(base, listData, options, cb) {

  var results = [];

  async.eachSeries(listData, function (data, ecb) {

    _processSingle(base, data, options, function (err, result) {

      results.push([err, result]);

      ecb();
    });
  }, function (err) {

    if (err) return cb(err);

    cb(null, {
      queued: false,
      results: results
    });
  });
}

function _queue(base, listData, options, cb) {

  return async.eachSeries(listData, function (data, ecb) {

    q({ base: base, data: data, options: options }, ecb);
  }, function (err) {

    if (err) return cb(err);

    cb(null, {
      queued: true
    });
  });
}

/**
 * get user in stakeholders by email or through interfaces.getUser
 */

function _getStakeholderByEmail(base, email, options, cb) {

  get(base, { email: email }, options, function (err, stakeholder) {

    if (err) return cb(err);

    if (stakeholder) return cb(null, stakeholder);

    interfaces.getUser({ email: email }, function (err, user) {

      if (err) return cb(err);

      if (!user) return cb(null);

      // get stakeholder using user id
      get(base, { userId: user.id }, cb);
    });
  });
}

/**
 * Decide whether the handle should be an update or a create. And execute.
 */
function _processSingle(base, data, options, cb) {

  if (_.isObject(data) && data.email) {

    _getStakeholderByEmail(base, data.email, options, function (err, stakeholder) {

      if (err) return cb(err);

      if (!stakeholder) return _create(base, data, options, cb);

      // if a stakeholder exists and has a different credential
      // than required, update only if cred is superior

      if (types.isSuperiorTo(stakeholder.credential, options.credential)) {

        return cb(null, {
          operation: null,
          success: false,
          errors: [{
            field: 'credential',
            code: 'credential.downgrade',
            origin: options.credential || types.get('contributor')
          }]
        });
      }

      update(base, { id: stakeholder.id }, data, options, function (err, result) {

        if (err) return cb(err);

        cb(null, _.extend(result, { operation: 'update' }));
      });
    });
  } else {

    _create(base, data, options, cb);
  }
}

function _create(base, data, options, cb) {

  create(base, data, options, function (err, result) {

    if (err) return cb(err);

    cb(null, _.extend(result, { operation: 'create' }));
  });
}
//# sourceMappingURL=bulk.js.map