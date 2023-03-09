'use strict';

const formatImageLink = ({ filename }) => `https://cibuldev.s3.amazonaws.com/${filename}`;

const isRestricted = ({ read }) => (read ?? []).length;

module.exports = ({ agendaSettings, admin }, event) => {
  const { formSchema, legacy: { customSet } } = agendaSettings;

  const customFields = formSchema.fields
    .filter(f => Object.keys(event).find(el => f.field === el) && f.origin === 'custom')
    .filter(f => !(!admin && isRestricted(f)));

  if (!customFields.length && customSet) {
    customFields.push(...customSet);
  }

  const customObject = customFields.reduce((acc, field) => {
    const key = field.slug || field.field || field.name;

    if (field.fieldType === 'checkbox') {
      acc[key] = Array.isArray(event[key]) ? event[key].length > 0 : Boolean(event[key]);
    }

    if (event[key] && field.fieldType === 'radio') {
      acc[key] = formSchema.fields.find(f => f.field === key).options.find(opt => opt.id === event[key]).value;
    }

    if (![undefined, null].includes(event[key]) && ['text', 'markdown', 'html', 'textarea', 'link', 'image', 'integer', 'number'].includes(field.fieldType)) {
      acc[key] = field.fieldType === 'image' ? formatImageLink(event[key]) : event[key];
    }

    if (field.fieldType === 'boolean') {
      acc[key] = !!event[key];
    }

    return acc;
  }, {});

  return customObject;
};
