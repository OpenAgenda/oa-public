'use strict';

const multilingual = require('@openagenda/validators/multilingual');

const validate = multilingual({
  max: 255,
  list: true,
  optional: true,
});

module.exports = (_options) => (value) => {
  const clean = validate(Array.isArray(value) ? value.join(',') : value);

  const splitCommas = {};

  Object.keys(clean).forEach((lang) => {
    splitCommas[lang] = clean[lang].reduce(
      (carry, keyword) =>
        carry.concat((keyword || '').split(',').map((v) => v.trim())),
      [],
    );
  });

  return splitCommas;
};
