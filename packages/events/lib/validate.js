'use strict';

const _ = require('lodash');
const FormSchema = require('@openagenda/form-schemas/iso/FormSchema');
const log = require('@openagenda/logs')('lib/validate');
const stream = require('@openagenda/validators/stream');

const fields = require('./fields');
const timings2 = require('./validators/timings');
const registration = require('./validators/registration');
const accessibility = require('./validators/accessibility');
const age = require('./validators/age');
const keywords = require('./validators/keywords');
const preClean = require('./preValidateClean');

const ValidationError = require('./ValidationError');

const eventCustomValidators = {
  timings2, registration, accessibility, age, stream, keywords
};

const publicFields = fields.filter(f => (f.write || []).includes('public'));
const fieldNames = publicFields.map(f => f.field);

const validate = new FormSchema({
  fields: publicFields,
  custom: eventCustomValidators
}).getValidate();

const fieldsToPatch = data => Object.keys(_.omit(data, ['draft'])).filter(f => fieldNames.includes(f));

module.exports = async (data, options = {}) => {
  const {
    isPatch,
    isDraft,
    maxImageSize
  } = {
    isPatch: false,
    isDraft: false,
    maxImageSize: 20971520, // 20MB
    ...options
  };

  log('validating %s for %s', isDraft ? 'draft' : 'non-draft', isPatch ? 'patch' : 'create/update');

  const fn = isPatch || isDraft ? validate.part.bind(null, fieldsToPatch(data)) : validate;

  let clean;

  try {
    clean = fn(await preClean(data, { maxImageSize }));
  } catch (errors) {
    throw new ValidationError(errors);
  }

  return clean;
};
