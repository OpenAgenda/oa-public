import _ from 'lodash';
import deepDiff from 'deep-diff';
import logs from '@openagenda/logs';
import * as eventSchema from '@openagenda/event-form/src/schema.js';
import labels from '@openagenda/labels/event/form.js';
import validateEvent from './validateEvent.js';
import getWriteAccess from './getWriteAccess.js';
import moveLegacyImageCredits from './moveLegacyImageCredits.js';

const { diff } = deepDiff;

const log = logs('core/agendas/utils/cleanEvent');

const eventFields = eventSchema.eventFields({
  labels,
});

const eventFieldNames = eventFields.map((f) => f.field);

function extractLocationUidFromData({ completeEventData, data }) {
  if (
    !data?.locationUid
    && !data?.location?.uid
    && (data?.locationUid === null
      || data?.location === null
      || data?.location?.uid === null)
  ) {
    return null;
  }

  if (data?.location?.uid || data.locationUid) {
    return data?.location?.uid ?? data.locationUid;
  }

  return completeEventData?.location?.uid ?? completeEventData?.locationUid;
}

function containsEventData(data) {
  const fields = eventFieldNames.filter((f) => f !== 'languages');
  return !!Object.keys(data ?? {}).filter((f) => fields.includes(f)).length;
}

function isDifferent(a, b) {
  const ignoredFields = ['originAgenda', 'agenda', 'updatedAt', 'state'];

  return !!diff(_.omit(a, ignoredFields), _.omit(b, ignoredFields));
}

export default Object.assign(
  async function cleanEvent(services, agenda, data, options = {}) {
    const { agendaEvents, registrations } = services;

    const completeEventData = options.validateWithStoredData
      ? {
        ...options.event,
        ...data,
      }
      : data;

    const locationUid = extractLocationUidFromData({ data, completeEventData });

    const location = locationUid
      ? await services.agendaLocations
        .get(
          {
            uid: locationUid,
          },
          {
            returnMergeTarget: true,
            deleted: null,
          },
        )
        .catch((e) => {
          if (!['BadRequest', 'BadRequestError'].includes(e.name)) {
            throw e;
          }
        })
      : null;

    log('fetched agenda %s and location %s', agenda?.uid, location?.uid);

    const pre = moveLegacyImageCredits(
      locationUid !== undefined ? { ...data, locationUid } : data,
    );

    if (location) {
      pre.location = location;
    }

    const clean = validateEvent(
      {
        formSchema: agenda.formSchema,
        networkFormSchema: _.get(agenda, 'network.formSchema'),
        location,
        validateAgendaEvent: agendaEvents.validate,
      },
      pre,
      options,
    );

    const passCulturePayload = clean.event.registration?.find(
      ({ service }) => service === 'passCulture',
    )?.data;

    if (
      passCulturePayload
      && registrations
      && getWriteAccess(options.member, options.access)
    ) {
      const throwError = data?.registration?.find(({ service }) => service === 'passCulture')
        ?.data || data.location;
      clean.passCulture = await registrations(
        agenda.settings.registration,
      ).passCulture.validate({ ...clean.event, location }, passCulturePayload, {
        noThrow: !throwError,
      });
    } else if (passCulturePayload && !registrations) {
      log('passCulture payload is set but registrations is not initialized');
    }

    return clean;
  },
  {
    containsEventData,
    isDifferent,
    eventFields,
  },
);
