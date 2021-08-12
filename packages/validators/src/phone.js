import rgx from './regex';

export default config => rgx({
  optional: config ? config.optional : false,
  field: config ? config.field : undefined,
  default: config && 'default' in config ? config.default : null,
  regex: new RegExp('^(\\+|)([\\d\\s\\.\\-]|\\([\\d\\s]\\))+$'),
  error: {
    code: 'phone.invalid',
    message: 'value is not a phone number'
  },
  type: 'phone'
});
