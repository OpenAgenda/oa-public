import getLabels from './getLabels.js';
import getSchemaJSONLD from './getSchemaJSONLD.js';
import links from './links.js';

export default function detailedTiming({ event, req }, timing, locale = 'en') {
  const { defaultTimezone } = req?.app?.locals ?? {};
  const timezone = event.timezone || event.location.timezone || defaultTimezone;

  return {
    ...timing,
    labels: getLabels(timing, timezone, locale),
    JSONLD: getSchemaJSONLD(event, timing, defaultTimezone),
    ...links({ event, req }, timing),
  };
}
