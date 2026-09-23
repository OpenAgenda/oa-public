import getTimingsSchemaJSONLD from '../timings/getSchemaJSONLD.js';
import {
  getValue as getBeginValue,
  getKey as getBeginKey,
} from '../timings/begin.js';

export function get(event, { defaultTimezone }) {
  return getTimingsSchemaJSONLD(
    event,
    {
      [getBeginKey(event.firstTiming)]: getBeginValue(event.firstTiming),
      end: event.lastTiming.end,
    },
    defaultTimezone,
  );
}

export default (event, options) => ({
  ...event,
  JSONLD: get(event, options),
});
