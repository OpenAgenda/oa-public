"use strict";

var _ = require('lodash');
var w = require('when');
var format = require('./format');
var validators = require('../iso/validators');

var log = require('@openagenda/logs')('get');

// service globals
var schemas = void 0,
    knex = void 0,
    interfaces = void 0;

module.exports = _.extend(get, { init: init });

function get(preFilter, identifiers, options, cb) {

  if (arguments.length === 3) {

    cb = options;
    options = {};
  }

  w({
    identifiers: validators.clean('getQuery', _.extend({}, identifiers, preFilter)),
    options: validators.clean('getOptions', options),
    stakeholder: null
  }).then(_get).then(_getEventCount).then(_getUserInfo).done(function (v) {

    cb(null, v.stakeholder);
  }, cb);
}

function init(config) {

  schemas = config.schemas;

  knex = config.knex;

  interfaces = config.interfaces;
}

function _get(v) {

  var whereObj = format.objToDb(v.identifiers, true);

  var k = knex(schemas.stakeholder).select('*').where(whereObj);

  if (v.identifiers.email) {

    k.andWhere('store', 'like', '%"' + v.identifiers.email + '"%');
  }

  return k.limit(1).offset(0).then(function (rows) {

    v.stakeholder = rows.length ? format.dbToObj(rows[0]) : null;

    return v;
  });
}

function _getEventCount(v) {

  if (!v.options.detailed || !interfaces || !v.identifiers.agendaId || !v.stakeholder) {

    return v;
  }

  var d = w.defer();

  interfaces.getEventCount(v.identifiers.agendaId, v.stakeholder.userId, function (err, count) {

    if (err) return d.reject(err);

    v.stakeholder.eventCount = count;

    d.resolve(v);
  });

  return d.promise;
}

function _getUserInfo(v) {

  if (!v.options.detailed || !interfaces || !v.stakeholder) {

    return v;
  }

  var d = w.defer();

  interfaces.getUser({ id: v.stakeholder.userId }, function (err, user) {

    if (err) return d.reject(err);

    v.stakeholder.user = user;

    d.resolve(v);
  });

  return d.promise;
}
//# sourceMappingURL=get.js.map