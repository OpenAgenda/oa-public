import deepDiff from 'deep-diff';
import logs from '@openagenda/logs';
import resetCache from './lib/resetCache.js';

const { diff } = deepDiff;

const log = logs('agendas/onUpdate');

export default async (services, before, after, context) => {
  const { activities, core, aggregators } = services;

  // settings.{tracking,lab,inbox,contribution,translation}

  await resetCache(services, after, { before });

  if (activities && context) {
    const profileFields = ['title', 'slug', 'description', 'image', 'url'];
    const changes = diff(before, after, (path, key) => {
      // reversed filter, WHY ?
      if (path.length !== 0) return false; // keep deep
      return ![...profileFields, 'credentials', 'settings'].includes(key);
    });

    if (changes?.length) {
      activities.addActivity(
        { entityType: 'agenda', entityUid: after.uid },
        {
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
        },
      );
    }

    if (before.official !== after.official && after.official) {
      activities.addActivity(
        { entityType: 'agenda', entityUid: after.uid },
        {
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
        },
      );
    }
  }

  if (
    before.credentials.memberCustom !== after.credentials.memberCustom
    && after.credentials.memberCustom
    && !before.memberSchemaId
  ) {
    core.agendas(before.uid).settings.schema.updateMemberFields(
      ['organization', 'phone', 'name', 'position', 'email'].map((field) => ({
        field,
        fieldType: 'abstract',
        optional: false,
      })),
      { access: 'internal' },
    );
  }

  if (!aggregators) {
    return;
  }

  if (before.credentials.aggregator && !after.credentials.aggregator) {
    log('disabling aggregator');
    await aggregators.set(
      after.uid,
      { limit: null },
      { patch: true, protected: false },
    );
  } else if (!before.credentials.aggregator && after.credentials.aggregator) {
    log('enabling aggregator');
    await aggregators.set(
      after.uid,
      { limit: -1 },
      { patch: true, protected: false },
    );
  }
};
