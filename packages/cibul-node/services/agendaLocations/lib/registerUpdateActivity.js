'use strict';

const _ = require('lodash');
const { diff } = require('deep-diff');
const VError = require('@openagenda/verror');

const labels = require('@openagenda/labels/agenda-locations/exportHeaders');
const log = require('@openagenda/logs')('services/agendaLocations/registerUpdateActivity');

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

function getUpdatedTags(changes, schema) {
  if (!changes) return [];

  const tagIds = [];

  for (const change of changes) {
    if (change.path.length === 1 && change.path[0] === 'tags') {
      if (change.item.kind === 'N') { // new item
        tagIds.push(change.item.rhs.id);
      }
      if (change.item.kind === 'D') { // deleted item
        tagIds.push(change.item.lhs.id);
      }
    }

    if (change.path.length === 3 && change.path[0] === 'tags' && change.path[2] === 'id') {
      if (change.kind !== 'N') { // not new
        tagIds.push(change.lhs);
      }
      if (change.kind !== 'D') { // not delete
        tagIds.push(change.rhs);
      }
    }
  }

  return tagIds
    .map(tagId => schema.fields.find(fieldSchema => fieldSchema.options?.find(option => option.id === tagId)))
    .filter((v, i, a) => a.indexOf(v) === i);
}

module.exports = async function registerUpdateActivity({
  services,
  agendaUid,
  userUid,
  agenda,
  before,
  after,
}) {
  const {
    members,
    activities,
  } = services;

  const locationSchema = agenda.schema.fields.find(v => v.field === 'location').schema;

  const changes = diff(
    before,
    after,
    (path, key) => path.length === 0 && key === 'updatedAt',
  );

  const updatedTags = getUpdatedTags(changes, locationSchema);

  const allChangedFields = (changes ?? [])
    .map(v => v.path[0])
    .filter((v, i, a) => a.indexOf(v) === i && v !== 'tags');

  const changedFields = allChangedFields.reduce((accu, changedField) => {
    const fieldSchema = locationSchema.fields.find(v => v.field === changedField);

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
    } else if (labels[fieldSchema.field]) {
      accu[fieldAccess].push(fieldSchema.field);
    }

    return accu;
  }, {
    contributor: updatedTags.map(fieldSchema => ({ label: fieldSchema.label })),
  });

  const hasChanges = changedFields.contributor?.length
    || changedFields.moderator?.length
    || changedFields.administrator?.length;

  if (hasChanges) {
    let member;

    try {
      member = await members.get({ agendaUid, userUid }, { detailed: true });
    } catch (e) {
      return log('error', new VError(e, 'Error to get member', { agendaUid, userUid }));
    }

    try {
      await activities.feed({ entityType: 'location', entityUid: after.uid }).activities.add({
        actor: `user:${userUid}`,
        verb: 'location.update',
        object: `location:${after.uid}`,
        target: `agenda:${agenda.uid}`,
        store: {
          labels: {
            actor: member.name ?? member.custom?.contactName ?? member.user.fullName,
            object: before.title,
            target: agenda.title,
          },
          diff: changes,
          contributorFields: changedFields.contributor,
          moderatorFields: changedFields.moderator,
          administratorFields: changedFields.administrator,
        },
      });
    } catch (e) {
      log('error', 'failed to create location update activity', e);
    }
  }
};
