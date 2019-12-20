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
  log('info', 'getting', { agendaUid, eventUid });

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
    returnPayload,
    detailed
  } = {
    internal: false, // load internal use fields ( id )
    lang: null,
    customOnly: false, // only fetch custom values
    access: 'public',
    returnPayload: false,
    detailed: false,
    ...options
  };

  const agenda = await getAgendaWithNetworkAndSchemas(services, agendaUid);

  const payload = createPayload(services, agenda);

  payload.setItem('agendaEvent', await agendaEvents(agendaUid).get(eventUid));

  if (!customOnly) {
    const event = await events.get({
      uid: eventUid
    }, {
      internal: internal || access === 'internal',
      detailed
    });

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

  if (!payload.hasItem('event') && !customOnly) {
    return returnPayload ? payload.getResponse('event', access) : null;
  }

  const loadCustomFields = payload.hasItem('event') || customOnly;

  if (loadCustomFields && agenda.formSchemaId) {
    payload.setItem(
      'custom.agenda',
      await custom(agenda.formSchemaId).get(eventUid)
    );
  }

  if (loadCustomFields && agenda.network) {
    payload.setItem(
      'custom.network',
      await custom(_.get(agenda, 'network.formSchemaId')).get(eventUid)
    );
  }

  const result = await payload.getResponse('event', { access, customOnly });
  return returnPayload ? result : result.event;
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
