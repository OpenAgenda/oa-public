'use strict';

const log = require('@openagenda/logs')('agenda service');
const cache = require('../cache');
const config = require('../../config');
const model = require('../model');
const mw = require('./middleware');
const exportLib = require('./exportLib');
const tagsAndCategories = require('./tagsAndCategories');

function get(queryParams, options, cb) {
  if (arguments.length == 2) {
    cb = options;
    options = {};
  }

  log('getting agenda data %s', JSON.stringify(queryParams));

  let get = model.agendas().get;

  if (options.cache) {
    get = cache.func('agendas', 'get', get, config.agendaCacheExpire);
  }

  get(queryParams, function( err, result ) {
    log( 'retrieved agenda data %s', JSON.stringify( queryParams ) );

    if (err) return cb(err);

    if (!result) return cb('agenda not found');

    cb(null, module.exports.instanciate(result));
  });
}

module.exports = {
  initless: true,
  list: model.agendas().list,
  search: () => { throw new Error('legacy search is no longer available'); },
  get,
  instanciate: require('./instance')
}

module.exports.mw = mw(module.exports);

module.exports.exports = exportLib(module.exports);

module.exports.tagsAndCategories = tagsAndCategories(module.exports);
