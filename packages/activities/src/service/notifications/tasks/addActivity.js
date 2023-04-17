'use strict';

const _ = require('lodash');
const VError = require('@openagenda/verror');
const log = require('@openagenda/logs')('activities/notifications/tasks/addActivity');
const queue = require('@openagenda/queue');

module.exports = config => {
  const q = queue(config.queue.names.addActivity, { redis: config.queue.redis });

  return Object.assign(
    addActivity.bind(null, config),
    { task: task.bind(null, config, q) },
  );
};

function task(config, q, onAdd = null) {
  q.setConsumer(async ({ identifiers, activity }) => {
    try {
      const result = await addActivity(config, identifiers, activity);
      if (onAdd) onAdd(null, result);
    } catch (e) {
      log('error', 'Error in addActivity task:', e);
      if (onAdd) onAdd(e);
    }
  });

  q.launch();

  return {
    shutdown: q.shutdown,
  };
}

function fnOrValue(fnValue, ...params) {
  return typeof fnValue === 'function'
    ? fnValue(...params)
    : fnValue;
}

function getGroupBy(groupBy, feed, activity) {
  if (!groupBy) {
    return null;
  }

  return groupBy
    .map(v => v + ':' + _.get(activity, v))
    .join('|');
}

async function addActivity(config, identifiers, activity, options) {
  const {
    service,
    knex,
    activities,
    enableNotificationsForFeedTypes
  } = config;
  const activityConfig = activities[activity.verb];

  const params = _.merge({
    excludeIds: [],
  }, options);

  const feed = await service.feed(identifiers).get({ internal: true });

  if (feed === null) {
    throw new VError('Feed not found');
  }

  if (!enableNotificationsForFeedTypes?.includes(feed.entityType)) {
    throw new VError(`Feed of type '${feed.entityType}' can't have notifications`);
  }

  // The actor is not notified of his actions
  if (`${feed.entityType}:${feed.entityUid}` === activity.actor) {
    return null;
  }

  // notif groups activities
  const groupBy = fnOrValue(activityConfig?.notifications?.groupBy, { feed, activity });
  const groupedBy = getGroupBy(groupBy, feed, activity);

  const notif = groupedBy
    ? await service.feed(feed).notifications.get({
      feedId: feed.id,
      verb: activity.verb,
      groupBy: groupedBy,
      state: 0,
      sent: 0,
    }, { excludeIds: params.excludeIds })
    : null;

  if (!notif) {
    const store = {
      actor: activity.actor ? [activity.actor] : [],
      object: activity.object ? [activity.object] : [],
      target: activity.target ? [activity.target] : [],
      labels: {
        ...activity.store.labels, // need other groupBy
        actor: activity.store?.labels?.actor,
        object: activity.store?.labels?.object,
        target: activity.store?.labels?.target,
      },
    };

    const additionalProps = _.without(groupBy, 'actor', 'object', 'target')
      .reduce((result, path) => {
        _.set(result, path, _.get(activity, path));
        return result;
      }, {});

    const [id] = await knex(config.schemas.feed_notification).insert({
      feed_id: feed.id,
      verb: activity.verb,
      group_by: groupedBy,
      store: JSON.stringify(_.merge(store, additionalProps.store)),
      updated_at: new Date(),
    });

    return service.feed(feed).notifications.get(id);
  } else {
    const createNewStoreKey = key => {
      const values = Array.from(notif.store[key]);
      const value = activity[key];
      if (!value || values.includes(value)) {
        return values;
      }
      if (values.length >= 100) {
        return { 0: values[0], length: 101 };
      }
      return values.concat(value);
    };

    const store = Object.assign({}, notif.store, {
      actor: createNewStoreKey('actor'),
      object: createNewStoreKey('object'),
      target: createNewStoreKey('target'),
      labels: {
        actor: activity.store?.labels?.actor,
        object: activity.store?.labels?.object,
        target: activity.store?.labels?.target,
      },
    });

    await knex(config.schemas.feed_notification).where({ id: notif.id }).update({
      store: JSON.stringify(store),
      updated_at: new Date(),
    });

    return service.feed(feed).notifications.get(notif.id);
  }
}
