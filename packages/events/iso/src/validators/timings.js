'use strict';

const validateDateHoursMinutesTiming = require('./dateHoursMinutesTiming');
const { is: isDateHoursMinutesTiming } = validateDateHoursMinutesTiming;
const validateTiming = require('./timing');

const fZ = n => (`${n}`.length === 1 ? '0' : '') + n;
const DHMToString = t => `${t.date}T${fZ(t.hours)}:${fZ(t.minutes)}`;

module.exports = (options = {}) => dirty => {
  const errors = [];
  const baseError = {
    origin: dirty,
    field: 'timings'
  };

  const timings = options.default && dirty === undefined ? options.default : dirty;

  if (options.optional && !timings) {
    return timings;
  }

  if (!Array.isArray(timings)) {
    throw [{
      ...baseError,
      code: 'timings.invalid',
      message: 'Invalid timings'
    }];
  }

  if (!timings.length) {
    throw [{
      ...baseError,
      code: 'timings.min.1',
      message: 'at least one timing is required'
    }];
  }

  const isDHM = isDateHoursMinutesTiming(timings[0]);
  const validateSingle = isDHM ? validateDateHoursMinutesTiming : validateTiming;
  const cleanTimings = [];

  timings.forEach((timing, index) => {
    try {
      cleanTimings.push(validateSingle(timing));
    } catch(timingErrors) {
      timingErrors.forEach(e => errors.push({ ...e, index }));
    }
  });

  if (errors.length) {
    throw errors;
  }
  
  if (isDHM) {
    return cleanTimings.sort((t1, t2) => DHMToString(t1.begin) < DHMToString(t2.begin) ? -1 : 1);
  }

  return cleanTimings.sort((t1, t2) => t1.begin < t2.begin ? -1 : 1);
}
