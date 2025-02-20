'use strict';

const schema = require('@openagenda/validators/schema');
const link = require('@openagenda/validators/link');
const pass = require('@openagenda/validators/pass');
schema.register({
  link,
  pass
});
const validateSingle = schema({
  link: {
    type: 'link',
    optional: false
  },
  data: {
    type: 'pass'
  }
});
module.exports = _ref => {
  let {
    field: _field
  } = _ref;
  return v => {
    const clean = [];
    const errors = [];
    const arrayOfValues = [].concat(v).filter(v1 => v1 !== undefined);
    for (const index in arrayOfValues) {
      if (!Object.hasOwn(arrayOfValues, index)) {
        continue;
      }
      try {
        const cleanSingle = validateSingle(arrayOfValues[index]);
        if (cleanSingle.data === undefined) {
          delete cleanSingle.data;
        }
        clean.push(cleanSingle);
      } catch (e) {
        if (!Array.isArray(e)) {
          throw e;
        } else {
          e.forEach(error => errors.push({
            ...error,
            index
          }));
        }
      }
    }
    if (errors.length) throw errors;
    return clean;
  };
};
//# sourceMappingURL=enrichedLinks.js.map