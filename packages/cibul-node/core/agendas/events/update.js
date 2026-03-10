import _ from 'lodash';
import ih from 'immutability-helper';
import logs from '@openagenda/logs';
import { Forbidden } from '@openagenda/verror';
import createPayload from '../utils/createPayload.js';
import refreshAgenda from '../utils/refreshAgenda.js';
import cleanEvent from '../utils/cleanEvent/index.js';
import getAgenda from '../utils/getAgenda.js';
import Stopwatch from '../utils/Stopwatch.js';
import formatError from '../utils/formatError.js';
import loadAuthorizations, {
  filterUnauthorized,
  getAccessFromMember,
} from '../../utils/authorizations.js';
import assignState from '../utils/assignState.js';
import convertLocationAdditionalFields from '../utils/convertLocationAdditionalFields.js';
import updateEvent from './lib/updateEvent.js';
import createUpdateActivity from './lib/createUpdateActivity.js';
import sendUpdateEmail from './lib/sendUpdateEmail.js';

const { containsEventData, isDifferent: isEventDifferent } = cleanEvent;

const log = logs('core/agendas/events/update');

const shouldHaveAgendaEvent = (operation, event) =>
  operation !== 'create' && !event.draft;

async function update(core, agendaUid, eventUid, data, options = {}) {
  const {
    agendaEvents,
    eventSearch,
    members,
    aggregators,
    custom,
    registrations,
  } = core.services;

  const stopwatch = Stopwatch();
  const times = {};

  const actingUserUid = options.userUid ?? options.context?.userUid;

  log(
    'info',
    'update of event %s on agenda %s%s',
    eventUid,
    agendaUid,
    actingUserUid ? ` by user ${actingUserUid}` : ' (no acting user)',
  );

  const {
    defaultLang = 'en',
    batched = false,
    aggregated = null,
    access = 'public',
    filterUnauthorizedData = true,
    returnPayload = false,
    private: privateOption = false,
    callOrigin = 'ui',
    userLang = 'en',
    mergeExtIds = true,
    isPatch = false,
    // useful for updating data through system processes (like post merge location uid patches) even when events are invalid
    systemValidatePatchDataOnly = false,
  } = options;

  let response;

  try {
    const agenda = await getAgenda(core.services, agendaUid, {
      detailed: true,
      includeMemberSchema: true,
    });

    times.agenda = stopwatch();

    log('  loaded agenda %s', agenda?.slug);

    const internalGetOptions = {
      access: 'internal',
      detailed: true,
      throwOnNotFound: true,
      private: privateOption,
    };

    const { standardEvent: event, event: eventWithAdditionalValues } = await core
      .agendas(agendaUid)
      .events.get(eventUid, {
        ...internalGetOptions,
        returnPayload: true,
      })
      .catch(async (error) => {
        if (error.name === 'NotFound') {
          // resync
          await eventSearch.remove({ event: { uid: eventUid }, agenda }).then(
            () => {
              log.info('removed ghost from index', { eventUid, agendaUid });
            },
            (e) =>
              log.warn('failed to remove ghost from index', {
                eventUid,
                agendaUid,
                error: e,
              }),
          );
        }
        throw error;
      });

    times.getEvent = stopwatch();

    const wasDraft = event.draft;
    const isDraft = wasDraft ? data?.draft : false;

    log('  loaded event %s', event.slug);

    const agendaEvent = shouldHaveAgendaEvent('update', event)
      ? await agendaEvents(agenda.uid).get(event.uid, { throwOnNotFound: true })
      : null;

    times.agendaEvent = stopwatch();

    const actingMember = actingUserUid
      ? await members.get(
        {
          agendaUid: agenda.uid,
          userUid: actingUserUid,
        },
        { roleAsSlug: false },
      )
      : null;

    const clean = await cleanEvent(core.services, agenda, data, {
      // required to validate related fields in case of partial update
      storedData: eventWithAdditionalValues,
      systemValidatePatchDataOnly,
      validateAsDraft: isDraft,
      isPatch,
      optionalSecondaryFields: true,
      access,
      member: actingMember,
      defaultLang,
      aggregated,
    });

    times.cleanEvent = stopwatch();

    const authorizations = await loadAuthorizations(core, 'update', {
      agenda,
      event,
      agendaEvent,
      member: actingMember,
      access,
      userUid: actingUserUid,
    });

    times.loadAuthorizations = stopwatch();

    const { type: stateChangeType } = assignState(agenda, event, clean, data, {
      authorizations,
      currentState: agendaEvent?.state,
    });

    if (filterUnauthorizedData) {
      filterUnauthorized(agendaUid, eventUid, clean, data, authorizations);
    }

    if (!authorizations.canEditEvent && containsEventData(data)) {
      throw new Forbidden(
        {
          info: {
            uid: event.uid,
          },
        },
        'not authorized to edit event',
      );
    }

    let updatedRegistration = false;
    if (
      !clean.draft
      && registrations
      && agenda?.settings?.registration?.passCulture
    ) {
      try {
        updatedRegistration = await registrations.utils.passCulture.process(
          agenda,
          clean,
          event,
          agendaEvent?.state,
          actingMember,
          actingUserUid,
        );
      } catch (e) {
        log('error', 'failed to process passCulture registration', e);
        throw e;
      }
    }

    times.passCultureProcess = stopwatch();

    if (updatedRegistration) clean.event.registration = updatedRegistration;

    const payload = createPayload(core, agenda);

    if (containsEventData(data) || updatedRegistration) {
      await updateEvent(core.services, {
        clean,
        payload,
        draft: isDraft,
        isPatch,
        agendaUid,
        userUid: actingUserUid,
        eventUid,
        privateOption,
        event,
        userLang,
        mergeExtIds,
      });
      times.updateEvent = stopwatch();
    } else {
      payload.setItem('event', event, event);
    }

    if (agenda.formSchemaId && clean.custom) {
      const result = await custom(agenda.formSchemaId).set(
        eventUid,
        clean.custom,
        { validate: false, partial: true }, // validation is already done
      );
      log('updated agenda custom data %s.%s', agenda.formSchemaId, eventUid);
      payload.setItem('custom.agenda', result.before, result.custom);
    } else if (agenda.formSchemaId) {
      const agendaData = await custom(agenda.formSchemaId).get(eventUid);
      payload.setItem('custom.agenda', agendaData, agendaData);
      times.customAgenda = stopwatch();
    }

    if (agenda.network?.formSchemaId && clean.networkCustom) {
      const result = await custom(agenda.network.formSchemaId).set(
        eventUid,
        clean.networkCustom,
        { validate: false, partial: true }, // validation is already done
      );
      log(
        'updated network custom data %s.%s',
        agenda.network.formSchemaId,
        eventUid,
      );
      payload.setItem('custom.network', result.before, result.custom);
      times.customNetwork = stopwatch();
    } else if (agenda.network?.formSchemaId) {
      const networkData = await custom(agenda.network?.formSchemaId).get(
        eventUid,
      );
      payload.setItem('custom.network', networkData, networkData);
    }

    if (isDraft) {
      response = await payload.getResponse('updated', access);
      log('sending response for draft update');
      return returnPayload ? response : response.updated;
    }

    const formSchema = await payload.getFormSchema({ access: 'internal' });

    // if event is not draft or was just undrafted, agendaEvent ref must be set
    if (clean.agendaEvent) {
      try {
        const result = await agendaEvents(agendaUid).set(
          eventUid,
          ih(clean.agendaEvent, {
            create: {
              $set: { canEdit: true },
            },
          }),
          {
            aggregated,
            context: {
              aggregated,
              userUid: actingUserUid,
              member: actingMember,
              event: payload.getEvent('after'),
              agenda,
              stateChangeType,
              batched,
            },
            decorate: ['sourceAgendas', 'user'],
          },
        );

        times.agendaEventsSet = stopwatch();

        if (result.set.userUid) {
          log(
            'user linked to agendaEvent reference %s.%s: %s',
            agendaUid,
            eventUid,
            result.set.userUid,
          );
          result.set.member = await core
            .agendas(agenda)
            .members.get(result.set.userUid, {
              access: 'internal',
              throwOnNotFound: false,
              roleAsSlug: false,
            });
          times.memberSet = stopwatch();
        }

        log('updated agendaEvent reference %s.%s', agendaUid, eventUid);
        payload.setItem('agendaEvent', result.before, result.set);
      } catch (e) {
        log('error', 'failed to update agendaEvent ref', e);
        throw e;
      }
    }

    response = await payload.getResponse('event', {
      access: getAccessFromMember(core.services, actingMember, access),
      load: { valid: true },
    });

    const fullEvent = {
      before: await payload.getCompiledEvent('before', null, null, {
        valid: true,
      }), // full access for internal use
      after: await payload.getCompiledEvent('after', null, null, {
        valid: true,
      }), // full access for internal use
    };

    try {
      await eventSearch.update({
        ...response,
        formSchema,
        event: fullEvent.after.location
          ? convertLocationAdditionalFields(formSchema, fullEvent.after)
          : fullEvent.after,
      });
      log('updated search for event %s', eventUid);
      times.eventSearchUpdate = stopwatch();
    } catch (e) {
      log(
        'error',
        'could not update search indices for event %s.%s: %s',
        agenda.uid,
        eventUid,
        formatError(e),
      );
    }

    const eventHasChanged = isEventDifferent(fullEvent.before, fullEvent.after);

    if (eventHasChanged) {
      try {
        await sendUpdateEmail(core, {
          batched,
          event: fullEvent.after,
          agenda,
        });
      } catch (e) {
        log('error', 'failed to send update notification email', e);
      }
      times.sendUpdateEmail = stopwatch();
    }

    if (eventHasChanged && !event.draft) {
      try {
        await createUpdateActivity(
          core.services,
          fullEvent.before,
          fullEvent.after,
          {
            userUid: actingUserUid,
            agenda,
            formSchema,
            member: actingMember,
            agendaEvent,
          },
        );
        times.activity = stopwatch();
      } catch (e) {
        log('error', 'failed to create activity', e);
      }
    }

    if (
      !isDraft
      && updatedRegistration
      && registrations.utils.passCulture.isMarkedAsPending(
        response.event.registration.find((r) => r.service === 'passCulture')
          ?.data,
      )
    ) {
      registrations.utils.passCulture.enqueuePending({
        agendaUid,
        eventUid: response.event.uid,
      });
    }

    await aggregators.notify(
      fullEvent.before.draft ? 'addEvent' : 'updateEvent',
      {
        event: fullEvent.after,
        before: fullEvent.before,
        agenda,
        formSchema,
        batched,
      },
    );

    await refreshAgenda(core.services, agenda.uid);

    log.info('update successful', {
      agendaUid,
      eventUid,
      agenda: _.pick(agenda, ['uid', 'slug', 'title']),
      actingUserUid: actingUserUid
        ? ` by user ${actingUserUid}`
        : ' (no acting user)',
      callOrigin,
      ...callOrigin === 'api'
        ? { event: response.event, submittedData: data }
        : undefined,
    });
  } catch (e) {
    log.info('update failed', {
      eventUid,
      error: e,
      errors: e.info?.errors,
      agendaUid,
      userUid: actingUserUid,
      callOrigin,
      ...callOrigin === 'api' ? { submittedData: data } : undefined,
    });
    throw e;
  }

  response.times = times;

  return returnPayload ? response : response.event;
}

function patch(core, agendaUid, eventUid, data, options = {}) {
  return update(core, agendaUid, eventUid, data, {
    ...options,
    isPatch: true,
  });
}

export default Object.assign(update, { patch });
