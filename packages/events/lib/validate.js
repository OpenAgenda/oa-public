import FormSchema from '@openagenda/form-schemas/iso/FormSchema.js';
import logs from '@openagenda/logs';
import stream from '@openagenda/validators/stream';
import extIdsValidator from '@openagenda/utils/validators/extIdsValidator.mjs';

import timings from '../iso/validators/timings.js';
import registration from '../iso/validators/registration.js';
import accessibility from '../iso/validators/accessibility.js';
import enrichedLinks from '../iso/validators/enrichedLinks.js';
import longDescription from '../iso/validators/longDescription.js';
import description from '../iso/validators/description.js';
import timezone from '../iso/validators/timezone.js';
import age from '../iso/validators/age.js';
import keywords from '../iso/validators/keywords.js';

import fields from './fields.js';
import compileForValidation from './compileForValidation.js';
import ValidationError from './ValidationError.js';

const log = logs('lib/validate');

const eventCustomValidators = {
  timings,
  registration,
  accessibility,
  age,
  stream,
  keywords,
  enrichedLinks,
  timezone,
  longDescription,
  description,
  extIds: extIdsValidator,
};

const publicFields = fields.filter((f) => (f.write || []).includes('public'));

const validate = {
  protected: new FormSchema({
    fields: publicFields,
    custom: eventCustomValidators,
  }).getValidate(),
  unprotected: new FormSchema({
    fields,
    custom: eventCustomValidators,
  }).getValidate(),
};

const draftValidate = {
  protected: new FormSchema({
    fields: publicFields.map((f) => ({ ...f, optional: true })),
    custom: eventCustomValidators,
  }).getValidate(),
  unprotected: new FormSchema({
    fields: fields.map((f) => ({ ...f, optional: true })),
    custom: eventCustomValidators,
  }).getValidate(),
};

export default async (data, options = {}) => {
  const {
    isPatch = false,
    isDraft = false,
    current = null,
    maxImageSize = 20971520, // 20MB
    protected: protectedMode = true,
    mergeExtIds = true,
  } = options;

  const { editedFields, compiled } = await compileForValidation(current, data, {
    maxImageSize,
    protectedMode,
    isPatch,
    mergeExtIds,
  });

  log(
    'validating %s for %s',
    isDraft ? 'draft' : 'non-draft',
    isPatch ? 'patch' : 'create/update',
  );

  try {
    // draft event does not require anything.
    const clean = (isDraft ? draftValidate : validate)[
      protectedMode ? 'protected' : 'unprotected'
    ](compiled);

    return isDraft || isPatch
      ? editedFields.reduce(
        (patch, field) => ({
          ...patch,
          [field]: clean[field],
        }),
        {},
      )
      : clean;
  } catch (errors) {
    throw new ValidationError(errors);
  }
};
