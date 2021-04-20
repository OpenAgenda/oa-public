'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');

const log = require('@openagenda/logs')('core/agendas/events/get');

const getMergedSchema = require('../settings/getMergedSchema');
const createPayload = require('../utils/createPayload');
const getAgendaWithNetworkAndSchemas = require('../utils/getAgendaWithNetworkAndSchemas');

module.exports = async (services, agendaUid, eventUid, options = {}) => {
  log('info', 'getting', { agendaUid, eventUid });

  const {
    events,
    custom,
    agendaEvents,
  } = services;

  const {
    lang,
    load,
    access,
    returnPayload,
    detailed,
    useDateHoursMinutesFormat,
    useLocationObjectFormat
  } = {
    lang: null,
    load: {
      event: true,
      custom: true,
      agendaEvent: true,
      member: true
    },
    access: 'public',
    returnPayload: false,
    detailed: false,
    useDateHoursMinutesFormat: false,
    useLocationObjectFormat: false,
    ...options
  };

  const agenda = await getAgendaWithNetworkAndSchemas(services, agendaUid);

  const payload = createPayload(services, agenda);

  payload.setItem('agendaEvent', await agendaEvents(agendaUid).get(eventUid, {
    decorate: ['member'].concat(detailed ? ['sourceAgendas'] : [])
  }));

  if (load.event) {
    payload.setItem('event', await events.get(eventUid, {
      access: access === 'internal' ? 'internal' : 'public',
      detailed,
      lang,
      useFallbackLang: true,
      useDateHoursMinutesFormat,
      useLocationObjectFormat
    }));
  }

  if (
    payload.hasItem('event') &&
    !payload.hasItem('agendaEvent') &&
    !payload.getItem('event').draft
  ) return null;

  if (!payload.hasItem('event') && load.event) {
    return returnPayload ? payload.getResponse('event', access) : null;
  }

  if (load.custom && agenda.formSchemaId) {
    payload.setItem(
      'custom.agenda',
      await custom(agenda.formSchemaId).get(eventUid)
    );
  }

  if (load.custom && agenda.network) {
    payload.setItem(
      'custom.network',
      await custom(_.get(agenda, 'network.formSchemaId')).get(eventUid)
    );
  }

  const result = await payload.getResponse('event', { access, load });

  return returnPayload ? result : result.event;
}
