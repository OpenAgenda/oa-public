import ih from 'immutability-helper';
export default (schema, field, addToEnd) => {
  if (addToEnd) {
    return ih(schema, {
      fields: {
        $splice: [[schema.fields.length, 0, field]]
      }
    });
  }
  return ih(schema, {
    fields: {
      $splice: [[0, 0, field]]
    }
  });
};
//# sourceMappingURL=addSchemaField.js.map