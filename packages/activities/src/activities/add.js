'use strict';

const _ = require('lodash');
const VError = require('@openagenda/verror');
const schema = require('@openagenda/validators/schema');
const validators = require('@openagenda/validators');
const log = require('@openagenda/logs')('activities/add');

schema.register({
  text: validators.text,
  pass: validators.pass,
});

function parseArguments(identifiers, data, feedsIdentifiers, cb) {
  // eslint-disable-next-line prefer-rest-params
  const args = Array.isArray(arguments) ? arguments : Array.from(arguments);

  if (typeof args[args.length - 1] !== 'function') {
    args.push(null);
  }

  if (args.length === 3) {
    return {
      identifiers: args[0],
      data: args[1],
      feedsIdentifiers: null,
      cb: args[2],
    };
  }

  return {
    identifiers,
    data,
    feedsIdentifiers,
    cb,
  };
}

const fieldsSchema = [
  {
    name: 'actor',
    schema: {
      type: 'text',
      max: 255,
      optional: false,
    },
  },
  {
    name: 'verb',
    schema: {
      type: 'text',
      max: 255,
      optional: false,
    },
  },
  {
    name: 'object',
    schema: {
      type: 'text',
      max: 255,
      optional: true,
    },
  },
  {
    name: 'target',
    schema: {
      type: 'text',
      max: 255,
      optional: true,
    },
  },
  {
    name: 'store',
    schema: {
      type: 'pass',
      optional: true,
    },
  },
  {
    name: 'detail',
    schema: {
      type: 'pass',
      optional: true,
    },
  },
];

async function getActivityMask(
  config,
  { activity, targetFeed, originFeed, follow },
) {
  const maskFn = config.activities[activity.verb]?.mask;

  return maskFn
    ? maskFn({ activity, targetFeed, originFeed, follow, config })
    : null;
}

async function addActivityToFeed(config, { activity, targetFeed, mask }) {
  const row = {
    feed_id: targetFeed.id,
    activity_id: activity.id,
  };

  row.mask = mask ? JSON.stringify(mask) : null;

  await config.knex(config.schemas.feed_activity).insert(row);

  const { service, enableNotificationsForFeedTypes } = config;

  if (enableNotificationsForFeedTypes?.includes(targetFeed.entityType)) {
    try {
      await service
        .feed(targetFeed)
        .notifications.addActivity(_.omit(activity, mask));
    } catch (e) {
      if (e.code !== 'FEED_REJECTS_NOTIFICATION') {
        log.error(new VError(e, 'Error in addActivity task'));
      }
    }
  }
}

