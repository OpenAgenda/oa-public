'use strict';

const _ = require('lodash');
const { diff } = require('deep-diff');

const log = require('@openagenda/logs')('core/agendas/utils/cleanEvent');
const eventSchema = require('@openagenda/event-form/src/schema');
const labels = require('@openagenda/labels/event/form');

const validateEvent = require('./validateEvent');
const getWriteAccess = require('./getWriteAccess');

const eventFields = eventSchema.eventFields({
  labels,
});

const eventFieldNames = eventFields.map(f => f.field);

function extractLocationUidFromData({ completeEventData, data }) {
  if (
    !data?.locationUid
    && !data?.location?.uid
    && (data?.locationUid === null || data?.location === null || data?.location?.uid === null)
  ) {
    return null;
  }

  return completeEventData?.location?.uid ?? completeEventData?.locationUid;
}

function containsEventData(data) {
  const fields = eventFieldNames.filter(f => f !== 'languages');
  return !!Object.keys(data ?? {}).filter(f => fields.includes(f)).length;
}

function isDifferent(a, b) {
  const ignoredFields = ['originAgenda', 'agenda', 'updatedAt'];

  return !!diff(
    _.omit(a, ignoredFields),
    _.omit(b, ignoredFields),
  );
}

module.exports = Object.assign(async function cleanEvent(services, agenda, data, options = {}) {
  const {
    agendaEvents,
    registrations,
  } = services;

  const completeEventData = options.validateWithStoredData ? {
    ...options.event,
    ...data,
  } : data;

  const locationUid = extractLocationUidFromData({ data, completeEventData });

  const location = locationUid ? await services.agendaLocations.get({
    uid: locationUid,
  }, {
    returnMergeTarget: true,
    deleted: null,
  }).catch(e => {
    if (!['BadRequest', 'BadRequestError'].includes(e.name)) {
      throw e;
    }
  }) : null;

  log('fetched agenda %s and location %s', agenda?.uid, location?.uid);

  const pre = locationUid !== undefined ? { ...data, locationUid } : data;

  if (location) {
    pre.location = location;
  }

  const clean = validateEvent({
    formSchema: agenda.formSchema,
    networkFormSchema: _.get(agenda, 'network.formSchema'),
    location,
    validateAgendaEvent: agendaEvents.validate,
  }, pre, options);

  const passCulturePayload = clean.event.registration?.find(({ service }) => service === 'passCulture')?.data;
  if (passCulturePayload && registrations) {
    clean.passCulture = await registrations(agenda.settings.registration).passCulture.validateEventOffer(clean.event, passCulturePayload);
  } else if (passCulturePayload && !registrations) {
    log('passCulture payload is set but registrations is not initialized');
  }

  return clean;
}, {
  containsEventData,
  isDifferent,
  eventFields,
});
