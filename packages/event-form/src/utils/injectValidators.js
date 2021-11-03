'use strict';

const eventValidators = {
  registration: require('../validators/registration'),
  age: require('../validators/age'),
  accessibility: require('../validators/accessibility'),
  keywords: require('../validators/keywords'),
  timings: require('@openagenda/events/iso/build/validators/timings'),
  location: require('../validators/location'),
  languages: require('../validators/languages'),
  references: require('../validators/references')
}

module.exports = schema => {
  if (!schema.custom) {
    schema.custom = {};
  }
  Object.assign(schema.custom, eventValidators);
}