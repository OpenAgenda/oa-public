'use strict';

const log = require('@openagenda/logs')('services/agendas/onCreate');
const { diff } = require('deep-diff');

const resetCache = require('./lib/resetCache');

module.exports = async (services, before, after, context) => {
  const {
    activities,
    elasticsearch: legacyEventSearch,
  } = services;

  if (legacyEventSearch) {
    try {
      await legacyEventSearch.updateAgenda(after.id);
    } catch (e) {
      log('error', 'could not update legacy search for agenda %s', after.slug, e);
    }
  } else {
    log('warn', 'legacy search service was not initialized');
  }

  // settings.{tracking,lab,inbox,contribution,translation}

  await resetCache(services, after);

  if (!activities) {
    return;
  }

  if (!context) {
    // no user is provided if it an update of a referenced event is the origin of the call
    return;
  }

  const profileFields = ['title', 'slug', 'description', 'image', 'url'];
  const changes = diff(
    before,
    after,
    (path, key) => { // reversed filter, WHY ?
      if (path.length !== 0) return false; // keep deep
      return ![...profileFields, 'credentials', 'settings'].includes(key);
    },
  );

  if (changes?.length) {
    activities.feed({ entityType: 'agenda', entityUid: after.uid }).activities.add({
      actor: `user:${context.user.uid}`,
      verb: 'agenda.update',
      target: `agenda:${after.uid}`,
      store: {
        labels: {
          actor: context.user.name,
          target: after.title,
        },
        diff: changes,
      },
    });
  }

  if (before.official !== after.official && after.official) {
    activities.feed({ entityType: 'agenda', entityUid: after.uid }).activities.add({
      actor: `user:${context.user.uid}`,
      verb: 'agenda.setOfficial',
      target: `agenda:${after.uid}`,
      store: {
        labels: {
          actor: context.user.name,
          target: after.title,
        },
        officialized: !!after.official,
      },
    });
  }
};
