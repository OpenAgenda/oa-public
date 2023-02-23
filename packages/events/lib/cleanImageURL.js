'use strict';

const ValidationError = require('./ValidationError');

function getURLEncoded(sURL) {
  if (decodeURI(sURL) === sURL) return encodeURI(sURL)
  return getURLEncoded(decodeURI(sURL))
}

module.exports = function cleanImageURL(dirty) {
  try {
    return getURLEncoded(dirty)
  } catch (e) {
    throw new ValidationError({
      field: 'image',
      code: 'url.invalid',
      message: 'malformed image url',
    });
  }
}
