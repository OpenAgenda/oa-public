'use strict';

const _ = require('lodash');
const { diff } = require('deep-diff');
const VError = require('verror');
const labels = require('@openagenda/labels/event/form');

const log = require('@openagenda/logs')('events/createUpdateActivity');

module.exports = async function createActivity(services, before, after, context) {
  log('processing');

  const { users, activities } = services;
  const { agenda, formSchema } = context;

  if (!activities) {
    return log('warn', 'activities service is not initialized');
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

  const changes = diff(
    before,
    after,
    (path, key) => ['updatedAt', 'location'].includes(key),
  );

  const allChangedFields = (changes ?? [])
    .map(v => v.path[0])
    .filter((v, i, a) => a.indexOf(v) === i);

  const contributorFields = allChangedFields.reduce((accu, changedField) => {
    const fieldSchema = formSchema.fields.find(v => v.field === changedField);

    if (!fieldSchema.read || fieldSchema.read.includes('contributor')) {
      if (labels[fieldSchema.field] && _.isEqual(fieldSchema.label, labels[fieldSchema.field])) {
        accu.push(fieldSchema.field);
      } else {
        accu.push({ label: fieldSchema.label });
      }
    }

    return accu;
  }, []);

  const moderatorFields = allChangedFields.reduce((accu, changedField) => {
    const fieldSchema = formSchema.fields.find(v => v.field === changedField);

    if (fieldSchema.read?.includes('moderator')) {
      if (labels[fieldSchema.field] && _.isEqual(fieldSchema.label, labels[fieldSchema.field])) {
        accu.push(fieldSchema.field);
      } else {
        accu.push({ label: fieldSchema.label });
      }
    }

    return accu;
  }, []);

  const administratorFields = allChangedFields.reduce((accu, changedField) => {
    const fieldSchema = formSchema.fields.find(v => v.field === changedField);

    if (fieldSchema.read?.includes('administrator')) {
      if (labels[fieldSchema.field] && _.isEqual(fieldSchema.label, labels[fieldSchema.field])) {
        accu.push(fieldSchema.field);
      } else {
        accu.push({ label: fieldSchema.label });
      }
    }

    return accu;
  }, []);

  await activities.feed({ entityType: 'event', entityUid: after.uid }).activities.add({
    actor: `user:${user.uid}`,
    verb: 'event.update',
    object: `event:${after.uid}`,
    target: `agenda:${agenda.uid}`,
    store: {
      labels: {
        actor: user.fullName,
        object: before.title,
        target: agenda.title,
      },
      diff: changes,
      contributorFields,
      moderatorFields,
      administratorFields,
    },
  });
};
