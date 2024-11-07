import validateDateHoursMinutesTiming from './dateHoursMinutesTiming.js';
import validateTiming from './timing.js';

const { is: isDateHoursMinutesTiming } = validateDateHoursMinutesTiming;

const fZ = (n) => (`${n}`.length === 1 ? '0' : '') + n;
const DHMToString = (t) => `${t.date}T${fZ(t.hours)}:${fZ(t.minutes)}`;

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
        cleanTimings.push(validateSingle(timing));
      } catch (timingErrors) {
        timingErrors.forEach((e) =>
          errors.push({
            ...baseError,
            ...e,
            index,
          }));
      }
    });

    if (errors.length) {
      throw errors;
    }

    if (isDHM) {
      return cleanTimings.sort((t1, t2) =>
        (DHMToString(t1.begin) < DHMToString(t2.begin) ? -1 : 1));
    }

    return cleanTimings.sort((t1, t2) => (t1.begin < t2.begin ? -1 : 1));
  };
