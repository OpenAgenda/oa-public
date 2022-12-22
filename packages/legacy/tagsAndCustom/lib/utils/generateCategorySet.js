'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const getMatchingIndex = require('./getMatchingIndex');
const extractLabelString = require('./extractLabelString');

const includeTypes = ['radio', 'select'];

function defineCategories(schemaId, currentCategories = [], options = []) {
  return options.map(o => {
    let matchingCategoryIndex = -1;

    const label = extractLabelString(o.label);
    const slug = o.value;
    const schemaOptionId = `${schemaId}.${o.id}`;

    matchingCategoryIndex = _.findIndex(currentCategories, { schemaOptionId });

    if (matchingCategoryIndex === -1) {
      matchingCategoryIndex = getMatchingIndex(currentCategories.map(c => c.label), o.label);
    }

    if (matchingCategoryIndex !== -1) {
      return ih(currentCategories[matchingCategoryIndex], {
        slug: { $set: slug },
        label: { $set: label },
        schemaOptionId: { $set: schemaOptionId },
      });
    }

    return {
      slug,
      label,
      schemaOptionId,
    };
  });
}

module.exports = (schema, currentCategorySet = null) => {
  const field = _.first(schema.fields
    .filter(f => includeTypes.includes(f.fieldType))
    .filter(f => f.origin === 'categories'));

  const messages = field && !field.origin ? [
    `${field.field}: field origin is not set`,
  ] : [];

  if (!field) {
    return {
      set: null,
      messages: ['no category set field was found'],
      fields: [],
    };
  }

  return {
    set: {
      name: extractLabelString(field.label),
      required: !field.optional,
      categories: defineCategories(field.schemaId, _.get(currentCategorySet, 'categories', []), field.options),
    },
    messages,
    fields: [field],
  };
};
