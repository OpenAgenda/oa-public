'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');

const { BadRequest } = require('@openagenda/verror');
const schema = require('@openagenda/validators/schema');
const stream = require('@openagenda/validators/stream');
const email = require('@openagenda/validators/email');
const integer = require('@openagenda/validators/integer');
const link = require('@openagenda/validators/link');
const longitude = require('@openagenda/validators/longitude');
const latitude = require('@openagenda/validators/latitude');
const pass = require('@openagenda/validators/pass');
const phone = require('@openagenda/validators/phone');
const text = require('@openagenda/validators/text');
const multilingual = require('@openagenda/validators/multilingual');
const choice = require('@openagenda/validators/choice');
const boolean = require('@openagenda/validators/boolean');
const regex = require('@openagenda/validators/regex');
const timezone = require('@openagenda/validators/timezone');
const extIdsValidator = require('@openagenda/utils/validators/extIdsValidator');
const addressValidator = require('../validators/address');
const countryCodeValidator = require('../validators/countryCode');

schema.register({
  email,
  integer,
  link,
  longitude,
  latitude,
  pass,
  phone,
  text,
  stream,
  multilingual,
  choice,
  boolean,
  regex,
  timezone,
  extIds: extIdsValidator,
  address: addressValidator,
  countryCode: countryCodeValidator,
});

const validateStream = stream({ optional: false });

const fields = require('./fields')
  .filter((field) => field.write.includes('contributor'))
  .reduce(
    (sch, field) => ({
      ...sch,
      [field.field]: {
        ..._.omit(field, ['field', 'db', 'read', 'fieldType']),
        type: field.fieldType,
      },
    }),
    {},
  );

const validate = schema(fields);
validate.withoutImageCreditsAndRightsDeps = schema(
  ih(fields, {
    imageCredits: {
      $unset: ['enableWith'],
    },
    imageRightsAreHeld: {
      $unset: ['enableWith'],
    },
  }),
);

module.exports = (values, options = {}) => {
  const { isPatch, ignoreImage } = {
    isPatch: false,
    ignoreImage: false,
    ...options,
  };

  const fn = ignoreImage && values.image
    ? validate.withoutImageCreditsAndRightsDeps
    : validate;

  try {
    return (isPatch ? fn.part.bind(null, Object.keys(values)) : fn)(
      ignoreImage ? _.omit(values, ['image']) : values,
    );
  } catch (errors) {
    throw new BadRequest({ info: { errors } }, 'data is invalid');
  }
};

module.exports.isStream = (v) => {
  try {
    validateStream(v);
  } catch (e) {
    return false;
  }
  return true;
};
