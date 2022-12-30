'use strict';

const {
  locationAppendAdditionalValues,
} = require('@openagenda/legacy/tagSetToFormSchema');

module.exports = function convertLocationAdditionalFields(formSchema, event) {
  if (Array.isArray(event)) {
    return event.map(e => convertLocationAdditionalFields(formSchema, e));
  }

  if (!event?.location?.tags) {
    return event;
  }

  const locationFormSchema = formSchema.fields.find(f => f.field === 'location')?.schema;

  return {
    ...event,
    location: locationAppendAdditionalValues(event.location, locationFormSchema),
  };
};
