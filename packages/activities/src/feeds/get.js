"use strict";

const _ = require( 'lodash' );
const schema = require( '@openagenda/validators/schema' );
const validators = require( '@openagenda/validators' );

const FEED_TYPES = require( '../feedTypes' );

schema.register( {
  choice: validators.choice,
  number: validators.number
} );

module.exports = get;

async function get(config, identifiers, options = {}) {
  const { knex } = config;

  const params = {
    internal: false,
    followed: false,
    followedBy: false,
    ...options,
  };

  const fieldSchema = [
    {
      name: 'id',
      internal: true,
      schema: 'id' in identifiers ? {
        type: 'number',
        optional: false
      } : null,
    },
    {
      name: 'entity_type',
      dataKey: 'entityType',
      schema: !('id' in identifiers) ? {
        type: 'choice',
        options: FEED_TYPES,
        unique: true,
        optional: false
      } : null
    },
    {
      name: 'entity_uid',
      dataKey: 'entityUid',
      schema: !('id' in identifiers) ? {
        type: 'number',
        optional: false
      } : null
    },
  ];

  const dataSchema = fieldSchema.reduce((prev, field) => {
    if (!field.schema) return prev;

    prev[field.dataKey || field.name] = field.schema;

    return prev;
  }, {});

  const validate = schema(dataSchema);

  const data = validate(identifiers);

  const columnToSelect = fieldSchema.reduce((prev, field) => {
    if (!params.internal && field.internal) return prev;

    prev.push((field.table ? `${field.table}.${field.name}` : field.name) + ` as ${field.dataKey || field.name}`);
    return prev;
  }, []);

  if (!params.internal && (params.followed || params.followedBy)) {
    columnToSelect.push('id');
  }

  const where = fieldSchema.reduce((prev, field) => {
    if (!data[field.dataKey || field.name]) return prev;

    prev[field.name] = data[field.dataKey || field.name];
    return prev;
  }, {});

  const feed = await knex(config.schemas.feed).first(columnToSelect).where(where);

  if (feed && params.followed) {
    const follows = await knex(config.schemas.feed_follow).select().where({ target_feed: feed.id });

    feed.followed = follows.map(follow => {
      const mappedFeed = _.mapKeys(follow, (v, k) => _.camelCase(k));
      mappedFeed.store = JSON.parse(mappedFeed.store || '{}');
      return mappedFeed;
    });
  }

  if (feed && params.followedBy) {
    const follows = await knex(config.schemas.feed_follow).select().where({ origin_feed: feed.id });

    feed.followedBy = follows.map(follow => {
      const mappedFeed = _.mapKeys(follow, (v, k) => _.camelCase(k));
      mappedFeed.store = JSON.parse(mappedFeed.store || '{}');
      return mappedFeed;
    });
  }

  if (!feed) return null;

  if (!params.internal && (params.followed || params.followedBy)) {
    return _.omit(feed, 'id');
  }

  return feed;
}
