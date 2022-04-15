'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');

const extractLabelString = require('./extractLabelString');
const getMatchingIndex = require('./getMatchingIndex');
const legacyAccessType = require('./legacyAccessType');

const includeTypes = ['radio', 'select', 'checkbox', 'multiselect'];
const uniques = ['radio', 'select'];

function defineTags(schemaId, currentTags = [], fieldOptions = [], { lang }) {
  return fieldOptions.map(o => {
    let matchingTagIndex = -1;

    const label = extractLabelString(o.label, lang);
    const slug = o.value;
    const schemaOptionId = `${schemaId}.${o.id}`;

    // attempt match on schemaOptionId
    matchingTagIndex = _.findIndex(currentTags, { schemaOptionId });

    // attempt match on label
    if (matchingTagIndex === -1) {
      matchingTagIndex = getMatchingIndex(currentTags.map(t => t.label), o.label);
    }

    if (matchingTagIndex !== -1) {
      return ih(currentTags[matchingTagIndex], {
        slug: { $set: slug },
        label: { $set: label },
        schemaOptionId: { $set: schemaOptionId }
      });
    }

    return {
      slug,
      label,
      schemaOptionId
    };
  });
}

module.exports = (schema, currentTagSet = null, options = {}) => {
  const {
    lang
  } = options;
  const currentTagGroups = _.get(currentTagSet, 'groups', []);

  const tagSettableFields = schema.fields
    .filter(f => includeTypes.includes(f.fieldType))
    .filter(f => f.origin === 'tags' || !f.origin);

  const messages = tagSettableFields
    .filter(f => !f.origin)
    .map(f => `${f.field}: field origin is not set`);

  const updatedGroups = tagSettableFields.map(f => {
    const index = getMatchingIndex(currentTagGroups.map(g => g.name), f.label);

    return {
      name: extractLabelString(f.label, lang),
      required: !f.optional,
      unique: uniques.includes(f.fieldType),
      access: legacyAccessType(f, 'contributor'),
      tags: defineTags(f.schemaId, index === -1 ? [] : currentTagGroups[index].tags, f.options, options)
    };
  });

  return {
    set: updatedGroups.length ? {
      groups: updatedGroups
    } : null,
    messages,
    fields: tagSettableFields
  };
};
