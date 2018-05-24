"use strict";

var _ = require('lodash');
var w = require('when');
var get = require('./get');

var logger = require('@openagenda/logs')('remove');

// service globals
var interfaces = void 0,
    schemas = void 0,
    knex = void 0;

module.exports = _.extend(remove, { init: init });

function remove(preFilter, identifiers, cb) {

  w({
    preFilter: preFilter,
    identifiers: identifiers,
    stakeholder: null,
    result: {
      success: false
    }
  }).then(_get).then(_remove).done(function (v) {

    if (interfaces && interfaces.onRemove && v.result.success) {

      interfaces.onRemove(v.stakeholder);
    }

    cb(null, v.result);
  }, cb);
}

function _get(v) {

  var d = w.defer();

  get(v.preFilter, v.identifiers, function (err, stakeholder) {

    if (err) return d.reject(err);

    v.stakeholder = stakeholder;

    d.resolve(v);
  });

  return d.promise;
}

function _remove(v) {

  if (!v.stakeholder) return v;

  return knex(schemas.stakeholder).where('id', v.stakeholder.id).del().then(function (deleted) {

    if (deleted === 1) {

      v.result.success = true;
    } else {

      v.result.deletedCount = deleted;
    }

    return v;
  });
}

function init(config) {

  schemas = config.schemas;

  knex = config.knex;

  interfaces = config.interfaces;
}
//# sourceMappingURL=remove.js.map