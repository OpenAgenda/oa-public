import moment from 'moment-timezone';

function hasAdditionalFields(schema) {
  return !!schema.fields.filter(f => f.schemaType !== 'event').length
}

function flatLabel(label, lang) {
  if (typeof label === 'string') {
    return label;
  }
  
  return label[lang] ?? label[Object.keys(label).shift()];
}

function formatValue(field, value, { lang, timezone }) {
  if (Array.isArray(value) && value.length === 1 && value[0] === null) {
    return null;
  }

  if (!value) {
    return value;
  }

  // field is multilingual
  if (Array.isArray(field.languages)) {
    return (value?.[lang] ?? value?.[Object.keys(value).shift()]) ?? null;
  }

  // handle all optioned types
  if (field.options) {
    const labels = [].concat(value).map(v => {
      const option = field.options.find(o => o.id === v);
      if (!option) {
        return;
      }
      return flatLabel(option.label, lang);
    });

    return labels.length ? labels : null;
  }

  if (field.fieldType === 'date') {
    return moment.tz(value, timezone).locale(lang).format('dddd D MMMM YYYY');
  }

  if (['image', 'file'].includes(field.fieldType) && value) {
    return {
      link: `https://${(field.store ?? { type: 's3', bucket: 'cibul' }).bucket}.s3.amazonaws.com/${value.filename}`,
      originalName: value.originalName
    };
  }

  return value;
}

function formatAdditionalFieldData(schema, event, lang) {
  const additionalFields = schema.fields
    .filter(f => f.schemaType !== 'event')
    .filter(f => f.fieldType !== 'abstract');

  const timezone = event.timezone ?? (event.location?.timezone ?? 'Europe/Paris');

  return additionalFields.map(field => {
    const value = event[field.field];

    const formattedValue = formatValue(field, value, { lang, timezone });
    const label = flatLabel(field.label, lang);

    return {
      key: field.field,
      field,
      label,
      fieldType: field.fieldType,
      isOptioned: !!field.options,
      value: formattedValue,
      isRestricted: !!field.read,
      raw: value
    }
  });
}

module.exports = {
  hasAdditionalFields,
  formatAdditionalFieldData
}
