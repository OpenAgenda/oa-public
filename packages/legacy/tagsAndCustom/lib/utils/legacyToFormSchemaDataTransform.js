'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('legacyToFormSchemaDataTransform');

module.exports = ({ schema, tagSet, categorySet, customSet }, data) => {
  const transformed = {};
  const additionalFields = _.get(schema, 'fields', []).filter(f => f.fieldType !== 'abstract');

  if (tagSet && _.get(data, 'event.tags', []).length) {
    const pickedTagIds = data.event.tags.map(t => t.id);

    Object.assign(transformed, _.get(tagSet, 'groups', []).reduce((transformed, group) => {
      const groupTransformed = group.tags
        .filter(gt => pickedTagIds.includes(gt.id)) // we have picked tags
        .map(gt => gt.schemaOptionId) // keep matching schemaId.optionId pair
        .reduce((groupTransformed, schemaOptionId) => {
          const [schemaId, optionId] = schemaOptionId.split('.');
          const field = additionalFields
            .filter(f => f.schemaId === parseInt(schemaId))
            .filter(f => (f.options || []).map(o => o.id).includes(parseInt(optionId)))
            .pop();

          if (!field) {
            log('warn', 'field not found for tag group %s',  group.name);
            return groupTransformed;
          }

          return {
            ...groupTransformed,
            [field.field]: field.fieldType === 'checkbox' ? (groupTransformed[field.field] || []).concat(parseInt(optionId)) : parseInt(optionId)
          }
        }, {});

      return {
        ...transformed,
        ...groupTransformed
      }
    }, {}));
  }

  if (customSet && data.event.custom) {
    Object.assign(transformed, data.event.custom);
  }

  return transformed;
}
