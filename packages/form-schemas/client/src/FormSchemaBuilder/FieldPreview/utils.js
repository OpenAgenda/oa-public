import makeLabelGetter from '@openagenda/labels/makeLabelGetter';
import { getLocaleValue } from '@openagenda/intl';

import labels from '../lib/labels';

export const isFieldLinked = field => {
  if (field.enableWith || field.optionalWith) {
    return true;
  }
};

export const isFieldEditable = (field, { isOwn, editableExtensions }) => {
  if (isOwn) {
    return true;
  }

  if (Array.isArray(editableExtensions)) {
    return editableExtensions.includes(field.field);
  }

  return editableExtensions;
};

export const isFieldMultilingual = ({ languages }) => !!Array.isArray(languages);

export const getLabel = makeLabelGetter(labels);

export function getDefaultValueLabel(field, lang) {
  if (field.options) {
    const defaultOption = field.options.find(option => option.id === field.default);
    return getLocaleValue(defaultOption.label, lang);
  }

  if (typeof field.default === 'boolean') {
    if (field.default === true) {
      return getLabel('isSelected', lang);
    }
    return getLabel('notSelected', lang);
  }

  return getLocaleValue(field.default, lang);
}

export function getLinkedField({ field, schema }) {
  let fieldIndex = -1;
  if (field.enableWith && typeof field.enableWith === 'string') {
    fieldIndex = schema.fields.findIndex(el => el.field === field.enableWith);
  } else if (field.enableWith && typeof field.enableWith === 'object') {
    fieldIndex = schema.fields.findIndex(el => el.field === field.enableWith.field);
  } else if (field.optionalWith) {
    fieldIndex = schema.fields.findIndex(el => el.options?.map(obj => obj.id === field.optionalWith.value));
  }

  if (fieldIndex === -1) {
    return null;
  }

  return schema.fields[fieldIndex];
}
