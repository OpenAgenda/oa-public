'use strict';

const _ = require('lodash');
const schema = require('@openagenda/validators/schema');
const validators = require('@openagenda/validators');
const applyMask = require('./utils/applyMask');

schema.register({
  number: validators.number,
});

const fieldsSchema = [
  {
    name: 'id',
    schema: {
      type: 'number',
      optional: false,
    },
  }, {
    name: 'actor',
  }, {
    name: 'verb',
  }, {
    name: 'object',
  }, {
    name: 'target',
  }, {
    name: 'store',
  }, {
    name: 'created_at',
    dataKey: 'createdAt',
  }, {
    name: 'updated_at',
    dataKey: 'updatedAt',
  },
];

module.exports = async function get(config, feedIdentifiers, activityId) {

  const { service, knex } = config;

  const dataSchema = fieldsSchema.reduce((prev, field) => {
    if (!field.schema) return prev;

    prev[field.dataKey || field.name] = field.schema;

    return prev;
  }, {});

  const validate = schema(dataSchema);

  const data = validate({
    id: activityId,
  });

  const columnToSelect = fieldsSchema.reduce((prev, field) => {
    // if ( !params.internal && field.internal ) return prev;

    prev.push((field.table ? `${field.table}.${field.name}` : field.name) + ` as ${field.dataKey || field.name}`);
    return prev;
  }, []);

  const where = fieldsSchema.reduce((prev, field) => {
    if (!data[field.dataKey || field.name]) return prev;

    prev[field.name] = data[field.dataKey || field.name];
    return prev;
  }, {});

  const feed = feedIdentifiers
    ? await service.feed(feedIdentifiers).get({ internal: true })
    : undefined;

  const request = knex(config.schemas.activity).first(columnToSelect).where(where);

  if (feed) {
    request.join(
      config.schemas.feed_activity,
      config.schemas.feed_activity + '.activity_id',
      config.schemas.activity + '.id',
    )
      .select(`${config.schemas.feed_activity}.mask`);
  }

  const activity = await request;

  if (!activity) {
    throw new Error('Activity doesn\'t exists');
  }

  activity.store = JSON.parse(activity.store);

  return applyMask(activity);
};
