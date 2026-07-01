import logs from '@openagenda/logs';
import { NotFound } from '@openagenda/verror';
import Stopwatch from '@openagenda/utils/Stopwatch.js';
import createPayload from '../utils/createPayload.js';
import getAgenda from '../utils/getAgenda.js';
import eventLoadOptions from '../utils/eventLoadOptions.js';
import * as convertLongDescription from './lib/convertLongDescription.js';

const log = logs('core/agendas/events/get');

export default async (core, agendaUid, eventUid, options = {}) => {
  log('info', 'getting', { agendaUid, eventUid });
  const stopwatch = Stopwatch();

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
    includeLongDescriptionHTML,
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
    includeLongDescriptionHTML: false,
    includeEmbedScripts: true,
    cspNonce: null,
    private: false,
    ...options,
  };

  const load = eventLoadOptions.get(options);

  // Additive longDescriptionHTML is re-attached after the schema merge below,
  // which only keeps schema-defined fields.
  let longDescriptionHTMLValue;

  const agenda = await getAgenda(services, agendaUid, { detailed: true });
  stopwatch('agenda');

  const payload = createPayload(core, agenda);

  const agendaEvent = await agendaEvents(agendaUid).get(eventUid, {
    decorate: ['member'].concat(detailed ? ['sourceAgendas'] : []),
  });
  stopwatch('agendaEvent');

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
    returnTimes: true,
    formSchema: await payload.getFormSchema({ access }), // Pass formSchema for proper location tag filtering
  });
  stopwatch('event', event?.times);

  if (load.event) {
    if (
      convertLongDescription.shouldConvert(
        event?.longDescription,
        longDescriptionFormat,
      )
    ) {
      const converted = convertLongDescription.default(event, {
        services,
        conversion: longDescriptionFormat,
        includeEmbedScripts,
        cspNonce,
      });

      if (includeLongDescriptionHTML) {
        // Additive: keep the markdown in longDescription, expose the HTML
        // variant separately (markdown + HTML in a single call). Drafts loaded
        // here are not indexed, so the HTML is converted on the fly. Stashed and
        // re-attached after the schema merge, which drops non-schema fields.
        longDescriptionHTMLValue = converted;
      } else {
        event.longDescription = converted;
      }
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
      ? payload.getResponse('event', { access, times: stopwatch.getTimes() })
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
      ? payload.getResponse('event', { access, times: stopwatch.getTimes() })
      : null;
  }

  if (!payload.hasItem('event') && load.event) {
    return returnPayload
      ? payload.getResponse('event', { access, times: stopwatch.getTimes() })
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
  stopwatch('custom');

  const result = await payload.getResponse('event', {
    access,
    load,
    times: stopwatch.getTimes(),
  });

  if (longDescriptionHTMLValue !== undefined && result.event) {
    result.event.longDescriptionHTML = longDescriptionHTMLValue;
  }

  return returnPayload ? result : result.event;
};
