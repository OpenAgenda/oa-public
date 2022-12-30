'use strict';

const _ = require('lodash');

const log = require('@openagenda/logs')('core/agendas/events/get');

const createPayload = require('../utils/createPayload');
const getAgendaWithNetworkAndSchemas = require('../utils/getAgendaWithNetworkAndSchemas');
const convertLongDescription = require('./lib/convertLongDescription');

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
    useLocationObjectFormat,
    longDescriptionFormat,
    private: loadPrivate,
  } = {
    lang: null,
    load: {
      event: true,
      custom: true,
      agendaEvent: true,
      member: true,
    },
    access: 'public',
    returnPayload: false,
    detailed: false,
    useDateHoursMinutesFormat: false,
    useLocationObjectFormat: false,
    longDescriptionFormat: null,
    private: false,
    ...options,
  };

  const agenda = await getAgendaWithNetworkAndSchemas(services, agendaUid);

  const payload = createPayload(services, agenda);

  const agendaEvent = await agendaEvents(agendaUid).get(eventUid, {
    decorate: ['member'].concat(detailed ? ['sourceAgendas'] : []),
  });

  payload.setItem('agendaEvent', agendaEvent);

  if (load.event) {
    const event = await events.get(eventUid, {
      access: access === 'internal' ? 'internal' : 'public',
      detailed,
      lang,
      useFallbackLang: true,
      useDateHoursMinutesFormat,
      useLocationObjectFormat,
      private: loadPrivate,
    });

    if (convertLongDescription.shouldConvert(event?.longDescription, longDescriptionFormat)) {
      event.longDescription = convertLongDescription(event, { services, conversion: longDescriptionFormat });
    }
    log('event fetched');
    payload.setItem('event', event);
  }

  if (
    payload.hasItem('event')
    && !payload.hasItem('agendaEvent')
    && !payload.getItem('event').draft
  ) return null;

  if (
    payload.hasItem('event')
    && payload.getItem('event').draft
    && payload.getItem('event.agendaUid') !== agenda.uid
  ) return null;

  if (!payload.hasItem('event') && load.event) {
    return returnPayload ? payload.getResponse('event', access) : null;
  }

  if (load.custom && agenda.formSchemaId) {
    payload.setItem(
      'custom.agenda',
      await custom(agenda.formSchemaId).get(eventUid),
    );
  }

  if (load.custom && agenda.network) {
    payload.setItem(
      'custom.network',
      await custom(_.get(agenda, 'network.formSchemaId')).get(eventUid),
    );
  }

  const result = await payload.getResponse('event', { access, load });

  return returnPayload ? result : result.event;
};
