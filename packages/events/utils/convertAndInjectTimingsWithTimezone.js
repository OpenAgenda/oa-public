import moment from 'moment-timezone';

import dateHoursMinutesTiming from '../iso/validators/dateHoursMinutesTiming.js';

import { from as convertDHM } from '../iso/convertDateHoursMinutesTiming.js';

const inLocalTZ = (d, tz) => moment.tz(d, tz).locale('en').toISOString(true);

export default function convertAndInjectTimingsWithTimezone(timings, timezone) {
  if (!timings || !timings.length) {
    return timings;
  }

  return timings.map(({ begin, end }) => {
    const fn = dateHoursMinutesTiming.is({ begin }) ? convertDHM : inLocalTZ;

    return {
      begin: fn(begin, timezone),
      end: fn(end, timezone),
    };
  });
}
