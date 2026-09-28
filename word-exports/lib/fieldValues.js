import { getLocaleValue } from '@openagenda/intl';
import { run } from './xml.js';
import linkOrText from './links.js';
import markdownParagraphs from './markdown.js';
import messages from './messages.js';

// The agenda schema, flat: a field of a sub-schema is named `parent.child`.
export function flattenSchemaFields(schema) {
  return (schema?.fields ?? []).flatMap((field) =>
    (field.schema
      ? field.schema.fields.map((f) => ({
        ...f,
        field: `${field.field}.${f.field}`,
      }))
      : [field]));
}

export const isUnset = (value) =>
  value === null
  || value === undefined
  || value === ''
  || (Array.isArray(value) && !value.length)
  || (typeof value === 'object'
    && !Array.isArray(value)
    && !Object.keys(value).length);

// A field's value as Word runs, or null when there is nothing to show. The
// value is read through the schema: option ids become their labels, a
// multilingual text is shown in the export language.
export function fieldValueRuns(writer, field, value, { lang, intl }) {
  if (isUnset(value)) return null;

  if (field.options?.length) {
    const labels = []
      .concat(value)
      .map((id) => field.options.find((option) => option.id === id))
      .filter(Boolean)
      .map((option) => getLocaleValue(option.label, lang));

    return labels.length ? run(labels.join(', ')) : null;
  }

  switch (field.fieldType) {
    case 'boolean':
      return run(intl.formatMessage(value ? messages.yes : messages.no));
    case 'link':
      return linkOrText(writer, getLocaleValue(value, lang));
    case 'email':
      return linkOrText(writer, `mailto:${value}`, value);
    case 'age': {
      const { min, max } = value;
      const hasMin = typeof min === 'number';
      const hasMax = typeof max === 'number';

      if (!hasMin && !hasMax) return null;

      if (hasMin && hasMax) {
        return run(intl.formatMessage(messages.ageRange, { min, max }));
      }

      return run(
        hasMin
          ? intl.formatMessage(messages.ageFrom, { min })
          : intl.formatMessage(messages.ageUpTo, { max }),
      );
    }
    default:
      break;
  }

  const localized = getLocaleValue(value, lang);

  if (typeof localized === 'string' || typeof localized === 'number') {
    return run(String(localized));
  }

  if (
    Array.isArray(localized)
    && localized.every((v) => typeof v === 'string')
  ) {
    return run(localized.join(', '));
  }

  // Structures with no plain reading (files, nested objects) are left out.
  return null;
}

// A markdown field is a block of paragraphs rather than runs.
export function isMarkdownField(field) {
  return ['markdown', 'longDescription'].includes(field.fieldType);
}

export { markdownParagraphs };
