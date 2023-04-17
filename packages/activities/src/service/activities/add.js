'use strict';

const VError = require('@openagenda/verror');
const schema = require('@openagenda/validators/schema');
const validators = require('@openagenda/validators');
const _ = require('lodash');

schema.register({
  text: validators.text,
  pass: validators.pass,
});

module.exports = add;

function parseArguments(identifiers, data, feedsIdentifiers, cb) {

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
  }, {
    name: 'verb',
    schema: {
      type: 'text',
      max: 255,
      optional: false,
    },
  }, {
    name: 'object',
    schema: {
      type: 'text',
      max: 255,
      optional: true,
    },
  }, {
    name: 'target',
    schema: {
      type: 'text',
      max: 255,
      optional: true,
    },
  }, {
    name: 'store',
    schema: {
      type: 'pass',
      optional: true,
    },
  },
];

async function getActivityMask(config, { activity, targetFeed, originFeed, follow }) {
  const maskFn = config.activities[activity.verb]?.mask;

  return maskFn
    ? await maskFn({ activity, targetFeed, originFeed, follow, config })
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
    await service.feed(targetFeed).notifications.addActivity(_.omit(activity, mask));
  }
}

async function add(config) {
  const { service, knex } = config;

  const args = parseArguments.apply(null, Array.prototype.slice.call(arguments, 1));
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

  const fields = fieldsSchema.reduce((prev, field) => {
    if (!data[field.dataKey || field.name]) return prev;

    prev[field.name] = data[field.dataKey || field.name];
    return prev;
  }, {});

  const feedsToGet = (identifiers ? [identifiers] : []).concat(feedsIdentifiers || []);

  const feeds = [];

  for (const feedToGet of feedsToGet) {
    feeds.push(await service.feed(feedToGet).get({
      internal: true,
      followedBy: true,
    }));
  }

  if (!feeds.length) {
    throw new Error('You should choose at least one feed for add activity');
  }

  if (feeds.filter(v => !v).length) {
    throw new VError({
      info: {
        feeds: feedsToGet
      }
    }, 'One or more feeds doesn\'t exist');
  }

  const [activityId] = await knex(config.schemas.activity).insert(fields);

  const activity = await service.activities.get(activityId);

  const feedContainsActivity = [];

  for (const feed of feeds) {
    const mask = await getActivityMask(config, { activity, targetFeed: feed });
    await addActivityToFeed(config, { activity, targetFeed: feed, mask });
    feedContainsActivity.push(feed);
  }

  let followers = feeds.flatMap(v => v.followedBy);

  const activityConfig = config.activities[activity.verb];
  const filterFollows = activityConfig?.filterFollows ? [].concat(activityConfig.filterFollows) : [];

  while (followers.length) {
    for (const follower of followers) {
      if (feedContainsActivity.some(v => v.targetFeed === follower.targetFeed)) {
        followers = followers.filter(v => v.targetFeed !== follower.targetFeed);
        continue;
      }

      const [originFeed, targetFeed] = await Promise.all([
        service.feed(follower.originFeed).get({ internal: true }),
        service.feed(follower.targetFeed).get({ internal: true }),
      ]);

      let allowedFollow = true;

      for (const filterFollow of filterFollows) {
        const acceptedFilter = await filterFollow({
          activity,
          targetFeed,
          originFeed,
          follow: follower,
          config,
        });

        if (!acceptedFilter) {
          followers = followers.filter(v => v.targetFeed !== follower.targetFeed);
          allowedFollow = false;
          break;
        }
      }

      if (allowedFollow) {
        const mask = await getActivityMask(config, { activity, targetFeed, originFeed, follow: follower });
        await addActivityToFeed(config, { activity, targetFeed, mask });
        feedContainsActivity.push(follower);
      }
    }

    const nextFollowers = [];

    for (const follower of followers) {
      const { followedBy } = await service.feed(follower.targetFeed).get({
        internal: true,
        followedBy: true,
      });

      nextFollowers.push(...followedBy);
    }

    followers = nextFollowers;
  }

  return activity;
};
