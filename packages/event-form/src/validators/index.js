'use strict';

module.exports = {
  registration: require('../validators/registration'),
  age: require('@openagenda/events/iso/build/validators/age'),
  accessibility: require('../validators/accessibility'),
  keywords: require('../validators/keywords'),
  timings: require('@openagenda/events/iso/build/validators/timings'),
  location: require('../validators/location'),
  languages: require('../validators/languages'),
  references: require('../validators/references')
}