async function add(config, ...rest) {
  const { service, knex } = config;

  const args = parseArguments(...rest);
  const { identifiers, feedsIdentifiers } = args;
  let { data } = args;

  const dataSchema = fieldsSchema.reduce((prev, field) => {
    if (!field.schema) return prev;

    prev[field.dataKey || field.name] = field.schema;

    return prev;
  }, {});

  const validate = schema(dataSchema);

  data = validate(data);

  data.store = JSON.stringify(data.store || {});
  data.detail = data.detail ? JSON.stringify(data.detail) : null;
  const fields = fieldsSchema.reduce((prev, field) => {
    if (!data[field.dataKey || field.name]) return prev;

    prev[field.name] = data[field.dataKey || field.name];
    return prev;
  }, {});

  const feedsToGet = (identifiers ? [identifiers] : []).concat(
    feedsIdentifiers || [],
  );

  const feeds = [];

  for (const feedToGet of feedsToGet) {
    const feed = await service.feed(feedToGet).get({
      internal: true,
      followedBy: true,
    });
    if (feed) {
      feeds.push(feed);
    }
  }

  if (!feeds.length) {
    throw new VError(
      {
        info: {
          feeds: feedsToGet,
        },
      },
      "Feeds doesn't exist",
    );
  }

  const [activityId] = await knex(config.schemas.activity).insert(fields);

  log.info('Activity inserted:', activityId);

  const activity = await service.activities.get(activityId);

  const feedContainsActivity = new Set();

  for (const feed of feeds) {
    const mask = await getActivityMask(config, { activity, targetFeed: feed });
    await addActivityToFeed(config, { activity, targetFeed: feed, mask });
    feedContainsActivity.add(feed.targetFeed);
  }

  let followers = feeds.flatMap((v) => v.followedBy);

  const activityConfig = config.activities[activity.verb];
  const filterFollows = activityConfig?.filterFollows
    ? [].concat(activityConfig.filterFollows)
    : [];

  const startTime = performance.now();

  const feedCache = new Map();

  // Compteurs de performance
  let totalIterations = 0;
  let timeSpentInFeedChecks = 0;
  let timeSpentInPromiseAll = 0;
  let timeSpentInFilterFollows = 0;
  let timeSpentInActivityMask = 0;
  let timeSpentInAddActivityToFeed = 0;
  let timeSpentInNextFollowersLoop = 0;
  const timeSpentInFeedService = 0;
  let timeSpentInFollowersFilter = 0;

  while (followers.length) {
    totalIterations += 1;

    const ignoredTargetFeeds = new Set();

    const requiredFeedIds = new Set();
    for (const follower of followers) {
      requiredFeedIds.add(follower.originFeed);
      requiredFeedIds.add(follower.targetFeed);
    }

    // Pré-charger les feeds basiques (internal: true)
    const basicCacheKey = (id) => `${id}-${JSON.stringify({ internal: true })}`;
    const uncachedBasicIds = Array.from(requiredFeedIds).filter(
      (id) => !feedCache.has(basicCacheKey(id)),
    );

    if (uncachedBasicIds.length > 0) {
      (
        await service.feeds({ id: uncachedBasicIds }).get({ internal: true })
      ).forEach((feed) => {
        feedCache.set(basicCacheKey(feed.id), feed);
      });
    }

    // Pré-charger les followedBy pour tous les targetFeeds
    const followedByCacheKey = (id) =>
      `${id}-${JSON.stringify({ internal: true, followedBy: true })}`;
    const targetFeedIds = Array.from(
      new Set(followers.map((f) => f.targetFeed)),
    );
    const uncachedFollowedByIds = targetFeedIds.filter(
      (id) => !feedCache.has(followedByCacheKey(id)),
    );

    if (uncachedFollowedByIds.length > 0) {
      const feedsWithFollowedBy = await service
        .feeds({ id: uncachedFollowedByIds })
        .get({
          internal: true,
          followedBy: true,
        });
      feedsWithFollowedBy.forEach((feed) => {
        feedCache.set(followedByCacheKey(feed.id), feed);
      });
    }

    for (const follower of followers) {
      // Mesurer le temps des vérifications de feed
      const feedCheckStart = performance.now();
      if (feedContainsActivity.has(follower.targetFeed)) {
        const filterStart = performance.now();
        ignoredTargetFeeds.add(follower.targetFeed);
        timeSpentInFollowersFilter += performance.now() - filterStart;
        timeSpentInFeedChecks += performance.now() - feedCheckStart;
        continue;
      }
      timeSpentInFeedChecks += performance.now() - feedCheckStart;

      // Récupérer les feeds depuis le cache (déjà pré-chargés)
      const cacheAccessStart = performance.now();
      const originFeed = feedCache.get(basicCacheKey(follower.originFeed));
      const targetFeed = feedCache.get(followedByCacheKey(follower.targetFeed));
      timeSpentInPromiseAll += performance.now() - cacheAccessStart;

      let allowedFollow = true;

      // Mesurer le temps des filtres follows
      const filterFollowsStart = performance.now();
      for (const filterFollow of filterFollows) {
        const acceptedFilter = await filterFollow({
          activity,
          targetFeed,
          originFeed,
          follow: follower,
          config,
        });

        if (!acceptedFilter) {
          const filterStart = performance.now();
          ignoredTargetFeeds.add(follower.targetFeed);
          timeSpentInFollowersFilter += performance.now() - filterStart;
          allowedFollow = false;
          break;
        }
      }
      timeSpentInFilterFollows += performance.now() - filterFollowsStart;

      if (allowedFollow) {
        // Mesurer le temps de getActivityMask
        const maskStart = performance.now();
        const mask = await getActivityMask(config, {
          activity,
          targetFeed,
          originFeed,
          follow: follower,
        });
        timeSpentInActivityMask += performance.now() - maskStart;

        // Mesurer le temps d'addActivityToFeed
        const addActivityStart = performance.now();
        await addActivityToFeed(config, { activity, targetFeed, mask });
        timeSpentInAddActivityToFeed += performance.now() - addActivityStart;

        feedContainsActivity.add(follower.targetFeed);
      }
    }

    const nextFollowersStart = performance.now();
    const nextFollowers = [];

    const _followedByCacheKey = (id) =>
      `${id}-${JSON.stringify({ internal: true, followedBy: true })}`;

    for (const follower of followers) {
      if (ignoredTargetFeeds.has(follower.targetFeed)) {
        continue;
      }

      const cachedFeed = feedCache.get(
        _followedByCacheKey(follower.targetFeed),
      );
      if (cachedFeed && cachedFeed.followedBy) {
        nextFollowers.push(...cachedFeed.followedBy);
      }
    }
    followers = nextFollowers;
    timeSpentInNextFollowersLoop += performance.now() - nextFollowersStart;
  }

  const endTime = performance.now();
  const totalTime = endTime - startTime;

  // Affichage des statistiques de performance
  log.info(`
=== ANALYSE DE PERFORMANCE ===
Temps total: ${totalTime.toFixed(2)} ms
Nombre d'itérations: ${totalIterations}

--- Répartition du temps ---
Vérifications feed: ${timeSpentInFeedChecks.toFixed(2)} ms (${((timeSpentInFeedChecks / totalTime) * 100).toFixed(1)}%)
Promise.all (feeds): ${timeSpentInPromiseAll.toFixed(2)} ms (${((timeSpentInPromiseAll / totalTime) * 100).toFixed(1)}%)
Filtres follows: ${timeSpentInFilterFollows.toFixed(2)} ms (${((timeSpentInFilterFollows / totalTime) * 100).toFixed(1)}%)
getActivityMask: ${timeSpentInActivityMask.toFixed(2)} ms (${((timeSpentInActivityMask / totalTime) * 100).toFixed(1)}%)
addActivityToFeed: ${timeSpentInAddActivityToFeed.toFixed(2)} ms (${((timeSpentInAddActivityToFeed / totalTime) * 100).toFixed(1)}%)
Service feed calls: ${timeSpentInFeedService.toFixed(2)} ms (${((timeSpentInFeedService / totalTime) * 100).toFixed(1)}%)
Boucle nextFollowers: ${timeSpentInNextFollowersLoop.toFixed(2)} ms (${((timeSpentInNextFollowersLoop / totalTime) * 100).toFixed(1)}%)
Filtre followers: ${timeSpentInFollowersFilter.toFixed(2)} ms (${((timeSpentInFollowersFilter / totalTime) * 100).toFixed(1)}%)
===============================`);

  return activity;
}

module.exports = add;
