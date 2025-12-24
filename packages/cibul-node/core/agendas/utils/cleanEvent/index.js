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
const validLog = logs('core/agendas/utils/cleanEvent.getIsValid');

const eventFields = eventSchema.eventFields({
  labels,
});

const eventFieldNames = eventFields.map((f) => f.field);

async function extractLocationFromData(
  services,
  { completeEventData, data, verifyLocationExists = true },
) {
  const { agendaLocations } = services;

  let locationUid = null;

  if (
    !data?.locationUid
    && !data?.location?.uid
    && (data?.locationUid === null
      || data?.location === null
      || data?.location?.uid === null)
  ) {
    return { location: null, locationUid };
  }

  if (data?.location?.uid || data.locationUid) {
    locationUid = data?.location?.uid ?? data.locationUid;
  } else {
    locationUid = completeEventData?.location?.uid ?? completeEventData?.locationUid;
  }

  if (
    !verifyLocationExists
    && locationUid // has a direct location uid ref
    && completeEventData?.location?.uid === locationUid // has a location object that is the same as the direct ref
  ) {
    return {
      locationUid,
      location: completeEventData.location,
    };
  }

  const location = locationUid
    ? await agendaLocations
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

  return { location, locationUid };
}

function containsEventData(data) {
  const fields = eventFieldNames.filter((f) => f !== 'languages');
  return !!Object.keys(data ?? {}).filter((f) => fields.includes(f)).length;
}

function isDifferent(a, b) {
  const ignoredFields = ['originAgenda', 'agenda', 'updatedAt', 'state'];

  return !!diff(_.omit(a, ignoredFields), _.omit(b, ignoredFields));
}

function isStrictUnpublish(data) {
  if (Object.keys(_.omit(data, ['motive']))?.length !== 1) {
    return false;
  }
  if ([undefined, 2].includes(data.state)) {
    return false;
  }
  return true;
}

function getPassCulturePayload(data) {
  return data?.registration?.find(({ service }) => service === 'passCulture')
    ?.data;
}

async function cleanEvent(services, agenda, data, options = {}) {
  const { agendaEvents, registrations } = services;

  const {
    isPatch = false,
    verifyLocationExists = true,
    storedData = {},
  } = options;

  const completeEventData = isPatch
    ? {
      ...storedData,
      ...data,
    }
    : data;

  const { locationUid, location } = await extractLocationFromData(services, {
    data,
    completeEventData,
    verifyLocationExists,
  });

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
    {
      ...options,
      isStrictUnpublish: isStrictUnpublish(data),
    },
  );

  const hasPassCulturePayload = !!getPassCulturePayload(data);
  const passCulturePayload = getPassCulturePayload(clean.event);

  if (
    hasPassCulturePayload
    && registrations
    && getWriteAccess(options.member, options.access)
  ) {
    const throwOnError = data?.registration?.find(({ service }) => service === 'passCulture')
      ?.data || data.location;

    clean.passCulture = await registrations(
      agenda.settings.registration,
    ).passCulture.validate({ ...clean.event, location }, passCulturePayload, {
      throwOnError,
    });
  } else if (passCulturePayload && !registrations) {
    log('passCulture payload is set but registrations is not initialized');
  }

  return clean;
}

function getIsValid(core, agenda, event, options = {}) {
  const { verifyLocationExists = true } = options;
  return cleanEvent(core.services, agenda, event, {
    optionalSecondaryFields: true,
    verifyLocationExists,
  }).then(
    () => true,
    (error) => {
      if (error.name !== 'BadRequest') {
        validLog.debug('%s: exception', event.slug, { error });
        throw error;
      }
      validLog.debug('%s: NOT valid', event.slug, {
        errors: error.info.errors,
      });
      return false;
    },
  );
}

export default Object.assign(cleanEvent, {
  containsEventData,
  isDifferent,
  eventFields,
  getIsValid,
});
