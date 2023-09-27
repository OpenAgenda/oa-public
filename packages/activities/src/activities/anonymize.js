'use strict';

const logs = require('@openagenda/logs');
const log = logs('activities/anonymize');

module.exports = async function anonymize(config, _, identifier, options = {}) {
  log('processing %s', identifier);
  const {
    service,
    knex,
    schemas,
    anonymizedValue = '$__deleted'
  } = config;

  const {
    anonymizeMainField = false
  } = options;

  let lastId = 0;

  while (true) {
    const activity = await knex(schemas.activity)
      .first(['id', 'actor', 'object', 'target', 'store'])
      .where(function() {
        this
          .where('actor', identifier)
          .orWhere('object', identifier)
          .orWhere('target', identifier)
      })
      .where('id', '>', lastId)
      .then(r => r ? {
        ...r,
        store: JSON.parse(r.store)
      } : null);

    if (!activity) {
      break;
    }
    
    const anonymizedField = ['actor', 'object', 'target']
      .map(f => ({
        field: f,
        value: activity[f]
      }))
      .find(({ field, value }) => value === identifier)
      .field;
    
    log('anonymizing activity %s field %s', activity.id, anonymizedField);

    const anonymizedStore = {
      ...activity.store,
      labels: {
        ...activity.store.labels,
        [anonymizedField]: anonymizedValue
      }
    };

    const anonymizedPayload = {
      store: JSON.stringify(anonymizedStore)
    }

    if (anonymizeMainField) {
      anonymizedPayload[anonymizedField] = anonymizedValue;
    }

    await knex(schemas.activity)
      .update(anonymizedPayload)
      .where('id', activity.id);
    
    lastId = activity.id;
  }
}