'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('services/agendas/onCreate');

const resetCache = require('./lib/resetCache');

module.exports = async (services, before, after, context) => {
  const {
    activities,
    elasticsearch: legacyEventSearch,
  } = services;

  const hasContributionSettingsChange = JSON.stringify(before.settings.contribution) !== JSON.stringify(after.settings.contribution);
  const hasCredentialsChange = JSON.stringify(before.credentials) !== JSON.stringify(after.credentials);
  let updateType;

  if (legacyEventSearch) {
    try {
      await legacyEventSearch.updateAgenda(after.id);
    } catch (e) {
      log('error', 'could not update legacy search for agenda %s', after.slug, e);
    }
  } else {
    log('warn', 'legacy search service was not initialized');
  }

  if (hasContributionSettingsChange) {
    updateType = 'contribution';
  } else if (hasCredentialsChange) {
    updateType = 'credentials';
  } else if (!_.isEqual(
    _.omit(before, ['settings', 'credentials', 'title', 'official', 'officializedAt', 'updatedAt']),
    _.omit(after, ['settings', 'credentials', 'title', 'official', 'officializedAt', 'updatedAt'])
  )) {
    updateType = 'profile';
  }

  await resetCache(services, after);

  if (!activities) {
    return;
  }

  if (!context) {
    // no user is provided if it an update of a referenced event is the origin of the call
    return;
  }

  if (before.title !== after.title) {
    activities.feed({ entityType: 'agenda', entityUid: after.uid }).activities.add({
      actor: `user:${context.user.uid}`,
      verb: 'agenda.rename',
      target: `agenda:${after.uid}`,
      store: {
        labels: {
          actor: context.user.name,
          beforeTitle: before.title,
          afterTitle: after.title
        }
      }
    });
  }

  if (updateType && updateType !== 'credentials') {
    activities.feed({ entityType: 'agenda', entityUid: after.uid }).activities.add({
      actor: `user:${context.user.uid}`,
      verb: `agenda.update${_.upperFirst(updateType)}`,
      target: `agenda:${after.uid}`,
      store: {
        labels: {
          actor: context.user.name,
          target: after.title
        }
      }
    });
  }

  if (before.official !== after.official) {
    activities.feed({ entityType: 'agenda', entityUid: after.uid }).activities.add({
      actor: `user:${context.user.uid}`,
      verb: 'agenda.setOfficial',
      target: `agenda:${after.uid}`,
      store: {
        labels: {
          actor: context.user.name,
          target: after.title
        },
        officialized: !!after.official
      }
    });
  }
};
