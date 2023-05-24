'use strict';

const _ = require('lodash');
const { diff } = require('deep-diff');
const labels = require('@openagenda/labels/agenda-locations/exportHeaders');
const VError = require('@openagenda/verror');
const log = require('@openagenda/logs')('services/agendaLocations/onUpdate');
const createLocationFeeds = require('../lib/createLocationFeeds');

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

module.exports = function onUpdate(queue, services) {
  return async (before, after, context) => {
    log('location %s', before.uid);
    try {
      if (diff(
        _.omit(before, ['updatedAt']),
        _.omit(after, ['updatedAt']),
      )) {
        queue('syncImpactedEventsAndAgendas', before, after);
      }
    } catch (e) {
      log('error', 'failed to evaluate distance', e);
    }

    // Activity
    const { core, activities, members } = services;
    const { agendaUid, userUid } = context;
    let agenda;

    try {
      agenda = await core.agendas(agendaUid).get({
        detailed: true,
        access: 'internal',
        includeEvent: true,
        private: null,
      });
    } catch (e) {
      return log.error(new VError({
        cause: e,
        info: {
          agendaUid,
        },
      }, 'Cannot get agenda'));
    }

    try {
      await createLocationFeeds(services, {
        agendaUid,
        setUid: agenda.setUid,
        locationUid: after.uid,
      });
    } catch (e) {
      return log.error(new VError({
        cause: e,
        info: {
          agendaUid,
          setUid: agenda.setUid,
          locationUid: after.uid,
        },
      }, 'Cannot create location feeds'));
    }

    const locationSchema = agenda.schema.fields.find(v => v.field === 'location').schema;

    const changes = diff(
      before,
      after,
      (path, key) => path.length === 0 && key === 'updatedAt',
    );

    const allChangedFields = (changes ?? [])
      .map(v => v.path[0])
      .filter((v, i, a) => a.indexOf(v) === i);

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
      } else {
        accu[fieldAccess].push({ label: fieldSchema.label });
      }

      return accu;
    }, {});

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
  };
};
