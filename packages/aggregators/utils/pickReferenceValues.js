'use strict';

const isAbstract = f => (f.fieldType ?? 'abstract') === 'abstract';

module.exports = (schema, ...values) => values.reduce(
  (picked, next) => ({
    ...picked,
    ...Object.keys(next)
      .filter(field => {
        if (field === 'state') {
          return true;
        }
        return schema.fields.find(f => f.field === field && !isAbstract(f));
      })
      .reduce((accu, field) => ({ ...accu, [field]: next[field] }), {}),
  }),
  {}
);
