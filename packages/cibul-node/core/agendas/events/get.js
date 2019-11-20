'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');

const log = require('@openagenda/logs')('core/agendas/events/get');

const getAgenda = require('../utils/getAgenda');
const getMergedSchema = require('../settings/getMergedSchema');
const getNetwork = require('../utils/getNetwork');
const createPayload = require('../utils/createPayload');
const getAgendaWithNetworkAndSchemas = require('../utils/getAgendaWithNetworkAndSchemas');

module.exports = async (services, agendaUid, eventUid, options = {}) => {
  const {
    events,
    custom,
    agendaEvents,
    formSchemas
  } = services;

  const {
    internal,
    lang,
    customOnly,
    access,
    includeSchema,
    detailed
  } = {
    internal: false, // load internal use fields ( id )
    lang: null,
    customOnly: false, // only fetch custom values
    access: null, // filter to values matching specific access rights
    includeSchema: false,
    detailed: false,
    ...options
  };

  const agenda = await getAgendaWithNetworkAndSchemas(services, agendaUid);

  const payload = createPayload(services, agenda, 'get');

  payload.setItem('agendaEvent', await agendaEvents(agendaUid).get(eventUid));

  const {
    id: agendaId
  } = agenda;

  if (!customOnly) {
    const { event } = await events.get({
      uid: eventUid
    }, {
      internal, detailed
    }).then(e => _.omit(e, ['id']));

    payload.setItem(
      'event',
      lang ? _flatten(event) : event
    );
  }

  if (
    payload.hasItem('event') &&
    !payload.hasItem('agendaEvent') &&
    !payload.getItem('event').draft
  ) return null;

  const loadCustomFields = payload.hasItem('event') || customOnly;

  if (loadCustomFields && agenda.formSchemaId) {
    payload.setItem(
      'custom.agenda',
      await custom(formSchemaId).get(eventUid)
    );
  }

  if (loadCustomFields && agenda.network) {
    payload.setItem(
      'custom.network',
      await custom(_.get(agenda, 'network.formSchemaId')).get(eventUid)
    );
  }

  if (includeSchema || access) {
    result.schema = await getMergedSchema(agenda, { preloadedNetwork: network });
  }

  _filterByAccess(result, access);

  return includeSchema ? result : result.event;
}


function _filterByAccess(data, access = null) {
  const { event, schema } = data;

  if (!access) return;

  const unsets = _.get(schema, 'fields', []).filter(
    f => f.read && ![].concat(f.read).includes(access)
  ).map(f => f.field);

  if (!unsets.length) return;

  data.event = ih(event, { $unset: unsets });

  // filter out fields from schema
  data.schema.fields = data.schema.fields.filter(f => !unsets.includes(f.field));
}


function _eventIsLoaded(payload) {
  return !!payload.getItem('event');
}


function _flatten( event, lang ) {
  return ih( event, [
    'title',
    'description',
    'keywords',
    'longDescription',
    'conditions'
  ].reduce( ( flattened, field ) => _.set( flattened, field, {
    $set: _.get( event, [ field, lang ] , _.get( event, [ field, _.first( _.keys( event[ field ] ) ) ] ) )
  } ), {} ) );
}
