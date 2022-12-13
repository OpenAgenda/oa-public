import _ from 'lodash';
import ih from 'immutability-helper';

import isSameFormItem from './isSameFormItem';

export default function insertMissingAbstractFields(schema, updatedMerge) {
  return ih(schema ?? { fields: [] }, {
    fields: {
      $set: updatedMerge.fields.map(f => {
        const fieldIndex = _.findIndex(schema?.fields ?? [], sf => isSameFormItem(f, sf));

        if (fieldIndex === -1) {
          return {
            field: f.field,
            fieldType: 'abstract',
          };
        }

        return schema.fields[fieldIndex];
      }),
    },
  });
}
