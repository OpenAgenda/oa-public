import moment from 'moment-timezone';
import validateDateHoursMinutesTiming from './dateHoursMinutesTiming.js';
import validateTiming from './timing.js';

const { is: isDateHoursMinutesTiming } = validateDateHoursMinutesTiming;

const fZ = (n) => (`${n}`.length === 1 ? '0' : '') + n;
const DHMToString = (t) => `${t.date}T${fZ(t.hours)}:${fZ(t.minutes)}`;
const toDate = (d, isDHM) => new Date(isDHM ? DHMToString(d) : d);

// Check if two timings overlap
const checkOverlap = (timing1, timing2, isDHM) => {
  if (toDate(timing1.begin, isDHM) >= toDate(timing2.end, isDHM)) {
    return false;
  }
  return toDate(timing1.end, isDHM) > toDate(timing2.begin, isDHM);
};

const hasExplicitTimezone = (d) => {
  if (d instanceof Date) return true;
  if (typeof d !== 'string') return false;
  // Z, +02:00, -05:30, +0200, +02, .000Z, .000+02:00
  return /(\.\d{3})?([+-]\d{2}:?\d{2}?|Z)$/.test(d);
};

const inLocalTZ = (d, tz, explicitTimezone = false) => {
  if (explicitTimezone) {
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

export default (options = {}) =>
  (dirty) => {
    const errors = [];
    const baseError = {
      origin: dirty,
      field: 'timings',
    };

    const timings = options.default && [undefined, null].includes(dirty)
      ? options.default
      : dirty;

    if (options.optional && !timings) {
      return timings;
    }

    if (!Array.isArray(timings)) {
      // eslint-disable-next-line no-throw-literal
      throw [
        {
          ...baseError,
          code: 'timings.invalid',
          message: 'Invalid timings',
        },
      ];
    }

    if (!timings.length) {
      // eslint-disable-next-line no-throw-literal
      throw [
        {
          ...baseError,
          code: 'timings.min.1',
          message: 'at least one timing is required',
        },
      ];
    }

    if (options.max && timings.length > options.max) {
      // eslint-disable-next-line no-throw-literal
      throw [
        {
          ...baseError,
          code: `timings.max.${options.max}`,
          message: `maximum authorized number of timings (${options.max}) exceeded: ${timings.length}`,
        },
      ];
    }

    const isDHM = isDateHoursMinutesTiming(timings[0]);
    const validateSingle = isDHM
      ? validateDateHoursMinutesTiming
      : validateTiming;
    const cleanTimings = [];

    timings.forEach((timing, index) => {
      try {
        if (!isDHM && 'Europe/Paris' /* options.timezone */) {
          const beginHasExplicitTz = timing
            ? hasExplicitTimezone(timing.begin)
            : false;
          const endHasExplicitTz = timing
            ? hasExplicitTimezone(timing.end)
            : false;
          cleanTimings.push(validateSingle({
            begin: inLocalTZ(new Date(timing.begin), 'Europe/Paris' /* options.timezone */, beginHasExplicitTz),
            end: inLocalTZ(new Date(timing.end), 'Europe/Paris' /* options.timezone */, endHasExplicitTz),
          }));
        } else {
          cleanTimings.push(validateSingle(timing));
        }
      } catch (timingErrors) {
        console.log(timingErrors);
        timingErrors.forEach((e) =>
          errors.push({
            ...baseError,
            ...e,
            index,
          }));
      }
    });

    console.log('cleanTimings', cleanTimings);

    // Sort timings first
    const sortedCleanTimings = isDHM
      ? [...cleanTimings].sort((t1, t2) =>
        (DHMToString(t1.begin) < DHMToString(t2.begin) ? -1 : 1))
      : [...cleanTimings].sort((t1, t2) => (t1.begin < t2.begin ? -1 : 1));

    // Check for overlapping timings - only need to check adjacent timings after sorting
    for (let i = 0; i < sortedCleanTimings.length - 1; i++) {
      if (
        checkOverlap(sortedCleanTimings[i], sortedCleanTimings[i + 1], isDHM)
      ) {
        errors.push({
          ...baseError,
          code: 'overlap',
          message: 'timings cannot overlap',
          origin: [sortedCleanTimings[i], sortedCleanTimings[i + 1]],
        });
      }
    }

    if (errors.length) {
      // eslint-disable-next-line no-throw-literal
      throw errors;
    }

    console.log('sortedCleanTimings', sortedCleanTimings);

    return sortedCleanTimings;
  };
