import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _assign from "lodash/assign.js";
import _findIndex from "lodash/findIndex.js";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import ih from 'immutability-helper';
import debug from 'debug';
import { isFieldOptional } from '../FieldPreview/utils.js';
import isSameFormItem from './isSameFormItem.js';
import getFormItemType from './getFormItemType.js';
const log = debug('FormSchemaBuilder/lib/updateSchemaField');
const standardFieldKeys = ['options', 'max', 'min', 'fieldType', 'origin', 'optional', 'field', 'languages', 'read', 'write', 'enableWith', 'optionalWith'];
export default function updateSchemaField(schema, field, updatedFieldValues, parentsMergedSchema) {
  const fieldIndex = _findIndex(schema.fields, sf => isSameFormItem(sf, field));
  if (fieldIndex === -1) {
    throw new Error('Did not find field to update in schema');
  }
  let updatedField = field;
  const isAbstract = getFormItemType(schema.fields[fieldIndex]) === 'abstract';
  if (isAbstract) {
    var _context;
    log('field %s is abstract, updating labels, display and default only', field.field);
    log(updatedField, updatedFieldValues);
    const update = _reduceInstanceProperty(_context = Object.keys(updatedFieldValues)).call(_context, (carry, fieldKey) => {
      if (_includesInstanceProperty(standardFieldKeys).call(standardFieldKeys, fieldKey)) {
        const parentsField = parentsMergedSchema.fields.find(f => f.field === field.field);
        if (fieldKey === 'optional' && isFieldOptional(parentsField)) {
          return _objectSpread(_objectSpread({}, carry), {}, {
            [fieldKey]: {
              $set: updatedFieldValues[fieldKey]
            }
          });
        }
        return carry;
      }
      return _objectSpread(_objectSpread({}, carry), {}, {
        [fieldKey]: {
          $set: updatedFieldValues[fieldKey]
        }
      });
    }, {});
    updatedField = ih(schema.fields[fieldIndex], update);
    log('updateField', updatedField);
  } else {
    updatedField = _assign({}, field, updatedFieldValues);
  }
  return ih(schema, {
    fields: {
      $splice: [[fieldIndex, 1, updatedField]]
    }
  });
}
//# sourceMappingURL=updateSchemaField.js.map