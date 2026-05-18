import listify from './listify.js';
import cleanParams from './lib/params.js';
import convertToUTFMB3 from './lib/convertToUTFMB3.js';
import errors from './lib/errors.js';
import { emojiReg } from './lib/emojireg.js';
import validateLength from './lib/length.js';

export default (config) => {
  const params = cleanParams(
    'text',
    config,
    {
      field: false, // required
      min: 0,
      max: 1000000,
      trim: true,
      optional: true,
      default: null,
      list: false,
      strict: false,
      emptyStringAsUndefined: true,
      rejectEmojis: false,
      sanitizeEncoding: null,
    },
    config || {},
  );

  const validate = (value) => {
    let clean = [undefined, null].includes(value) ? '' : `${value}`;

    if (typeof value === 'object' && clean) {
      throw errors(params, value, 'string.invalidtype', 'not a string');
    }

    if (value !== undefined && typeof value !== 'string' && params.strict) {
      throw errors(params, value, 'string.invalidtype', 'not a string');
    }

    if (params.trim) {
      clean = clean.trim();
    }

    if (
      value === undefined ||
      value === null ||
      (!clean.length && params.emptyStringAsUndefined)
    ) {
      if (params.optional || ![undefined, null].includes(params.default)) {
        return params.default;
      }
      throw errors(params, value, 'required', 'a string is required');
    }

    validateLength(clean, 'string', params);

    if (params.sanitizeEncoding === 'utf8mb3') {
      clean = convertToUTFMB3(clean);
    }

    if (clean && params.rejectEmojis && emojiReg.test(clean)) {
      throw errors(
        params,
        value,
        'string.invalidHasEmojis',
        'emojis are not accepted',
      );
    }

    return clean;
  };

  const validator = Object.assign(validate, {
    type: 'text',
    field: params.field,
  });

  return params.list ? listify(validator, params) : validator;
};
