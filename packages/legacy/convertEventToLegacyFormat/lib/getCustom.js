'use strict';

module.exports = (agendaSettings, event) => {
  const { formSchema, legacy: { customSet } } = agendaSettings;

  const customFields = formSchema.fields.filter(f => Object.keys(event).find(el => f.field === el) && f.origin === 'custom');

  if (!customFields.length && customSet) {
    customFields.push(...customSet);
  }

  const customObject = customFields.reduce((acc, field) => {
    const key = field.field || field.name;

    if (field.fieldType === 'checkbox') {
      acc[key] = Array.isArray(event[key]) ? event[key].length > 0 : Boolean(event[key]);
    }

    if (event[key] && field.fieldType === 'radio') {
      acc[key] = formSchema.fields.find(f => f.field === key).options.find(opt => opt.id === event[key]).value;
    }

    if (![undefined, null].includes(event[key]) && ['text', 'markdown', 'html'].includes(field.fieldType)) {
      acc[key] = event[key];
    }

    return acc;
  }, {});

  return customObject;
};
