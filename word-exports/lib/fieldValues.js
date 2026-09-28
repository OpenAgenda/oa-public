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

// A multilingual text: an object keyed by language codes only.
export const isMultilingual = (value) =>
  !!value
  && typeof value === 'object'
  && !Array.isArray(value)
  && Object.keys(value).length > 0
  && Object.keys(value).every((key) => /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(key));

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

  if (typeof value === 'string' || typeof value === 'number') {
    return run(String(value));
  }

  // A list of texts, multilingual or not.
  if (Array.isArray(value)) {
    const texts = value
      .map((v) => (isMultilingual(v) ? getLocaleValue(v, lang) : v))
      .filter((v) => typeof v === 'string' || typeof v === 'number');

    return texts.length ? run(texts.join(', ')) : null;
  }

  if (isMultilingual(value)) {
    const text = getLocaleValue(value, lang);

    return typeof text === 'string' && text ? run(text) : null;
  }

  // Structures with no plain reading (files, nested objects) are left out:
  // their first property is a storage key, not something to show.
  return null;
}

// A markdown field is a block of paragraphs rather than runs.
export function isMarkdownField(field) {
  return ['markdown', 'longDescription'].includes(field.fieldType);
}

export { markdownParagraphs };
