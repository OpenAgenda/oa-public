import _findIndex from "lodash/findIndex.js";
import ih from 'immutability-helper';
export default (schema, field) => {
  const fieldIndex = _findIndex(schema.fields, sf => sf.field === field.field);
  return ih(schema, {
    fields: {
      $splice: [[fieldIndex, 1]]
    }
  });
};
//# sourceMappingURL=removeSchemaField.js.map