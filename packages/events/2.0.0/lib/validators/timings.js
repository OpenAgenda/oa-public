'use strict';

const validateDateHourMinutesTiming = require('./dateHourMinutesTiming');
const { is: isDateHourMinutesTiming } = validateDateHourMinutesTiming;
const validateTiming = require('./timing');

module.exports = options => timings => {
  const errors = [];
  const baseError = {
    origin: timings,
    field: 'timings'
  };

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

  const validateSingle = isDateHourMinutesTiming(timings[0]) ? validateDateHourMinutesTiming : validateTiming;
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

  return cleanTimings;
}
