'use strict';

const _ = require('lodash');
const FormSchema = require('@openagenda/form-schemas/iso/FormSchema');
const log = require('@openagenda/logs')('lib/validate');
const stream = require('@openagenda/validators/stream');

const fields = require('./fields');
const timings = require('../iso/src/validators/timings');
const registration = require('../iso/src/validators/registration');
const accessibility = require('../iso/src/validators/accessibility');
const enrichedLinks = require('../iso/src/validators/enrichedLinks');
const references = require('../iso/src/validators/references');
const age = require('../iso/src/validators/age');
const keywords = require('../iso/src/validators/keywords');
const compileForValidation = require('./compileForValidation');
const ValidationError = require('./ValidationError');
const date = require('@openagenda/validators/date');

const eventCustomValidators = {
  timings,
  registration,
  accessibility,
  age,
  stream,
  keywords,
  enrichedLinks,
  references
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
};