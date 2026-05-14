import registration from '@openagenda/events/iso/validators/registration.js';
import age from '@openagenda/events/iso/validators/age.js';
import timings from '@openagenda/events/iso/validators/timings.js';
import longDescription from '@openagenda/events/iso/validators/longDescription.js';
import enrichedLinks from '@openagenda/events/iso/validators/enrichedLinks.js';
import extIds from '@openagenda/utils/validators/extIdsValidator.mjs';
import accessibility from './accessibility.js';
import keywords from './keywords.js';
import location from './location.js';
import languages from './languages.js';
import events from './events.js';

export default {
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
  extIds,
};
