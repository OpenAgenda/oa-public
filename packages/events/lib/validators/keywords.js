'use strict';

const multilingual = require('@openagenda/validators/multilingual');

const validate = multilingual({
  max: 255,
  list: true,
  optional: true
});

module.exports = options => value => {
  const clean = validate(value);

  const splitCommas = {};

  Object.keys(clean).forEach(lang => {
    splitCommas[lang] = clean[lang].reduce((carry, value) => carry.concat((value || '').split(',').map(v => v.trim())), []);
  });

  return splitCommas;
}
