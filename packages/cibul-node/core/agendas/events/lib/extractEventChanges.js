import _ from 'lodash';
import labels from '@openagenda/labels/event/form.js';
import deepDiff from 'deep-diff';
import logs from '@openagenda/logs';

const log = logs('core/agendas/events/extractEventChanges');

const { diff } = deepDiff;

function stripUndefinedValuesAndConvertDates(obj) {
  return Object.fromEntries(
    Object.entries(obj)
      .map(([key, value]) => [
        key,
        value instanceof Date ? value.toISOString() : value,
      ])
      .filter(([_key, value]) => value !== undefined),
  );
}

function getFieldReadAccess(fieldSchema) {
  if (!fieldSchema.read || fieldSchema.read.includes('contributor')) {
    return 'contributor';
  }

  if (fieldSchema.read.includes('moderator')) {
    return 'moderator';
  }

  if (fieldSchema.read.includes('administrator')) {
    return 'administrator';
  }
}

const keepLocationUidOnly = (event) =>
  (event.location && typeof event.location === 'object'
    ? {
      ...event,
      location: { uid: event.location.uid },
    }
    : event);

export default function extractEventChanges({
  before,
  after,
  formSchema,
  agenda,
}) {
  const changes = diff(
    stripUndefinedValuesAndConvertDates(keepLocationUidOnly(before)),
    stripUndefinedValuesAndConvertDates(keepLocationUidOnly(after)),
  );

  const allChangedFields = (changes ?? [])
    .map((v) => v.path[0])
    .filter((v, i, a) => a.indexOf(v) === i)
    .filter((field) => field !== 'state');

  const changedFields = allChangedFields.reduce((accu, changedField) => {
    const fieldSchema = formSchema.fields.find((v) => v.field === changedField);

    if (!fieldSchema) {
      log.info(
        `no schema found for field ${changedField} on agenda ${agenda.uid}`,
      );
      return accu;
    }

    // skip internal fields
    if (
      fieldSchema.write?.length === 1
      && fieldSchema.write[0] === 'internal'
    ) {
      return accu;
    }

    const fieldAccess = getFieldReadAccess(fieldSchema);

    if (!fieldAccess) {
      return accu;
    }

    if (!accu[fieldAccess]) {
      accu[fieldAccess] = [];
    }

    if (
      labels[fieldSchema.field]
      && _.isEqual(fieldSchema.label, labels[fieldSchema.field])
    ) {
      accu[fieldAccess].push(fieldSchema.field);
    } else if (fieldSchema.label) {
      accu[fieldAccess].push({ label: fieldSchema.label });
    }

    return accu;
  }, {});

  return {
    hasChanges: !!(
      changedFields.contributor?.length
      || changedFields.moderator?.length
      || changedFields.administrator?.length
    ),
    changes,
    changedFields,
  };
}
