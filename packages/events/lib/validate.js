'use strict';

const _ = require('lodash');
const FormSchema = require('@openagenda/form-schemas/iso/FormSchema');
const log = require('@openagenda/logs')('lib/validate');
const stream = require('@openagenda/validators/stream');

const fields = require('./fields');
const timings2 = require('./validators/timings');
const registration = require('./validators/registration');
const accessibility = require('./validators/accessibility');
const enrichedLinks = require('./validators/enrichedLinks');
const age = require('./validators/age');
const keywords = require('./validators/keywords');
const compileForValidation = require('./compileForValidation');
const ValidationError = require('./ValidationError');
const date = require('@openagenda/validators/date');

const eventCustomValidators = {
  timings2, registration, accessibility, age, stream, keywords, enrichedLinks
};

const publicFields = fields.filter(f => (f.write || []).includes('public'));

const validate = new FormSchema({
  fields: publicFields,
  custom: eventCustomValidators
}).getValidate();

const draftValidate = new FormSchema({
  fields: publicFields.map(f => ({ ...f, optional: true })),
  custom: eventCustomValidators
}).getValidate();

module.exports = async (data, options = {}) => {
  const {
    isPatch,
    isDraft,
    maxImageSize,
    current
  } = {
    isPatch: false,
    isDraft: false,
    current: null,
    maxImageSize: 20971520, // 20MB
    ...options
  };

  const {
    editedFields,
    compiled
   } = await compileForValidation(current, data, { maxImageSize });

  log('validating %s for %s', isDraft ? 'draft' : 'non-draft', isPatch ? 'patch' : 'create/update');

  try {
    // draft event does not require anything.
    const clean = (isDraft ? draftValidate : validate)(compiled);
    
    return isDraft || isPatch ? editedFields.reduce((patch, field) => ({
        ...patch,
        [field]: clean[field]
      }), {}) : clean;
  } catch (errors) {
    throw new ValidationError(errors);
  }

  return clean;
};