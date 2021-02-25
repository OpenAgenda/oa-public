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
  const arrayOfValues = [].concat(v);

  for (const index in arrayOfValues) {
    try {
      clean.push(validateSingle(arrayOfValues[index]));
    } catch (e) {
      if (!Array.isArray(e)) {
        throw e;
      } else {
        e.forEach(error => errors.push({ ...error, index }));
      }
    }
  }

  return clean;
}