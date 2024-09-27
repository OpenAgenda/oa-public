const registration = require('@openagenda/events/iso/build/validators/registration');
const age = require('@openagenda/events/iso/build/validators/age');
const timings = require('@openagenda/events/iso/build/validators/timings');
const longDescription = require('@openagenda/events/iso/build/validators/longDescription');
const enrichedLinks = require('@openagenda/events/iso/build/validators/enrichedLinks');
const accessibility = require('./accessibility');
const keywords = require('./keywords');
const location = require('./location');
const languages = require('./languages');
const events = require('./events');

module.exports = {
  registration,
  age,
  accessibility,
  keywords,
  timings,
  location,
  languages,
  events,
  longDescription,
  enrichedLinks,
};
