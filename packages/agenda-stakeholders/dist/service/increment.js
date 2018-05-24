"use strict";

var _ = require('lodash');
var VError = require('verror');

var log = require('@openagenda/logs')('increment');

var knex = void 0,
    schemas = void 0;

module.exports = _.extend(increment, { init: init });

function increment(base, identifiers, cb) {

  var counterField = 'actions';

  var agendaId = base.agendaId;
  var userId = identifiers.userId,
      id = identifiers.id;


  if (!agendaId) {

    return cb(new Error('agenda id is required'));
  }

  if (!userId && !id) {

    return cb(new Error('stakeholder identifier is required'));
  }

  var where = { review_id: agendaId };

  if (userId) where.user_id = userId;

  if (id) where.id = id;

  knex(schemas.stakeholder).where(where).increment(counterField + '_counter', 1).asCallback(function (err, rows) {

    if (err) {

      var error = new VError(err, 'could not increment field %s for stakeholder %s', counterField, JSON.stringify(identifiers));

      if (cb) return cb(error);

      return log('error', error);
    }

    if (cb) return cb(null, { success: true });
  });
}

function init(config) {

  schemas = config.schemas;

  knex = config.knex;
}
//# sourceMappingURL=increment.js.map