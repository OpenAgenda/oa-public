'use strict';

const _ = require('lodash');

module.exports = (formSchema, event) => {

  const extract = extractValueSet.bind(null, formSchema, event);
  const isEventField = f => f.schemaId === null;

  const baseEventValues = extract(isEventField);
  const publicExtendedValues = extract(field => !isEventField(field) && !field.read);
  const adminExtendedValues = extract(field => !isEventField(field) && (field.read || []).includes('administrator'));
  const modExtendedValues = extract(field => !isEventField(field) && (field.read || []).includes('moderator'));

  const stateInAgenda = ['state', 'featured'].reduce(
    (stateInAgenda, stateField) => event[stateField] !== undefined ? {
      ...stateInAgenda,
      [stateField==='state' ? 'code' : stateField] : event[stateField]
    } : stateInAgenda, {});

  return {
    ...baseEventValues,
    custom: publicExtendedValues,
    customAdministrator: adminExtendedValues,
    customModerator: modExtendedValues,
    ...(['agenda', 'location'].reduce(
      (detailedObjects, key) => event[key] ? {...detailedObjects, [key] : event[key]} : detailedObjects,
      {}
    )),
    ...(Object.keys(stateInAgenda).length ? { state : stateInAgenda } : {}),
    contributor: {
      uid: _.get(event, 'member.userUid', null),
      name: _.get(event, 'member.custom.contactName', null)
    }
  }
}

function extractValueSet(formSchema, event, includeFieldEval) {
  return formSchema.fields
    .filter(includeFieldEval)
    .reduce((values, field) => ({
      ...values,
      [field.field]: event[field.field]
    }), {});
}
