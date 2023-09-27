'use strict';

const _ = require('lodash');
const { diff } = require('deep-diff');
const VError = require('@openagenda/verror');
const labels = require('@openagenda/labels/event/form');

const log = require('@openagenda/logs')('events/createUpdateActivity');

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

module.exports = async function createActivity(services, before, after, context) {
  log('processing');

  const { users, activities } = services;
  const { agenda, member, formSchema, agendaEvent } = context;

  if (!activities) {
    return log('warn', 'activities service is not initialized');
  }

  if (after.draft) {
    return;
  }

  let user;

  if (!_.get(context, 'userUid')) {
    return log('warn', 'userUid is not set in context, will not register activity');
  }

  try {
    user = await users.get(context.userUid);
  } catch (e) {
    return log('error', new VError(e, 'Error to get user %s', context.userUid));
  }

  const changes = diff(before, after);

  const allChangedFields = (changes ?? [])
    .map(v => v.path[0])
    .filter((v, i, a) => a.indexOf(v) === i)
    .filter(field => field !== 'state');

  const changedFields = allChangedFields.reduce((accu, changedField) => {
    const fieldSchema = formSchema.fields.find(v => v.field === changedField);

    // skip internal fields
    if (fieldSchema.write?.length === 1 && fieldSchema.write[0] === 'internal') {
      return accu;
    }

    const fieldAccess = getFieldReadAccess(fieldSchema);

    if (!fieldAccess) {
      return accu;
    }

    if (!accu[fieldAccess]) {
      accu[fieldAccess] = [];
    }

    if (labels[fieldSchema.field] && _.isEqual(fieldSchema.label, labels[fieldSchema.field])) {
      accu[fieldAccess].push(fieldSchema.field);
    } else if (fieldSchema.label) {
      accu[fieldAccess].push({ label: fieldSchema.label });
    }

    return accu;
  }, {});

  const hasChanges = changedFields.contributor?.length
    || changedFields.moderator?.length
    || changedFields.administrator?.length;

  if (hasChanges) {
    await activities.addActivity({ entityType: 'event', entityUid: after.uid }, {
      actor: `user:${user.uid}`,
      verb: 'event.update',
      object: `event:${after.uid}`,
      target: `agenda:${agenda.uid}`,
      store: {
        labels: {
          actor: member.name ?? member.custom?.contactName ?? user.fullName,
          object: before.title,
          target: agenda.title,
        },
        diff: changes,
        contributorFields: changedFields.contributor,
        moderatorFields: changedFields.moderator,
        administratorFields: changedFields.administrator,
        userUid: agendaEvent.userUid,
      },
    });
  }
};
