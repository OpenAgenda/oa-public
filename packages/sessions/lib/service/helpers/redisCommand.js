"use strict";

var _concatInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/concat");

var _Promise = require("@babel/runtime-corejs3/core-js/promise");

var _ = require('lodash');

var redis = require('redis');

var log = require('@openagenda/logs')('redisCommand');

var config = require('../config');

var cli;
module.exports = _.extend(redisCommand, {
  init: init,
  shutdown: shutdown
});

function init() {
  cli = redis.createClient({
    host: config.redis.host,
    port: config.redis.port,
    retry_strategy: retry
  });
}

function shutdown() {
  if (cli === undefined) return;
  cli.quit();
}

function redisCommand(command, args) {
  return new _Promise(function (rs, rj) {
    var _context;

    if (cli === undefined) {
      return rj(new Error('Service has not been initialized'));
    }

    cli[command].apply(cli, _concatInstanceProperty(_context = _.isArray(args) ? args : [args]).call(_context, function (err, result) {
      if (err) return rj(err);
      rs(result);
    }));
  });
}

function retry(options) {
  if (options.error && options.error.code === 'ECONNREFUSED') {
    log('error', 'The server refused the connection');
    return new Error('The server refused the connection');
  }

  if (options.total_retry_time > 1000 * 60 * 60) {
    log('error', 'The retry time has been exhausted');
    return new Error('Retry time exhausted');
  }

  if (options.times_connected > 10) {
    // End reconnecting with built in error
    return undefined;
  } // reconnect after


  return Math.min(options.attempt * 100, 3000);
}
//# sourceMappingURL=redisCommand.js.map