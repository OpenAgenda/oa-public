"use strict";

const { promisify } = require('util');
const agendaTags = require('@openagenda/agenda-tags');
const appServiceAgendas = require('./agenda');

module.exports.init = async config => {

  function _query(queryStr, values, cb) {
    config.knex.raw(queryStr, values)
      .then(
        result => result[0],
        err => {
          process.nextTick(() => cb(err));
        }
     ).then(rows => {
      process.nextTick(() => cb(null, rows));
    });
  }

  await promisify(agendaTags.init)({
    store: {
      query: _query
    },
    legacy: {
      query: _query
    },
    logger: config.getLogConfig('svc', 'agenda-tags'),
    interfaces: appServiceAgendas.tagsAndCategories
  });

  return agendaTags;
}
