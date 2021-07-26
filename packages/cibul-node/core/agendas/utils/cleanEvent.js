'use strict';

const _ = require('lodash');

const FormSchema = require('@openagenda/form-schemas/iso/FormSchema');

const log = require('@openagenda/logs')('core/agendas/utils/cleanEvent');

const eventSchema = require('@openagenda/event-form/src/schema');
const extractLanguages = require('@openagenda/event-form/build/utils/extractLanguages');
const ValidationError = require('../../utils/ValidationError');

const invalidLocationUidErrorItem = uid => ({
  field: 'location',
  code: 'invalid',
  message: 'provided location uid is invalid',
  origin: uid,
  step: 'validation'
});

async function cleanEvent(services, agenda, data, options = {}) {
  const locationUid = _.get(data, 'location.uid', _.get(data, 'locationUid'));
  const location = locationUid ? await services.agendaLocations.get({
    uid: locationUid
  }, {
    returnMergeTarget: true,
  }).catch(e => {
    if (e.name !== 'BadRequestError') {
      throw e;
    }
  }) : null;
  console.log('location after rec', location);
  log('fetched agenda and location');

  const pre = locationUid ? { ...data, locationUid } : data;

  if (location) {
    pre.location = location;
  }

  return validateEvent(services, {
    formSchema: agenda.formSchema,
    networkFormSchema: _.get(agenda, 'network.formSchema'),
    location
  }, pre, options);
}

function validateEvent(services, { formSchema, networkFormSchema, location }, data, options = {}) {
  const {
    agendaEvents: {
      validate: validateAgendaEvent
    }
  } = services;

  const {
    draft,
    partial,
    evaluateEvent,
    event,
    defaultLang,
    optionalSecondaryFields,
    paths,
    aggregated,
    member,
    access
  } = {
    defaultLang: null,
    evaluateEvent: true,
    event: null,
    draft: false,
    partial: false,
    optionalSecondaryFields: false,
    paths: null,
    aggregated: false,
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
  const languages = _.get(data, 'languages') || extractLanguages(data, defaultLang);

  log('processed languages: %j', languages);

  const consolidatedSchema = eventSchema({
    languages,
    schemaExtensions: _asArray(schemaExtensions),
    access: {
      write: member ? services.members.utils.getRoleSlug(member.role) : access
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

    const consolidatedClean = (partial || draft ? validate.part : validate)(event ? {
      ...event,
      ...data
    } : data);

    if (data?.image?.transformAndUpload) {
      consolidatedClean.image = data.image;
    }

    Object.assign(
      clean,
      _distributeCleanData(consolidatedClean, schemaExtensions)
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
      aggregated,
      sourcePaths: paths || [],
      userUid: member ? member.userUid : (data.userUid || data.ownerUid)
    }, { optionalSecondaryFields, partial });

  } catch (agendaEventErrors) {
    agendaEventErrors.forEach(err => errors.push(_.set(err, 'step', 'agenda event data validation')));
  }

  if (!draft && clean.event && (clean.event.location || clean.event.locationUid) && !location) {
    errors.push(invalidLocationUidErrorItem(clean.locationUid));
  }

  if (errors.length) {
    throw new ValidationError(errors);
  }

  return clean;
}

function _distributeCleanData(consolidatedClean, schemaExtensions) {
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
  }
}

function _consolidatedValidate(schema, data, { draft }) {
  const fs = new FormSchema(schema);
  const validate = fs.getValidate({ draft });
  return validate(data);
}


function _asArray(obj) {
  return _.keys(obj).map(k => obj[k]).filter(s => !!s)
}

module.exports = cleanEvent;
