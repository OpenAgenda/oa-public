import logs from '@openagenda/logs';
import { NotFound } from '@openagenda/verror';
import createPayload from '../utils/createPayload.js';
import getAgenda from '../utils/getAgenda.js';
import eventLoadOptions from '../utils/eventLoadOptions.js';
import Stopwatch from '../utils/Stopwatch.js';
import * as convertLongDescription from './lib/convertLongDescription.js';

const log = logs('core/agendas/events/get');

export default async (core, agendaUid, eventUid, options = {}) => {
  log('info', 'getting', { agendaUid, eventUid });
  const stopwatch = Stopwatch();
  const times = {};

  const { services } = core;

  const { events, custom, agendaEvents } = services;

  const {
    lang,
    access,
    returnPayload,
    detailed,
    useDateHoursMinutesFormat,
    useLocationObjectFormat,
    longDescriptionFormat,
    includeEmbedScripts,
    cspNonce,
    private: loadPrivate,
    throwOnNotFound,
  } = {
    lang: null,
    access: 'public',
    returnPayload: false,
    detailed: false,
    useDateHoursMinutesFormat: false,
    useLocationObjectFormat: false,
    longDescriptionFormat: null,
    includeEmbedScripts: true,
    cspNonce: null,
    private: false,
    ...options,
  };

  const load = eventLoadOptions.get(options);

  const agenda = await getAgenda(services, agendaUid, { detailed: true });
  times.agenda = stopwatch();

  const payload = createPayload(core, agenda);

  const agendaEvent = await agendaEvents(agendaUid).get(eventUid, {
    decorate: ['member'].concat(detailed ? ['sourceAgendas'] : []),
  });
  times.agendaEvent = stopwatch();

  payload.setItem('agendaEvent', agendaEvent);

  if (agendaEvent) {
    log('agendaEvent ref fetched');
  }

  const event = await events.get(eventUid, {
    access: access === 'internal' ? 'internal' : 'public',
    detailed,
    lang,
    useFallbackLang: true,
    useDateHoursMinutesFormat,
    useLocationObjectFormat,
    private: loadPrivate,
    throwOnNotFound,
    formSchema: await payload.getFormSchema({ access }), // Pass formSchema for proper location tag filtering
  });
  times.event = stopwatch();

  if (load.event) {
    if (
      convertLongDescription.shouldConvert(
        event?.longDescription,
        longDescriptionFormat,
      )
    ) {
      event.longDescription = convertLongDescription.default(event, {
        services,
        conversion: longDescriptionFormat,
        includeEmbedScripts,
        cspNonce,
      });
    }

    log('event fetched');
    payload.setItem('event', event);
  }
  if (
    payload.hasItem('event')
    && !payload.hasItem('agendaEvent')
    && !payload.getItem('event').draft
  ) {
    if (throwOnNotFound) {
      throw NotFound('event is not referenced on agenda');
    }
    payload.setItem('event', null);
    return returnPayload
      ? payload.getResponse('event', { access, times })
      : null;
  }

  if (
    payload.hasItem('event')
    && payload.getItem('event').draft
    && payload.getItem('event.agendaUid') !== agenda.uid
  ) {
    log('event is draft and update attempt is not from origin agenda');
    payload.setItem('event', null);
    return returnPayload
      ? payload.getResponse('event', { access, times })
      : null;
  }

  if (!payload.hasItem('event') && load.event) {
    return returnPayload
      ? payload.getResponse('event', { access, times })
      : null;
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
      await custom(agenda.network.formSchemaId).get(eventUid),
    );
  }
  times.custom = stopwatch();

  const result = await payload.getResponse('event', { access, load, times });

  return returnPayload ? result : result.event;
};
