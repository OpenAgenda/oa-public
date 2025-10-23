import moment from 'moment-timezone';

import dateHoursMinutesTiming from '../iso/validators/dateHoursMinutesTiming.js';

import { from as convertDHM } from '../iso/convertDateHoursMinutesTiming.js';

const inLocalTZ = (d, tz, hasExplicitTimezone = false) => {
  if (!(d instanceof Date)) {
    return moment
      .tz(d, 'YYYY-MM-DDTHH:mm:ss.SSS', tz)
      .locale('en')
      .toISOString(true);
  }

  if (hasExplicitTimezone) {
    return moment.tz(d, tz).locale('en').toISOString(true);
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const milliseconds = String(d.getMilliseconds()).padStart(3, '0');
  const localString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  return moment
    .tz(localString, 'YYYY-MM-DDTHH:mm:ss.SSS', tz)
    .locale('en')
    .toISOString(true);
};

const hasExplicitTimezone = (d) => {
  if (d instanceof Date) return true;
  if (typeof d !== 'string') return false;
  // Z, +02:00, -05:30, +0200, +02, .000Z, .000+02:00
  return /(\.\d{3})?([+-]\d{2}:?\d{2}?|Z)$/.test(d);
};

export default function convertAndInjectTimingsWithTimezone(
  timings,
  timezone,
  originalTimings,
) {
  if (!timings || !timings.length) {
    return timings;
  }

  return timings.map(({ begin, end }, index) => {
    const fn = dateHoursMinutesTiming.is({ begin }) ? convertDHM : inLocalTZ;

    const originalTiming = originalTimings?.[index];
    const beginHasExplicitTz = originalTiming
      ? hasExplicitTimezone(originalTiming.begin)
      : false;

    const endHasExplicitTz = originalTiming
      ? hasExplicitTimezone(originalTiming.end)
      : false;

    if (fn === inLocalTZ) {
      return {
        begin: inLocalTZ(begin, timezone, beginHasExplicitTz),
        end: inLocalTZ(end, timezone, endHasExplicitTz),
      };
    }
    return {
      begin: fn(begin, timezone),
      end: fn(end, timezone),
    };
  });
}
