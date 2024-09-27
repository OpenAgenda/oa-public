'use strict';

const _ = require('lodash');
const FEED_TYPES = require('./feedTypes');

module.exports = function feed(config, identifiersOrId) {
  const { feeds, activities, notifications } = config.service;

  const identifiers = _.isObject(identifiersOrId)
    ? identifiersOrId
    : { id: identifiersOrId };

  return _.deeply(_.mapValues)(
    Object.assign(feeds(identifiers), {
      activities: activities(identifiers),
      notifications: notifications(identifiers),
    }),
    (v) => {
      if (typeof v !== 'function') return v;

      return (...args) => {
        if (!config) throw new Error('service not initialized');

        if (
          identifiers.entityType
          && !FEED_TYPES.includes(identifiers.entityType)
        ) {
          throw new Error(
            `You cannot use feed of type ${identifiers.entityType}`,
          );
        }

        return v(...args);
      };
    },
  );
};

_.mixin({
  deeply(map) {
    return (obj, fn) =>
      map(
        _.mapValues(obj, (v) =>
          (_.isPlainObject(v) ? _.deeply(map)(v, fn) : v)),
        fn,
      );
  },
});
