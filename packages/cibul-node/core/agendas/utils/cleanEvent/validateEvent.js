import _ from 'lodash';
import extractLanguages from '@openagenda/event-form/build/utils/extractLanguages.js';
import { BadRequest } from '@openagenda/verror';
import FormSchema from '@openagenda/form-schemas/iso/FormSchema.js';
import eventSchema from '@openagenda/event-form/src/schema.js';
import logs from '@openagenda/logs';
import getWriteAccess from './getWriteAccess.js';

const log = logs('core/agendas/utils/cleanEvent/validateEvent');

const evaluateDraft = (currentDraft, dataDraft, eventUid = null) => ({
  draftErrors:
    currentDraft === false && dataDraft === true
      ? [
        {
          field: 'draft',
          code: 'invalid',
          message: 'can no draft un undraft event',
          origin: eventUid,
          step: 'validation',
        },
      ]
      : [],
});

function distributeCleanData(consolidatedClean, schemaExtensions) {
  const fieldsPerSchema = {
    agenda: schemaExtensions.agenda
      ? schemaExtensions.agenda.fields
        .filter((f) => f.fieldType && f.fieldType !== 'abstract')
        .map((f) => f.field)
      : [],
    network: schemaExtensions.network
      ? schemaExtensions.network.fields
        .filter((f) => f.fieldType && f.fieldType !== 'abstract')
        .map((f) => f.field)
      : [],
    event: [],
  };

  fieldsPerSchema.event = _.keys(consolidatedClean).filter(
    (field) =>
      !fieldsPerSchema.agenda.includes(field)
      && !fieldsPerSchema.network.includes(field),
  );

  return {
    custom: _.pick(consolidatedClean, fieldsPerSchema.agenda),
    networkCustom: _.pick(consolidatedClean, fieldsPerSchema.network),
    event: _.pick(consolidatedClean, fieldsPerSchema.event),
  };
}

const invalidLocationUidErrorItem = (uid) => ({
  field: 'location',
  code: 'invalid',
  message: 'provided location uid is invalid',
  origin: uid,
  step: 'validation',
});

function asArray(obj) {
  return _.keys(obj)
    .map((k) => obj[k])
    .filter((s) => !!s);
}

function mergeEventWithPatch(event, patch, { schema, defaultLang }) {
  return schema.fields
    .filter((f) => f.languages)
    .filter(
      (field) =>
        event[field.field] !== undefined || patch[field.field] !== undefined,
    )
    .map((field) => ({
      fieldName: field.field,
      fieldLanguages: field.languages,
      fieldPatch:
        typeof patch[field.field] === 'string'
          ? { [defaultLang]: patch[field.field] }
          : patch[field.field],
    }))
    .reduce(
      (carry, { fieldName, fieldLanguages, fieldPatch }) => {
        const merged = { ...event[fieldName], ...fieldPatch };
        // Filter to only keep languages specified in the field's languages array
        const filtered = fieldLanguages
          ? _.pick(merged, fieldLanguages)
          : merged;

        return {
          ...carry,
          [fieldName]: filtered,
        };
      },
      {
        ...event,
        ...patch,
      },
    );
}

export default function validateEvent(
  { validateAgendaEvent, formSchema, networkFormSchema, location },
  data,
  options = {},
) {
  const {
    validateAsDraft = false,
    isPatch = false,
    storedData = null,
    defaultLang = null,
    optionalSecondaryFields = false,
    isStrictUnpublish = false,
    paths = null,
    member = null,
    access = 'public',
  } = options;

  log('validating event', { isStrictUnpublish });

  const errors = [];
  const clean = {
    event: null,
    custom: null,
    networkCustom: null,
    agendaEvent: null,
  };

  // clean agenda-event data
  try {
    log('evaluating agenda-event reference data');

    clean.agendaEvent = validateAgendaEvent(
      {
        ...data,
        ...paths ? { sourcePaths: paths } : {},
        userUid: member ? member.userUid : data.userUid || data.ownerUid,
      },
      { optionalSecondaryFields, partial: isPatch },
    );
  } catch (agendaEventErrors) {
    agendaEventErrors.forEach((err) =>
      errors.push(_.set(err, 'step', 'agenda event data validation')));
  }

  if (isStrictUnpublish && errors.length) {
    throw new BadRequest({ info: { errors } }, 'data is invalid');
  } else if (isStrictUnpublish) {
    return clean;
  }

  const schemaExtensions = {
    network: networkFormSchema,
    agenda: formSchema,
  };

  const { draftErrors } = evaluateDraft(
    storedData?.draft,
    data.draft,
    storedData?.uid,
  );

  draftErrors.forEach((e) => errors.push(e));

  // Define which languages should be included. Should depend on
  //  * agenda setting (if set) (not yet coded)
  //  * submitted language keys in languages field
  //  * default language
  const languages = data?.languages
    || extractLanguages(
      null,
      { ...storedData, ...data },
      { defaultLanguage: defaultLang },
    );

  log('processed languages: %j', languages);

  const consolidatedSchema = eventSchema({
    languages,
    schemaExtensions: asArray(schemaExtensions),
    access: {
      write: getWriteAccess(member, access),
    },
  });

  // clean consolidated schemas data
  try {
    const validate = new FormSchema(consolidatedSchema, {
      requireLabels: false,
    }).getValidate({
      draft: validateAsDraft,
    });

    // update:
    //   event data must be complete and evaluated as such. current data must not be added for validation
    // patch or add:
    //   event data is partial. current data must be added for validation

    const consolidatedClean = (validateAsDraft ? validate.part : validate)(
      isPatch
        ? mergeEventWithPatch(storedData, data, {
          schema: consolidatedSchema,
          defaultLang,
        })
        : data,
    );

    if (data?.image?.transformAndUpload) {
      consolidatedClean.image = data.image;
    }

    Object.assign(
      clean,
      distributeCleanData(consolidatedClean, schemaExtensions),
    );
  } catch (consolidatedErrors) {
    if (!_.isArray(consolidatedErrors)) {
      throw consolidatedErrors;
    }

    consolidatedErrors.forEach((err) =>
      errors.push(_.set(err, 'step', 'validation')));
  }

  // location uid needs to be evaluated in location object
  // as default location values set to prepare location creation could be set
  if (
    !validateAsDraft
    && clean.event
    && (clean.event.location?.uid || clean.event.locationUid)
    && !location
  ) {
    errors.push(invalidLocationUidErrorItem(clean.locationUid));
  }

  if (errors.length) {
    throw new BadRequest({ info: { errors } }, 'data is invalid');
  }

  return clean;
}
