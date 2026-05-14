import rgx from './regex.js';

const PHONE_REGEX = /^(\+|)([\d\s.-]|\([\d\s]\))+$/;

export default (config = {}) =>
  rgx({
    optional: config?.optional ?? true,
    field: config?.field,
    default: config?.default ?? null,
    regex: PHONE_REGEX,
    error: {
      code: 'phone.invalid',
      message: 'value is not a phone number',
    },
    type: 'phone',
  });
