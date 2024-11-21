import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('legacyToFormSchemaDataTransform');

export default ({ schema, tagSet, _categorySet, customSet }, data) => {
  const transformed = {};
  const additionalFields = _.get(schema, 'fields', []).filter(
    (f) => f.fieldType !== 'abstract',
  );

  if (tagSet && _.get(data, 'event.tags', []).length) {
    const pickedTagIds = data.event.tags.map((t) => t.id);

    Object.assign(
      transformed,
      _.get(tagSet, 'groups', []).reduce((transformed1, group) => {
        const groupTransformed = group.tags
          .filter((gt) => pickedTagIds.includes(gt.id)) // we have picked tags
          .map((gt) => gt.schemaOptionId) // keep matching schemaId.optionId pair
          .reduce((groupTransformed1, schemaOptionId) => {
            const [schemaId, optionId] = schemaOptionId.split('.');
            const field = additionalFields
              .filter((f) => f.schemaId === parseInt(schemaId, 10))
              .filter((f) =>
                (f.options || [])
                  .map((o) => o.id)
                  .includes(parseInt(optionId, 10)))
              .pop();

            if (!field) {
              log('warn', 'field not found for tag group %s', group.name);
              return groupTransformed1;
            }

            return {
              ...groupTransformed1,
              [field.field]:
                field.fieldType === 'checkbox'
                  ? (groupTransformed1[field.field] || []).concat(
                    parseInt(optionId, 10),
                  )
                  : parseInt(optionId, 10),
            };
          }, {});

        return {
          ...transformed1,
          ...groupTransformed,
        };
      }, {}),
    );
  }

  if (customSet && data.event.custom) {
    Object.assign(transformed, data.event.custom);
  }

  return transformed;
};
