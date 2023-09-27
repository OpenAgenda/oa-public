'use strict';

const schema = require('@openagenda/validators/schema');
const validators = require('@openagenda/validators');
const log = require('@openagenda/logs')('activities/feeds/create');

const FEED_TYPES = require('../feedTypes');

schema.register({
  choice: validators.choice,
  number: validators.number,
});

module.exports = create;

const fieldsSchema = [
  {
    name: 'entity_type',
    dataKey: 'entityType',
    schema: {
      type: 'choice',
      options: FEED_TYPES,
      unique: true,
      optional: false,
    },
  },
  {
    name: 'entity_uid',
    dataKey: 'entityUid',
    schema: {
      type: 'number',
      optional: false,
    },
  }
];

async function create(config, identifiers, options = {}) {
  const { service, knex } = config;

  const {
    entityType,
    entityUid,
  } = identifiers;

  const dataSchema = fieldsSchema.reduce((prev, field) => {
    if (!field.schema) return prev;

    prev[field.dataKey || field.name] = field.schema;

    return prev;
  }, {});

  const validate = schema(dataSchema);

  const data = validate({
    entityType,
    entityUid,
  });

  try {
    const feed = await service.feed(identifiers).get();

    if (feed) throw new Error('Feed already exists');
  } catch (e) {
    if (e && e.message !== 'Feed doesn\'t exists') {
      throw e;
    }
  }

  const fields = fieldsSchema.reduce((prev, field) => {
    if (!data[field.dataKey || field.name]) return prev;

    prev[field.name] = data[field.dataKey || field.name];
    return prev;
  }, {});

  const ids = await knex(config.schemas.feed).insert(fields);

  const feed = await service.feed(ids[0]).get(options);

  log.info('Feed created (type %s, uid %s)', feed.entityType, feed.entityUid);

  return feed;
}
