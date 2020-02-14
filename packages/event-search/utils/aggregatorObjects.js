'use strict';

module.exports.flatten = (obj, fields = []) => {
  return fields.map(field => [field, obj[field]].join(':'))
    .join('|');
}

module.exports.inflate = key => key.split('|')
  .reduce((obj, fieldValuePair) => {
    const [field, value] = fieldValuePair.split(':');
    return {
      ...obj,
      [field]: value
    }
  }, {});
