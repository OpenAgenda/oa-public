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
    feeds.push(
      await service.feed(feedToGet).get({
        internal: true,
        followedBy: true,
      }),
    );
  }

  if (!feeds.length) {
    throw new Error('You should choose at least one feed for add activity');
  }

  if (feeds.filter((v) => !v).length) {
    throw new VError(
      {
        info: {
          feeds: feedsToGet,
        },
      },
      "One or more feeds doesn't exist",
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

  // Cache local pour éviter les récupérations répétées de feeds
  const feedCache = new Map();
  let cacheHits = 0;
  let cacheMisses = 0;

  // Fonction helper pour récupérer un feed avec cache
  const getCachedFeed = async (feedIdentifier, options = {}) => {
    const cacheKey = `${feedIdentifier}-${JSON.stringify(options)}`;

    if (feedCache.has(cacheKey)) {
      cacheHits += 1;
      return feedCache.get(cacheKey);
    }

    cacheMisses += 1;
    const feed = await service.feed(feedIdentifier).get(options);
    feedCache.set(cacheKey, feed);
    return feed;
  };

  // Compteurs de performance
  let totalIterations = 0;
  let timeSpentInFeedChecks = 0;
  let timeSpentInPromiseAll = 0;
  let timeSpentInFilterFollows = 0;
  let timeSpentInActivityMask = 0;
  let timeSpentInAddActivityToFeed = 0;
  let timeSpentInNextFollowersLoop = 0;
  let timeSpentInFeedService = 0;
  let timeSpentInFollowersFilter = 0;

  while (followers.length) {
    totalIterations += 1;

    // Set des targetFeed à ignorer pour cette itération
    const ignoredTargetFeeds = new Set();

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

      // Mesurer le temps des appels Promise.all
      const promiseAllStart = performance.now();
      const [originFeed, targetFeed] = await Promise.all([
        getCachedFeed(follower.originFeed, { internal: true }),
        getCachedFeed(follower.targetFeed, { internal: true }),
      ]);
      timeSpentInPromiseAll += performance.now() - promiseAllStart;

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

    // Mesurer le temps de la boucle des nextFollowers
    const nextFollowersStart = performance.now();
    const nextFollowers = [];

    for (const follower of followers) {
      // Ignorer les éléments marqués comme ignorés
      if (ignoredTargetFeeds.has(follower.targetFeed)) {
        continue;
      }

      // Mesurer le temps des appels service.feed
      const feedServiceStart = performance.now();
      const { followedBy } = await getCachedFeed(follower.targetFeed, {
        internal: true,
        followedBy: true,
      });
      timeSpentInFeedService += performance.now() - feedServiceStart;

      nextFollowers.push(...followedBy);
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
Cache hits: ${cacheHits}
Cache misses: ${cacheMisses}
===============================`);

  return activity;
}

module.exports = add;
