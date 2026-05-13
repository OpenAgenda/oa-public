import _ from 'lodash';
import extractLanguages from '@openagenda/event-form/utils/extractLanguages';
import { BadRequest } from '@openagenda/verror';
import validateBySchema from '@openagenda/form-schemas/iso/validateBySchema.js';
import eventSchema from '@openagenda/event-form/schema';
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
    systemValidatePatchDataOnly = false,
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
    access: null,
    excludeSystemFields: true,
  });

  // clean consolidated schemas data
  // Raw multer uploads have a transformAndUpload function and must be
  // excluded from schema validation (size is bytes, not {width,height}).
  // The image will be processed later by processImage.
  const rawImage = data?.image?.transformAndUpload ? data.image : null;
  const dataForValidation = rawImage ? _.omit(data, ['image']) : data;

  try {
    const consolidatedClean = validateBySchema(
      consolidatedSchema,
      dataForValidation,
      {
        bypassAuthorization: access === 'internal',
        access: getWriteAccess(member, access),
        isDraft: validateAsDraft,
        isPatch,
        stored: isPatch ? storedData : undefined,
        defaultLang,
        validateInputOnly: systemValidatePatchDataOnly,
      },
    );

    if (rawImage) {
      consolidatedClean.image = rawImage;
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
