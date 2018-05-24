"use strict";

var _ = require('lodash');
var w = require('when');

var evaluateCredentialFilter = require('./lib/evaluateCredentialFilter');
var types = require('../iso/credentialTypes');

var log = require('@openagenda/logs')('stats');

module.exports = _.extend(stats, { init: init });

// service globals
var schemas = void 0,
    knex = void 0,
    interfaces = void 0;

function stats(preFilter, cb) {

  w({
    query: preFilter,
    knex: knex(schemas.stakeholder),
    result: {
      total: 0,
      credentialTotals: {}
    }
  }).then(evaluateCredentialFilter.bind(null, interfaces)).then(_credentialTotals).then(_total).done(function (v) {

    cb(null, v.result);
  }, cb);
}

function _credentialTotals(v) {

  var k = v.knex.select('credential').count('id').where('review_id', v.query.agendaId).groupBy('credential');

  if (v.query.credentials) {

    k.whereIn('credential', v.query.credentials);
  }

  return k.then(function (rows) {

    rows.forEach(function (r) {

      v.result.credentialTotals[types.codes.get(r.credential)] = r['count(`id`)'];
    });

    return v;
  });
}

function _total(v) {

  v.result.total = 0;

  Object.keys(v.result.credentialTotals).forEach(function (t) {
    return v.result.total += v.result.credentialTotals[t];
  });

  return v;
}

function init(config) {

  schemas = config.schemas;

  knex = config.knex;

  interfaces = config.interfaces;
}
//# sourceMappingURL=stats.js.map