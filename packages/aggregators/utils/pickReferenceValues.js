'use strict';

module.exports = (schema, ...values) => values.reduce(
  (picked, next) => ({
    ...picked,
    ...Object.keys(next)
      .filter(field => {
        if (field === 'state') {
          return true;
        }
        return schema.fields.find(
          f => f.field === field && f.fieldType !== 'abstract'
        );
      })
      .reduce((accu, field) => ({ ...accu, [field]: next[field] }), {}),
  }),
  {}
);
