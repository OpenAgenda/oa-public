'use strict';

const validateDateHourMinutesTiming = require('./dateHourMinutesTiming');
const { is: isDateHourMinutesTiming } = validateDateHourMinutesTiming;
const validateTiming = require('./timing');

const fZ = n => (`${n}`.length === 1 ? '0' : '') + n;
const DHMToString = t => `${t.date}T${fZ(t.hours)}:${fZ(t.minutes)}`;

module.exports = (options = {}) => timings => {
  const errors = [];
  const baseError = {
    origin: timings,
    field: 'timings'
  };

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

  const isDHM = isDateHourMinutesTiming(timings[0]);
  const validateSingle = isDHM ? validateDateHourMinutesTiming : validateTiming;
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
    return cleanTimings.sort((t1, t2) => DHMToString(t1) < DHMToString(t2) ? 1 : -1);
  }

  return cleanTimings.sort((t1, t2) => t1.begin < t2.begin ? -1 : 1);
}
