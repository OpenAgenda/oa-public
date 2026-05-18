import _ from 'lodash';
import multilingual from '@openagenda/validators/multilingual';

const validate = multilingual({
  max: 255,
  list: true,
  optional: true,
});

export default () => (value) => {
  const clean = validate(value);

  const splitCommas = {};

  _.keys(clean).forEach((lang) => {
    splitCommas[lang] = clean[lang].reduce(
      (carry, keyword) =>
        carry.concat((keyword || '').split(',').map((v) => v.trim())),
      [],
    );
  });

  return splitCommas;
};
