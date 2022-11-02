const dispatchDataPerSchemas = (data, schemas) => {
  const dispatchedValues = schemas.map(schema => {
    const currentFields = schema.fields.filter(field => field.fieldType !== 'abstract').map(e => e.field);
    const currentValues = currentFields.reduce((prev, curr) => {
      if (data[curr]) return { ...prev, [curr]: data[curr] };
      return prev;
    }, {});
    return currentValues;
  });
  return dispatchedValues;
};

module.exports = dispatchDataPerSchemas;
