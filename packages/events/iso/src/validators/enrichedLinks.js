'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  link: require('@openagenda/validators/link'),
  pass: require('@openagenda/validators/pass')
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

module.exports = ({ field }) => v => {
  const clean = [];
  const errors = [];
  const arrayOfValues = [].concat(v).filter(v => v !== undefined);

  for (const index in arrayOfValues) {
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
        e.forEach(error => errors.push({ ...error, index }));
      }
    }
  }

  if (errors.length) throw errors;

  return clean;
}