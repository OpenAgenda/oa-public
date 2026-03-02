import _ from 'lodash';
import ih from 'immutability-helper';
import logs from '@openagenda/logs';
import { BadRequest, Forbidden } from '@openagenda/verror';
import createPayload from '../utils/createPayload.js';
import cleanDuplicateImage, {
  isImageToDuplicate,
} from '../utils/cleanDuplicateImage.js';
import doAdd from '../utils/doAdd.js';
import extractUserUid from '../utils/extractUserUid.js';
import loadAuthorizations from '../../utils/authorizations.js';
import processOEmbed from '../utils/processOEmbed.js';
import cleanEvent from '../utils/cleanEvent/index.js';
import getAgenda from '../utils/getAgenda.js';
import assignState from '../utils/assignState.js';
import formatEventErrors from '../utils/formatEventErrors.js';

const log = logs('core/agendas/events/create');

export default async (core, agendaUid, data, options = {}) => {
  const { services } = core;

  const { members, events, registrations, agendaLocations } = services;

  const {
    access = 'public',
    defaultLang = 'en',
    returnPayload = false,
    fileKey,
    duplicateOrigin,
    callOrigin = 'ui',
    userLang = 'en',
  } = options;

  const isDraft = data.draft || false;
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
      validateAsDraft: isDraft,
      defaultLang,
      member,
      access,
    });

    log('  cleaned data');

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
    });
    log('  associated state');

    if (!isDraft && clean.passCulture) {
      log('  There is a pass culture payload');
      if (clean.agendaEvent.state === 2) {
        try {
          clean.event.registration = await registrations.utils.passCulture.processApply(
            agenda,
            clean,
            member,
            userUid,
          );
        } catch (e) {
          log('error', e);
          throw e;
        }
      } else {
        // validate pass data
        const passCultureService = registrations(
          agenda.settings.registration,
        ).passCulture;
        log('validate pass data');
        try {
          // get complete location
          const location = await agendaLocations.get(clean.event.location.uid, {
            detailed: true,
          });
          await passCultureService.validate(
            { ...clean.event, location },
            clean.passCulture,
          );

          // Even for unpublished events during creation, we need to set the owner key
          // to reflect the acting member who submitted the passCulture data
          clean.event.registration = clean.event.registration.map((regItem) => {
            if (regItem.service === 'passCulture') {
              return {
                ...regItem,
                // Set owner for new passCulture registration
                owner: registrations.utils.passCulture.determineOwner(
                  member,
                  agendaUid,
                  userUid,
                ),
              };
            }
            return regItem;
          });
        } catch (error) {
          log('error', error);
          throw error;
        }
      }
    }

    const payload = createPayload(core, agenda);

    try {
      clean.event.links = await processOEmbed(
        services.oembed,
        clean.event.longDescription,
        {
          current: clean.event.links,
        },
      );
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
        draft: isDraft,
        fileKey,
        formSchema: await payload.getFormSchema({ access }), // Pass formSchema for location tag filtering
      });

      payload.setItem('event', event);

      log('created event', event.uid);
    } catch (e) {
      let error = e;
      if (e.toString() === 'ValidationError: Invalid data') {
        error = new BadRequest(
          {
            info: { errors: formatEventErrors(e.info.errors, userLang) },
          },
          'invalid data',
        );
        log.warn('failed to create event', {
          agendaUid: agenda.uid,
          event: clean.event,
          error,
        });
      } else {
        log.error('failed to create event', {
          agendaUid: agenda.uid,
          event: clean.event,
          error,
        });
      }
      throw error;
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
        draft: isDraft,
        userUid,
        access,
        duplicateOrigin,
      },
    );
    log.info('create successful', {
      agendaUid,
      eventUid: response.event.uid,
      agenda: _.pick(agenda, ['uid', 'slug', 'title']),
      actingUserUid: userUid,
      callOrigin,
      // ...callOrigin === 'api' ? { event: response.event } : undefined,
    });
  } catch (e) {
    log.info('create failed', {
      error: e,
      errors: e.info?.errors,
      agendaUid,
      userUid,
      callOrigin,
      ...callOrigin === 'api' ? { submittedData: data } : undefined,
    });
    throw e;
  }

  if (
    !isDraft
    && registrations?.utils.passCulture.isMarkedAsPending(
      response.event.registration.find((r) => r.service === 'passCulture')
        ?.data,
    )
  ) {
    registrations.utils.passCulture.enqueuePending({
      agendaUid,
      eventUid: response.event.uid,
    });
  }

  return returnPayload ? response : response.event;
};
