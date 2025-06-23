import _findIndex from "lodash/findIndex.js";
import ih from 'immutability-helper';
import isSameFormItem from './isSameFormItem.js';
import getFormItemSlug from './getFormItemSlug.js';
export default function insertMissingAbstractFields(schema, updatedMerge) {
  return ih(schema !== null && schema !== void 0 ? schema : {
    fields: []
  }, {
    fields: {
      $set: updatedMerge.fields.map(f => {
        var _schema$fields;
        const index = _findIndex((_schema$fields = schema === null || schema === void 0 ? void 0 : schema.fields) !== null && _schema$fields !== void 0 ? _schema$fields : [], sf => isSameFormItem(f, sf));
        if (index === -1) {
          return {
            field: getFormItemSlug(f),
            slug: getFormItemSlug(f),
            type: 'abstract',
            fieldType: 'abstract'
          };
        }
        return schema.fields[index];
      })
    }
  });
}
//# sourceMappingURL=insertMissingAbstractFields.js.map