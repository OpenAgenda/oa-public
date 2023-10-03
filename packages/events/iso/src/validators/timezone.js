'use strict';

function isValidTimezone(tz) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = function timezoneValidator({
  default: defaultValue,
}) {
  return value => {
    const errors = [];
    if (!value) {
      return defaultValue;
    }

    if (!isValidTimezone(value)) {
      errors.push({
        code: 'timezone.invalid',
        message: 'Invalid timezone',
        origin: value,
        field: 'timezone',
      });
    }

    if (errors.length) {
      throw errors;
    }

    return value;
  }
}
