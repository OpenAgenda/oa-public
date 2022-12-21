'use strict';

const moment = require('moment-timezone');

const flattenTagSet = require('../utils/flattenTagSet');

module.exports = (legacyFilter, options = {}) => {
  const keys = Object.keys(legacyFilter);

  const {
    formSchema,
    tagSet,
    categorySet,
    query = {},
  } = options;

  const convertedQuery = {};

  if (!['timings', 'relative', 'date', 'slug'].some(k => Object.keys(query).includes(k))) {
    convertedQuery.relative = ['current', 'upcoming'];
  }

  const tags = flattenTagSet(tagSet, formSchema);

  keys.map(key => {
    switch (key) {
      case 'from': {
        delete convertedQuery.relative;
        const date = moment(legacyFilter.from)
          .tz('Europe/paris')
          .hour(0)
          .minute(0)
          .second(0)
          .format();
        convertedQuery.timings = { ...convertedQuery.timings, gte: date };
        break;
      }
      case 'to': {
        const date = moment(legacyFilter.to)
          .tz('Europe/paris')
          .hour(23)
          .minute(59)
          .second(59)
          .format();
        convertedQuery.timings = { ...convertedQuery.timings, lte: date };
        break;
      }
      case 'what':
        if (legacyFilter.scope) break;
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
      case 'scope':
        convertedQuery[legacyFilter.scope] = legacyFilter.what;
        break;
      case 'uids':
        convertedQuery.uid = legacyFilter.uids;
        delete convertedQuery.relative;
        break;
      case 'slug':
        convertedQuery.slug = legacyFilter.slug;
        delete convertedQuery.relative;
        break;
      case 'featured':
        convertedQuery.featured = legacyFilter.featured;
        break;
      case 'tags': {
        if (!tagSet && !formSchema) return;
        const filterTags = [].concat(legacyFilter.tags);

        const match = tags.filter(tag => filterTags.some(f => f === tag.slug));

        if (!match.length) return;

        const tagObject = match.reduce((carry, tag) => {
          carry[tag.fieldSlug] = carry[tag.fieldSlug] ? [...carry[tag.fieldSlug], tag.optionId] : [tag.optionId];
          return carry;
        }, {});

        Object.assign(convertedQuery, tagObject);
        break;
      }
      case 'category': {
        if (!categorySet && !formSchema) return;
        const categoryFilter = [].concat(legacyFilter?.category ?? []);

        const categories = categorySet.categories.filter(cat => categoryFilter.some(c => c === cat.slug));

        if (!categories.length) return;

        const flattenedFields = formSchema.fields.reduce((carry, field) => {
          if (field.origin === 'categories') {
            return carry.concat(field.options.map(option => ({
              id: option.id,
              value: option.value,
              fieldName: field.field,
            })));
          }
          return carry;
        }, []);

        const categoryObject = flattenedFields
          .filter(f => categories.some(c => f.value === c.slug))
          .reduce((carry, field) => {
            carry[field.fieldName] = carry[field.fieldName] ? [...carry[field.fieldName], field.id] : [field.id];
            return carry;
          }, {});

        Object.assign(convertedQuery, categoryObject);
        break;
      }
      default:
        return convertedQuery;
    }

    return convertedQuery;
  });

  return convertedQuery;
};
