'use strict';

const _ = require('lodash');
const schema = require('@openagenda/validators/schema');
const validators = require('@openagenda/validators');

const FEED_TYPES = require('../feedTypes');

schema.register({
  choice: validators.choice,
  number: validators.number,
  list: validators.list,
});

async function get(config, identifiers, options = {}) {
  const { knex } = config;

  const params = {
    internal: false,
    followed: false,
    followedBy: false,
    ...options,
  };

  const isArrayOfIds = 'id' in identifiers && Array.isArray(identifiers.id);

  const fieldSchema = [
    {
      name: 'id',
      internal: true,
      schema:
        'id' in identifiers
          ? {
            type: isArrayOfIds ? 'list' : 'number',
            ...isArrayOfIds ? { types: ['number'] } : undefined,
            optional: false,
          }
          : null,
    },
    {
      name: 'entity_type',
      dataKey: 'entityType',
      schema: !('id' in identifiers)
        ? {
          type: 'choice',
          options: FEED_TYPES,
          unique: true,
          optional: false,
        }
        : null,
    },
    {
      name: 'entity_uid',
      dataKey: 'entityUid',
      schema: !('id' in identifiers)
        ? {
          type: 'number',
          optional: false,
        }
        : null,
    },
  ];

  const dataSchema = fieldSchema.reduce((prev, field) => {
    if (field.schema) {
      prev[field.dataKey || field.name] = field.schema;
    }
    return prev;
  }, {});

  const validate = schema(dataSchema);
  const data = validate(identifiers);

  const columnToSelect = fieldSchema.reduce((prev, field) => {
    if (!params.internal && field.internal) {
      return prev;
    }
    prev.push(
      `${field.table ? `${field.table}.${field.name}` : field.name} as ${field.dataKey || field.name}`,
    );
    return prev;
  }, []);

  if (!params.internal && (params.followed || params.followedBy)) {
    columnToSelect.push('id');
  }

  const query = knex(config.schemas.feed).select(columnToSelect);
  let feeds;

  if (isArrayOfIds) {
    feeds = await query.whereIn('id', data.id);
  } else {
    const where = fieldSchema.reduce((prev, field) => {
      if (data[field.dataKey || field.name]) {
        prev[field.name] = data[field.dataKey || field.name];
      }
      return prev;
    }, {});
    const feed = await query.first().where(where);
    feeds = feed ? [feed] : [];
  }

  if (_.isEmpty(feeds)) {
    return isArrayOfIds ? [] : null;
  }

  const feedIds = feeds.map((f) => f.id);

  if (params.followed) {
    const follows = await knex(config.schemas.feed_follow)
      .select()
      .whereIn('target_feed', feedIds);

    const followsByTarget = _.groupBy(follows, 'target_feed');

    feeds.forEach((feed) => {
      feed.followed = (followsByTarget[feed.id] || []).map((follow) => {
        const mappedFeed = _.mapKeys(follow, (v, k) => _.camelCase(k));
        mappedFeed.store = JSON.parse(mappedFeed.store || '{}');
        return mappedFeed;
      });
    });
  }

  if (params.followedBy) {
    const follows = await knex(config.schemas.feed_follow)
      .select()
      .whereIn('origin_feed', feedIds);

    const followsByOrigin = _.groupBy(follows, 'origin_feed');

    feeds.forEach((feed) => {
      feed.followedBy = (followsByOrigin[feed.id] || []).map((follow) => {
        const mappedFeed = _.mapKeys(follow, (v, k) => _.camelCase(k));
        mappedFeed.store = JSON.parse(mappedFeed.store || '{}');
        return mappedFeed;
      });
    });
  }

  if (!params.internal && (params.followed || params.followedBy)) {
    const result = feeds.map((feed) => _.omit(feed, 'id'));
    return isArrayOfIds ? result : result[0];
  }

  return isArrayOfIds ? feeds : feeds[0];
}

module.exports = get;
