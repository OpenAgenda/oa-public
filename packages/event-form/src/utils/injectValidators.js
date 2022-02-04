'use strict';

const eventValidators = require('../validators');

module.exports = schema => {
  if (!schema.custom) {
    schema.custom = {};
  }

  Object.assign(schema.custom, eventValidators);
}