import ih from 'immutability-helper';
import logs from '@openagenda/logs';
import { BadRequest, Forbidden } from '@openagenda/verror';
import createPayload from '../utils/createPayload.js';
import cleanDuplicateImage, { isImageToDuplicate } from '../utils/cleanDuplicateImage.js';
import doAdd from '../utils/doAdd.js';
import extractUserUid from '../utils/extractUserUid.js';
import loadAuthorizations from '../../utils/authorizations.js';
import processOEmbed from '../utils/processOEmbed.js';
import cleanEvent from '../utils/cleanEvent/index.js';
import getAgenda from '../utils/getAgenda.js';
import assignState from '../utils/assignState.js';

const log = logs('core/agendas/events/create');

export default async (core, agendaUid, data, options = {}) => {
  const { services } = core;

  const { members, events, registrations } = services;

  const {
    access = 'public',
    draft = false,
    defaultLang = 'en',
    filterUnauthorizedData = false,
    returnPayload = false,
    fileKey,
    duplicateOrigin,
    callOrigin = 'ui',
  } = options;

  const userUid = extractUserUid(data, options);

  log.info('attempting create', {
    agendaUid,
    callOrigin,
    userUid,
  });

  let response;

  try {
    const member = userUid ? await members.get({ agendaUid, userUid }) : null;

    const agenda = await getAgenda(core.services, agendaUid, {
      detailed: true,
      includeMemberSchema: true,
    });
    log('  loaded agenda %s', agenda.slug);

    const clean = await cleanEvent(services, agenda, data, {
      draft,
      defaultLang,
      filterUnauthorizedData,
      member,
      access,
    });

    log('  cleaned data');

    if (!draft && clean.passCulture) {
      log('  There is a pass culture payload');
      try {
        clean.event.registration = await registrations.utils.passCulture.processApply(agenda, clean);
      } catch (e) {
        log('error', e);
        throw e;
      }
    }

    const authorizations = await loadAuthorizations(core, 'create', {
      agenda,
      member,
      access,
    });

    if (!authorizations.canCreateEvent) {
      throw new Forbidden('not authorized to create event');
    }

    assignState(agenda, null, clean, data, {
      authorizations,
      draft,
    });
    log('  associated state');

    const payload = createPayload(core, agenda);

    try {
      clean.event.links = await processOEmbed(services.oembed, clean.event.longDescription, {
        current: clean.event.links,
      });
      log('  retrieved %s links', clean.event.links.length);
    } catch (e) {
      log('error', '  could not retrieve oembeds', e);
    }

    log('  pre-validation done', { agendaUid });

    try {
      if (duplicateOrigin && isImageToDuplicate(clean.event.image)) {
        clean.event.image = cleanDuplicateImage(core, clean.event.image);
      }

      const event = await events.create(clean.event, {
        context: {
          userUid,
          agendaUid,
        },
        detailed: true,
        access: 'internal',
        private: !!agenda.private,
        draft,
        fileKey,
      });

      payload.setItem('event', event);

      log('created event', event.uid);
    } catch (e) {
      if (e.toString() === 'ValidationError: Invalid data') {
        log('info', 'invalid data', e);
        throw new BadRequest(
          {
            info: { errors: e.detail },
          },
          'invalid data',
        );
      }
      log('error', 'failed to create event', {
        agendaUid: agenda.uid,
        event: clean.event,
      });
      throw e;
    }

    response = await doAdd(
      core,
      payload,
      ih(clean, {
        agendaEvent: {
          canEdit: { $set: true },
        },
        // required for custom legacy sync only.
        agendaId: { $set: agenda.id },
      }),
      {
        draft,
        userUid,
        access,
        duplicateOrigin,
      },
    );
  } catch (e) {
    log.info('create failed', {
      error: e,
      errors: e.info?.errors,
      agendaUid,
      userUid,
      callOrigin,
    });
    throw e;
  }

  if (
    !draft
    && registrations?.utils.passCulture.isMarkedAsPending(
      response.event.registration.find(r => r.service === 'passCulture')?.data,
    )
  ) {
    registrations.utils.passCulture.enqueuePending({
      agendaUid,
      eventUid: response.event.uid,
    });
  }

  log.info('create successful', {
    agendaUid,
    userUid,
    eventUid: response.event.uid,
    callOrigin,
  });

  return returnPayload ? response : response.event;
};
