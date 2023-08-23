import { formatInTimeZone } from 'date-fns-tz';
import { nl2br, markdownToHTML } from '@openagenda/react-shared';

export function hasAdditionalFields(schema) {
  return !!schema.fields.filter(f => f.schemaType !== 'event').length;
}

function flatLabel(label, locale) {
  if (typeof label === 'string') {
    return label;
  }

  return label[locale] ?? label[Object.keys(label)[0]];
}

function formatValue(field, value, { locale, timezone, dateFnsLocale }) {
  if (Array.isArray(value) && value.length === 1 && value[0] === null) {
    return null;
  }

  if (!value) {
    return value;
  }

  // field is multilingual
  if (Array.isArray(field.languages)) {
    return (value?.[locale] ?? value?.[Object.keys(value)[0]]) ?? null;
  }

  // handle all optioned types
  if (field.options) {
    const labels = [].concat(value).map(v => {
      const option = field.options.find(o => o.id === v);
      if (!option) {
        return;
      }
      return flatLabel(option.label, locale);
    });

    return labels.length ? labels : null;
  }

  if (field.fieldType === 'date') {
    return formatInTimeZone(value, timezone, 'PPPPp', { locale: dateFnsLocale });
  }

  if (field.fieldType === 'markdown' && value) {
    return markdownToHTML(value);
  }

  if (['textarea'].includes(field.fieldType) && value) {
    return nl2br(value);
  }

  if (['image', 'file'].includes(field.fieldType) && value) {
    return {
      ...value,
      link: `https://${(field.store ?? { type: 's3', bucket: 'cibul' }).bucket}.s3.amazonaws.com/${value.filename}`,
    };
  }

  return value;
}

export function formatAdditionalFieldData(schema, event, locale, dateFnsLocale) {
  const additionalFields = schema.fields
    .filter(f => f.schemaType !== 'event')
    .filter(f => f.fieldType !== 'abstract');

  const timezone = event.timezone ?? event.location?.timezone ?? 'Europe/Paris';

  return additionalFields.map(field => {
    const value = event[field.field];

    const formattedValue = formatValue(field, value, { locale, timezone, dateFnsLocale });
    const label = flatLabel(field.label, locale);

    return {
      key: field.field,
      field,
      label,
      fieldType: field.fieldType,
      isOptioned: !!field.options,
      value: formattedValue,
      isRestricted: !!field.read,
      raw: value,
    };
  });
}
