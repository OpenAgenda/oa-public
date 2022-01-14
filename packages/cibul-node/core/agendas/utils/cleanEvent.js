'use strict';

const _ = require('lodash');

const FormSchema = require('@openagenda/form-schemas/iso/FormSchema');

const log = require('@openagenda/logs')('core/agendas/utils/cleanEvent');

const eventSchema = require('@openagenda/event-form/src/schema');
const extractLanguages = require('@openagenda/event-form/build/utils/extractLanguages');
const { BadRequest } = require('@openagenda/verror');

const labels = require('@openagenda/labels/event/form');

const eventFields = eventSchema.eventFields({
  labels
});

const eventFieldNames = eventFields.map(f => f.field);

const invalidLocationUidErrorItem = uid => ({
  field: 'location',
  code: 'invalid',
  message: 'provided location uid is invalid',
  origin: uid,
  step: 'validation'
});

function asArray(obj) {
  return _.keys(obj).map(k => obj[k]).filter(s => !!s);
}

function containsEventData(data) {
  return !!Object.keys(data ?? {}).filter(f => eventFieldNames.includes(f)).length;
}

function distributeCleanData(consolidatedClean, schemaExtensions) {
  const fieldsPerSchema = {
    agenda: schemaExtensions.agenda ? schemaExtensions.agenda.fields.filter(f => f.fieldType && f.fieldType !== 'abstract').map(f => f.field) : [],
    network: schemaExtensions.network ? schemaExtensions.network.fields.filter(f => f.fieldType && f.fieldType !== 'abstract').map(f => f.field) : [],
    event: []
  };

  fieldsPerSchema.event = _.keys(consolidatedClean).filter(field => !fieldsPerSchema.agenda.includes(field) && !fieldsPerSchema.network.includes(field));

  return {
    custom: _.pick(consolidatedClean, fieldsPerSchema.agenda),
    networkCustom: _.pick(consolidatedClean, fieldsPerSchema.network),
    event: _.pick(consolidatedClean, fieldsPerSchema.event)
  };
}

function validateEvent({
  getRoleSlug,
  validateAgendaEvent,
  formSchema,
  networkFormSchema,
  location
}, data, options = {}) {
  const {
    draft,
    partial,
    evaluateEvent,
    event,
    validateWithStoredData,
    defaultLang,
    optionalSecondaryFields,
    paths,
    member,
    access
  } = {
    defaultLang: null,
    evaluateEvent: true,
    event: null,
    validateWithStoredData: false,
    draft: false,
    partial: false,
    optionalSecondaryFields: false,
    paths: null,
    member: null,
    access: 'public',
    ...(typeof options === 'boolean' ? { evaluateEvent: options } : options)
  };

  const schemaExtensions = {
    network: networkFormSchema,
    agenda: formSchema
  };

  // Define which languages should be included. Should depend on
  //  * agenda setting (if set) (not yet coded)
  //  * submitted language keys in languages field
  //  * default language
  const languages = _.get(data, 'languages') || extractLanguages(event ? {
    ...event,
    ...data
  } : data, defaultLang);

  log('processed languages: %j', languages);

  const consolidatedSchema = eventSchema({
    languages,
    schemaExtensions: asArray(schemaExtensions),
    access: {
      write: member ? getRoleSlug(member.role) : access
    },
    includeEventFields: !!evaluateEvent
  });

  const clean = {
    event: null,
    custom: null,
    networkCustom: null,
    agendaEvent: null
  };

  const errors = [];

  // clean consolidated schemas data
  try {
    const validate = new FormSchema(consolidatedSchema, {
      requireLabels: false
    }).getValidate({
      draft
    });

    // update:
    //   event data must be complete and evaluated as such. current data must not be added for validation
    // patch:
    //   event data is partial. current data must be added for validation
    // add:
    //   event data is partial.
    const consolidatedClean = (partial || draft ? validate.part : validate)(validateWithStoredData ? {
      ...event,
      ...data
    } : data);

    if (data?.image?.transformAndUpload) {
      consolidatedClean.image = data.image;
    }

    Object.assign(
      clean,
      distributeCleanData(consolidatedClean, schemaExtensions)
    );
  } catch (consolidatedErrors) {
    if (!_.isArray(consolidatedErrors)) {
      throw consolidatedErrors;
    }

    consolidatedErrors.forEach(err => errors.push(_.set(err, 'step', 'validation')));
  }

  // clean agenda-event data
  try {
    log('evaluating agenda-event reference data');

    clean.agendaEvent = validateAgendaEvent({
      ...data,
      sourcePaths: paths || [],
      userUid: member ? member.userUid : (data.userUid || data.ownerUid)
    }, { optionalSecondaryFields, partial });
  } catch (agendaEventErrors) {
    agendaEventErrors.forEach(err => errors.push(_.set(err, 'step', 'agenda event data validation')));
  }

  // location uid needs to be evaluated in location object
  // as default location values set to prepare location creation could be set
  if (!draft && clean.event && (clean.event.location?.uid || clean.event.locationUid) && !location) {
    errors.push(invalidLocationUidErrorItem(clean.locationUid));
  }

  if (errors.length) {
    throw new BadRequest({
      info: { errors }
    }, 'data is invalid');
  }

  return clean;
}

async function cleanEvent(services, agenda, data, options = {}) {
  const {
    members,
    agendaEvents
  } = services;

  const completeEventData = options.validateWithStoredData ? {
    ...options.event,
    ...data
  } : data;

  const locationUid = _.get(completeEventData, 'location.uid', _.get(completeEventData, 'locationUid'));

  const location = locationUid ? await services.agendaLocations.get({
    uid: locationUid
  }, {
    returnMergeTarget: true,
    deleted: null
  }).catch(e => {
    if (!['BadRequest', 'BadRequestError'].includes(e.name)) {
      throw e;
    }
  }) : null;

  log('fetched agenda %s and location %s', agenda?.uid, location?.uid);

  const pre = locationUid ? { ...data, locationUid } : data;

  if (location) {
    pre.location = location;
  }

  return validateEvent({
    getRoleSlug: members.utils.getRoleSlug,
    formSchema: agenda.formSchema,
    networkFormSchema: _.get(agenda, 'network.formSchema'),
    location,
    validateAgendaEvent: agendaEvents.validate
  }, pre, options);
}

module.exports = cleanEvent;
module.exports.validateEvent = validateEvent;
module.exports.containsEventData = containsEventData;
module.exports.eventFields = eventFields;
