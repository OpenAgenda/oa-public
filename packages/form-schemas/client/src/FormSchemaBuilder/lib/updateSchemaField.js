import _ from 'lodash';
import ih from 'immutability-helper';
import debug from 'debug';
import { isFieldOptional } from '../FieldPreview/utils.js';
import isSameFormItem from './isSameFormItem.js';
import getFormItemType from './getFormItemType.js';

const log = debug('FormSchemaBuilder/lib/updateSchemaField');

const standardFieldKeys = [
  'options',
  'max',
  'min',
  'fieldType',
  'origin',
  'optional',
  'field',
  'languages',
  'read',
  'write',
  'enableWith',
  'optionalWith',
];

export default function updateSchemaField(
  schema,
  field,
  updatedFieldValues,
  parentsMergedSchema,
) {
  const fieldIndex = _.findIndex(schema.fields, (sf) =>
    isSameFormItem(sf, field));

  if (fieldIndex === -1) {
    throw new Error('Did not find field to update in schema');
  }

  let updatedField = field;

  const isAbstract = getFormItemType(schema.fields[fieldIndex]) === 'abstract';

  if (isAbstract) {
    log(
      'field %s is abstract, updating labels, display and default only',
      field.field,
    );
    log(updatedField, updatedFieldValues);
    const update = Object.keys(updatedFieldValues).reduce((carry, fieldKey) => {
      if (standardFieldKeys.includes(fieldKey)) {
        const parentsField = parentsMergedSchema.fields.find(
          (f) => f.field === field.field,
        );
        if (fieldKey === 'optional' && isFieldOptional(parentsField)) {
          return {
            ...carry,
            [fieldKey]: {
              $set: updatedFieldValues[fieldKey],
            },
          };
        }
        return carry;
      }
      return {
        ...carry,
        [fieldKey]: {
          $set: updatedFieldValues[fieldKey],
        },
      };
    }, {});

    updatedField = ih(schema.fields[fieldIndex], update);
    log('updateField', updatedField);
  } else {
    updatedField = _.assign({}, field, updatedFieldValues);
  }

  return ih(schema, {
    fields: { $splice: [[fieldIndex, 1, updatedField]] },
  });
}
