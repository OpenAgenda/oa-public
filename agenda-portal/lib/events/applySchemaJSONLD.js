import _ from 'lodash';
import getTimingsSchemaJSONLD from '../timings/getSchemaJSONLD.js';
import {
  getValue as getBeginValue,
  getKey as getBeginKey,
} from '../timings/begin.js';

export function get(event, { defaultTimezone }) {
  const firstTiming = _.first(event.timings);
  return getTimingsSchemaJSONLD(
    event,
    {
      [getBeginKey(firstTiming)]: getBeginValue(firstTiming),
      end: _.last(event.timings).end,
    },
    defaultTimezone,
  );
}

export default (event, options) => ({
  ...event,
  JSONLD: get(event, options),
});
