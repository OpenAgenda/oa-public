'use strict';

module.exports = (agendaSettings, event) => {
  const { formSchema } = agendaSettings;

  const customFields = formSchema.fields.filter(f => Object.keys(event).find(el => f.field === el) && f.origin === 'custom');

  const customObject = customFields.reduce((acc, field) => {
    if (event[field.field]) {
      acc[field.field] = Boolean(event[field.field][0]);
    }

    return acc;
  }, {});

  return customObject;
};
