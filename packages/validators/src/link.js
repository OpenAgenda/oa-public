import isString from 'lodash/isString';
import isURL from 'validator/lib/isURL';
import listify from './listify';
import emailValidator from './email';
import cleanParams from './lib/params';

const validateEmail = emailValidator();

const isEmail = v => {
  try {
    validateEmail(v);
  } catch (e) {
    return false;
  }

  return true;
};

export default config => {
  const params = cleanParams('link', config, {
    error: {
      code: 'link.invalid',
      message: 'value is not a link',
    },
  });

  const shouldntMatch = [/\s/, /\/:/, /;/];

  const validate = value => {
    const templateError = {
      field: params.field,
      code: 'link.invalid',
      message: 'value is not a link',
    };

    let clean = value;

    const error = [{
      origin: value,
      ...templateError,
    }];

    if (isString(value)) {
      clean = value.trim();
    }

    if ((!value || !value.length) && params.optional) {
      return params.default !== undefined ? params.default : clean;
    }

    if (/^mailto:/.test(clean) && isEmail(clean.replace(/^mailto:/, ''))) {
      return clean;
    }

    const startsWithProtocol = /^((http(s|):|)\/\/|mailto:)/.test(clean);

    if (!startsWithProtocol && isEmail(clean)) throw error;

    // add http:// if link is like www.google.com (protocol missing)
    if (!startsWithProtocol) {
      clean = `http://${clean}`;
    }

    if (clean.indexOf('.') === -1) {
      throw error;
    }

    if (clean.substr(clean.length - 1, 1) === '.') {
      throw error;
    }

    shouldntMatch.forEach(rgx => {
      if (rgx.test(clean)) {
        throw error;
      }
    });

    if (!isURL(clean, {
      allow_protocol_relative_urls: true,
      allow_underscores: true,
    })) {
      throw error;
    }

    return clean;
  };

  validate.type = 'link';
  validate.field = params.field;

  return params.list ? listify(validate, params) : validate;
};
