'use strict';

module.exports = (schema, tags = []) => {
  if (!tags || !schema) return null;

  const schemaOptionedFields = (schema ? schema.fields : []).filter(f => !!f.options);

  const options = schemaOptionedFields.reduce((options, field) => {
    return options.concat(field.options.map(o => ({
      id: o.id,
      field: field,
      labels: typeof o.label === 'string' ? [o.label] : Object.keys(o.label).map(l => o.label[l])
    })))
  }, []);

  const matchingOptions = options.filter(o => !!o.labels.filter(l => tags.includes(l)).length);

  return matchingOptions.reduce((values, o) => ({
    ...values,
    [o.field.field]: o.field.fieldType === 'radio' ? o.id : (values[o.field.field] || []).concat(o.id)
  }), {});
}
