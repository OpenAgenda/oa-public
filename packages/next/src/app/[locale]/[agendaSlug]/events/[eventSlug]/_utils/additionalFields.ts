import { formatInTimeZone } from 'date-fns-tz';
import { nl2br } from '@openagenda/react-shared';
import { fromMarkdownToHTML } from '@openagenda/md';
import { getLocaleValue } from '@openagenda/intl';
import { FALLBACK_LOCALE } from '@/src/config/constants';

export function hasAdditionalFields(schema) {
  return !!schema.fields.filter((f) => f.schemaType !== 'event').length;
}

function formatValue(
  field,
  value,
  { locale, defaultLocale, timezone, dateFnsLocale },
) {
  if (Array.isArray(value) && value.length === 1 && value[0] === null) {
    return null;
  }

  if (!value) {
    return value;
  }

  // field is multilingual
  if (Array.isArray(field.languages)) {
    return value?.[locale] ?? value?.[Object.keys(value)[0]] ?? null;
  }

  // handle all optioned types
  if (field.options) {
    const labels = [].concat(value).map((v) => {
      const option = field.options.find((o) => o.id === v);
      if (!option) {
        return;
      }
      return getLocaleValue(option.label, locale, [
        defaultLocale,
        FALLBACK_LOCALE,
      ]);
    });

    return labels.length ? labels : null;
  }

  if (field.fieldType === 'date') {
    return formatInTimeZone(value, timezone, 'PPPPp', {
      locale: dateFnsLocale,
    });
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
      link: `https://cdn.openagenda.com/${field.store?.bucket ?? 'main'}/${value.filename}`,
    };
  }

  return value;
}

export function formatAdditionalFieldData({
  schema,
  event,
  locale,
  defaultLocale,
  dateFnsLocale,
}) {
  if (!event) {
    return [];
  }
  const additionalFields = schema.fields.filter(
    (f) =>
      !(
        f.schemaType === 'event' ||
        f.fieldType === 'abstract' ||
        f.type === 'section'
      ),
  );

  const timezone = event.timezone ?? event.location?.timezone ?? 'Europe/Paris';

  return additionalFields.map((field) => {
    const formattedValue = field.options
      ? []
          .concat(event[field.field] !== undefined ? event[field.field] : [])
          .filter(
            (v) => !field.options || field.options.some((o) => o.id === v),
          )
          .map((v) =>
            formatValue(field, v, {
              locale,
              defaultLocale,
              timezone,
              dateFnsLocale,
            }),
          )
      : formatValue(field, event[field.field], {
          locale,
          defaultLocale,
          timezone,
          dateFnsLocale,
        });

    const label = getLocaleValue(field.label, locale, [
      defaultLocale,
      FALLBACK_LOCALE,
    ]);

    const hasValue =
      field.fieldType === 'boolean'
        ? formattedValue !== null
        : (field.options && formattedValue.length) || formattedValue;

    return {
      key: field.field,
      field,
      label,
      fieldType: field.fieldType,
      isOptioned: !!field.options,
      value: hasValue ? formattedValue : null,
      isRestricted: !!field.read,
      raw: event[field.field],
    };
  });
}
