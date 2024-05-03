import { formatInTimeZone } from 'date-fns-tz';
import { nl2br } from '@openagenda/react-shared';
import { fromMarkdownToHTML } from '@openagenda/md';
import { getLocaleValue } from '@openagenda/intl';
import { FALLBACK_LOCALE } from 'config/constants';

export function hasAdditionalFields(schema) {
  return !!schema.fields.filter(f => f.schemaType !== 'event').length;
}

function formatValue(field, value, { locale, defaultLocale, timezone, dateFnsLocale }) {
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
      return getLocaleValue(option.label, locale, [defaultLocale, FALLBACK_LOCALE]);
    });

    return labels.length ? labels : null;
  }

  if (field.fieldType === 'date') {
    return formatInTimeZone(value, timezone, 'PPPPp', { locale: dateFnsLocale });
  }

  if (field.fieldType === 'markdown' && value) {
    return fromMarkdownToHTML(value);
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

export function formatAdditionalFieldData({ schema, event, locale, defaultLocale, dateFnsLocale }) {
  const additionalFields = schema.fields
    .filter(f => f.schemaType !== 'event')
    .filter(f => f.fieldType !== 'abstract')
    .filter(f => f.type !== 'section');

  const timezone = event.timezone ?? event.location?.timezone ?? 'Europe/Paris';

  return additionalFields.map(field => {
    const value = event[field.field];

    const formattedValue = formatValue(field, value, { locale, defaultLocale, timezone, dateFnsLocale });
    const label = getLocaleValue(field.label, locale, [defaultLocale, FALLBACK_LOCALE]);

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
