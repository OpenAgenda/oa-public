'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');

const log = require('@openagenda/logs')('services/agendaContribute/duplicateFromEvent');

module.exports = async (req, res, next) => {
  const {
    core,
    members
  } = req.app.services;

  const agendaUid = _.get(req, 'query.agendaUid', req.agenda.uid);

  if (!req.query.eventUid) {
    return next();
  }

  const mergedSchemaFields = _.get(await core.agendas(agendaUid).settings.get({
    userUid: req.user.uid
  }), 'fields', []);

  const event = await core.agendas(agendaUid).events.get(req.query.eventUid, {
    access: await members.get({
      agendaUid,
      userUid: req.user.uid
    }).then(m => (m ? members.utils.getRoleSlug(m.role) : 'public'))
  });

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

  const location = await core.agendas(req.agenda.uid).locations.get(event.locationUid, { includeFields: ['uid'] });

  if (!location) {
    unduplicatableFields.push('locationUid');
  } else {
    event.location = location;
  }

  log('removing %j from duplicate edition', unduplicatableFields);

  // location cannot be used as is.
  req.event = ih(event, { $unset: unduplicatableFields });

  log('loaded %j for duplication', req.event);

  next();
};
