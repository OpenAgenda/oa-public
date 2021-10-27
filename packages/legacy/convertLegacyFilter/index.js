'use strict';

const moment = require('moment-timezone');

module.exports = (legacyFilter, sets = {}) => {
  const keys = Object.keys(legacyFilter);

  const { formSchema, tagSet, categorySet } = sets;

  const convertedQuery = { relative: ['current', 'upcoming'] };

  const tags = (tagSet?.groups ?? []).reduce((carry, tagGroup) => (carry.concat(tagGroup.tags.map(tag => {
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
        delete convertedQuery.relative;
        convertedQuery.timings = { ...convertedQuery.timings, gte: moment(legacyFilter.from).tz('Europe/paris').format('YYYY-MM-DDTHH:mm:ss.SSSS[Z]') };
        break;
      case 'to':
        convertedQuery.timings = { ...convertedQuery.timings, lte: moment(legacyFilter.to).tz('Europe/paris').format('YYYY-MM-DDTHH:mm:ss.SSSS[Z]') };
        break;
      case 'what':
        convertedQuery.search = legacyFilter.what;
        break;
      case 'passed':
        if (legacyFilter.passed === '1') {
          delete convertedQuery.relative;
        }
        if (legacyFilter.passed === '0') {
          convertedQuery.relative = ['current', 'upcoming'];
        }
        break;
      case 'location':
        convertedQuery.locationUid = legacyFilter.location;
        break;
      case 'tags': {
        if (!tagSet && !formSchema) return;

        const tag = Array.isArray(legacyFilter.tags) ? tags.find(t => t.slug === legacyFilter.tags[0]) : tags.find(t => t.slug === legacyFilter.tags);

        if (!tag) return;

        const schemaFields = formSchema.fields.reduce((carry, field) => {
          if (!field.options || field.schemaId !== tag.schemaId) return carry;
          return carry.concat(field.options.map(option => ({
            id: option.id,
            fieldName: field.field
          })));
        }, []);

        const field = schemaFields.find(f => f.id === tag.optionId);
        convertedQuery[field.fieldName] = field.id;
        break;
      }
      case 'category': {
        if (!categorySet && !formSchema) return;
        const category = categorySet.categories.find(cat => cat.slug === legacyFilter.category);

        if (!category) return;
        const schemaFields = formSchema.fields.reduce((carry, field) => {
          if (!field.options && field.origin !== 'categories') return carry;
          return carry.concat(field.options.map(option => ({
            id: option.id,
            value: option.value,
            fieldName: field.field
          })));
        }, []);

        const field = schemaFields.find(f => f.value === category.slug);
        convertedQuery[field.fieldName] = field.id;
        break;
      }
      default:
        return convertedQuery;
    }

    return convertedQuery;
  });

  return convertedQuery;
};
