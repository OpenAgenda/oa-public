import ValidationError from './ValidationError.js';

function getURLEncoded(sURL) {
  if (decodeURI(sURL) === sURL) return encodeURI(sURL);
  return getURLEncoded(decodeURI(sURL));
}

export default function cleanImageURL(dirty) {
  try {
    return getURLEncoded(dirty);
  } catch (e) {
    throw new ValidationError({
      field: 'image',
      code: 'url.invalid',
      message: 'malformed image url',
    });
  }
}
