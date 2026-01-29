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

export default (params = {}) =>
  (dirty, options = {}) => {
    const { timezone = 'Europe/Paris' } = options?.related ?? {};
    const errors = [];
    const baseError = {
      origin: dirty,
      field: 'timings',
    };

    const timings = params.default && [undefined, null].includes(dirty)
      ? params.default
      : dirty;

    if (params.optional && !timings) {
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

    // relunctantly tolerate 2000 timings
    if (
      params.max
      && timings.length > (params.max === 800 ? 2000 : params.max)
    ) {
      // eslint-disable-next-line no-throw-literal
      throw [
        {
          ...baseError,
          code: 'timings.max',
          message: `maximum authorized number of timings (${params.max}) exceeded: ${timings.length}`,
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
        if (!isDHM && timezone) {
          cleanTimings.push(validateSingle(timing, { timezone }));
        } else {
          cleanTimings.push(validateSingle(timing));
        }
      } catch (timingErrors) {
        timingErrors.forEach((e) =>
          errors.push({
            ...baseError,
            ...e,
            index,
          }));
      }
    });

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
    return sortedCleanTimings;
  };
