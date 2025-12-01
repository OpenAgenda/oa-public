import { BadRequest } from '@openagenda/verror';
import logs from '@openagenda/logs';
import processOEmbed from '../../utils/processOEmbed.js';
import formatEventErrors from '../../utils/formatEventErrors.js';

const log = logs('core/agendas/events/lib/updateEvent');

export default async function updateEvent(
  services,
  {
    clean,
    payload,
    draft,
    agendaUid,
    userUid,
    eventUid,
    privateOption,
    event,
    isPatch,
    userLang,
    mergeExtIds,
  },
) {
  const { oembed, events } = services;

  if (clean.event.longDescription) {
    try {
      clean.event.links = await processOEmbed(
        oembed,
        clean.event.longDescription,
        {
          current: clean.event.links,
        },
      );
      log('retrieved %s links', clean.event.links.length);
    } catch (e) {
      log('error', 'could not retrieve oembeds', e);
    }
  }

  try {
    payload.setItem(
      'event',
      event,
      await events[isPatch ? 'patch' : 'update'](eventUid, clean.event, {
        context: {
          agendaUid,
          userUid,
          updateSearchIndex: false,
        },
        detailed: true,
        access: 'internal',
        draft,
        private: privateOption,
        mergeExtIds,
      }),
    );

    log('updated event %s', event.uid);
  } catch (e) {
    const error = e.toString() === 'ValidationError: Invalid data'
      ? new BadRequest(
        {
          info: { errors: formatEventErrors(e.detail, userLang) },
        },
        'invalid data',
      )
      : e;

    log('error', 'failed to update event', {
      agendaUid,
      eventUid,
      error,
    });
    throw error;
  }
}
