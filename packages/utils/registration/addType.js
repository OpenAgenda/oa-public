'use strict';

const isEmail = require('validator/lib/isEmail');
const isURL = require('validator/lib/isURL');
const isPhone = v => !!v.match(/^(\+|)([\d\s\.\-]|\([\d\s]\))+$/);

const extractType = (value, options = {}) => {
  if (isEmail(value)) {
    return {
      value,
      type: 'email'
    };
  }
  if (isURL(value)) {
    return {
      value,
      type: 'link'
    }
  }
  if (isPhone(value)) {
    return {
      value,
      type: 'phone'
    }
  }

  if (options.unknownIsIgnored) {
    return {
      value,
      type: undefined
    }
  }

  throw new Error('Unknown type');
}

module.exports = (r, options = {}) => {
  if (!(r instanceof Array)) {
    return extractType(r, options);
  }
  const withType = r.map(r => extractType(r, {
    ...options,
    unknownIsIgnored: options.unknownIsIgnored || options.filterUnknown
  }));

  if (!options.filterUnknown) {
    return withType;
  }

  return withType.filter(typed => !!typed.type);
}
