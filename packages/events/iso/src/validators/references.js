'use strict';


const integerValidator = require('@openagenda/validators/integer');

module.exports = ({ field }) => {
  const validateSingle = integerValidator(field);

  return v => {
    const clean = [];
    const errors = [];
    const arr = [].concat(v);
    for (const index in arr) {
      try {
        clean.push(validateSingle(arr[index]));
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
}