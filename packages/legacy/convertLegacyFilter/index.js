'use strict';

const moment = require('moment-timezone');

module.exports = (legacyFilter, schema = {}, tagSet = {}) => {
  const keys = Object.keys(legacyFilter);
  const convertedQuery = {};

  const tags = (tagSet.groups ?? []).reduce((carry, tagGroup) => (carry.concat(tagGroup.tags.map(tag => {
    const schemaIds = tag.schemaOptionId.split('.');
    return {
      ...tag,
      schemaId: parseInt(schemaIds[0], 10),
      optionId: parseInt(schemaIds[1], 10),
      field: tagGroup.name
    };
  }))), []);

  keys.map(key => {
    switch (key) {
      case 'from':
        convertedQuery.timings = { ...convertedQuery.timings, gte: moment(legacyFilter[key]).tz('Europe/paris').format('YYYY-MM-DDTHH:mm:ss.SSSS[Z]') };
        break;
      case 'to':
        convertedQuery.timings = { ...convertedQuery.timings, lte: moment(legacyFilter[key]).tz('Europe/paris').format('YYYY-MM-DDTHH:mm:ss.SSSS[Z]') };
        break;
      case 'what':
        convertedQuery.search = legacyFilter[key];
        break;
      case 'passed':
      case legacyFilter[key] === 1:
        break;
      case 'location':
        convertedQuery.locationUid = legacyFilter[key];
        break;
      case 'tags': {
        const tag = tags.find(t => t.slug === legacyFilter[key]);
        const schemaField = schema.fields.find(field => field.schemaId === tag.schemaId);

        convertedQuery[schemaField.field] = schemaField.options.find(o => o.id === tag.optionId).id;
        break;
      }
      default:
        return convertedQuery;
    }

    return convertedQuery;
  });

  return convertedQuery;
};
