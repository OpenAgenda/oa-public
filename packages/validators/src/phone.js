import rgx from './regex';

const PHONE_REGEX = /^(\+|)([\d\s.-]|\([\d\s]\))+$/;

export default (config) => rgx({
  optional: config?.optional ?? false,
  field: config?.field,
  default: 'default' in config ? config.default : null,
  regex: PHONE_REGEX,
  error: {
    code: 'phone.invalid',
    message: 'value is not a phone number',
  },
  type: 'phone',
});
