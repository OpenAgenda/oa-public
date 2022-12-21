import _ from 'lodash';
import ih from 'immutability-helper';

import isSameFormItem from './isSameFormItem';
import getFormItemSlug from './getFormItemSlug';

export default function insertMissingAbstractFields(schema, updatedMerge) {
  return ih(schema ?? { fields: [] }, {
    fields: {
      $set: updatedMerge.fields.map(f => {
        const index = _.findIndex(schema?.fields ?? [], sf => isSameFormItem(f, sf));

        if (index === -1) {
          return {
            slug: getFormItemSlug(f),
            type: 'abstract',
          };
        }

        return schema.fields[index];
      }),
    },
  });
}
