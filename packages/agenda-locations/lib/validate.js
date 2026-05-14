import _ from 'lodash';
import ih from 'immutability-helper';

import { BadRequest } from '@openagenda/verror';
import schema from '@openagenda/validators/schema';
import stream from '@openagenda/validators/stream';
import email from '@openagenda/validators/email';
import integer from '@openagenda/validators/integer';
import link from '@openagenda/validators/link';
import longitude from '@openagenda/validators/longitude';
import latitude from '@openagenda/validators/latitude';
import pass from '@openagenda/validators/pass';
import phone from '@openagenda/validators/phone';
import text from '@openagenda/validators/text';
import multilingual from '@openagenda/validators/multilingual';
import choice from '@openagenda/validators/choice';
import boolean from '@openagenda/validators/boolean';
import regex from '@openagenda/validators/regex';
import timezone from '@openagenda/validators/timezone';
import extIdsValidator from '@openagenda/utils/validators/extIdsValidator.mjs';
import addressValidator from '../validators/address.js';
import countryCodeValidator from '../validators/countryCode.js';
import allFields from './fields.js';

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

const fields = allFields
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

const fn = (values, options = {}) => {
  const { isPatch, ignoreImage } = {
    isPatch: false,
    ignoreImage: false,
    ...options,
  };

  const validateFn = ignoreImage && values.image
    ? validate.withoutImageCreditsAndRightsDeps
    : validate;

  try {
    return (
      isPatch ? validateFn.part.bind(null, Object.keys(values)) : validateFn
    )(ignoreImage ? _.omit(values, ['image']) : values);
  } catch (errors) {
    throw new BadRequest({ info: { errors } }, 'data is invalid');
  }
};

fn.isStream = (v) => {
  try {
    validateStream(v);
  } catch (e) {
    return false;
  }
  return true;
};

export default fn;
