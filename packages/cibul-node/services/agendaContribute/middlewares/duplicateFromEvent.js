"use strict";

const _ = require('lodash');
const ih = require('immutability-helper');
const { promisify } = require('util');

const log = require('@openagenda/logs')('services/agendaContribute/middlewares/duplicateFromEvent');

module.exports = async (req, res, next) => {
  const {
    core
  } = req.app.services;

  const agendaUid = _.get(req, 'query.agendaUid', req.agenda.uid);

  if (!req.query.eventUid) {

    return next();

  }

  const mergedSchemaFields = _.get(await core.agendas(agendaUid).settings.get(), 'fields', []);

  const event = await core.agendas(agendaUid).events.get(req.query.eventUid);

  if (!event) {

    return next();

  }

  // some fields are not duplicatable
  const unduplicatableFields = ['agenda', 'slug', 'uid', 'fileKey', 'state', 'timings']
    .concat(
      mergedSchemaFields
        .filter(f => !_.get(f, 'duplicatable', true))
        .map(f => f.field)
    );

  if (!await _maintainLocationReference(req.app.services, req.agenda, agendaUid, event)) {
    unduplicatableFields.push('locationUid');
  }

  // location cannot be used as is.
  req.event = ih(event, { $unset: unduplicatableFields });

  next();
}

async function _maintainLocationReference(services, agenda, sourceAgendaUid, event) {
  const {
    agendaLocations
  } = services;

  const location = await agendaLocations.get({ uid: event.locationUid });

  if (!location) return false;

  if (agenda.uid === location.agendaUid) return true;

  if (sourceAgendaUid ===agenda.uid) return true;

  return false;
}
