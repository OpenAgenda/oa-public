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

export const isFieldOptional = field => field?.optional ?? true;

export const isFieldDisplayed = field => field?.display ?? true;

export const getLabel = makeLabelGetter(labels);

export function getDefaultValueLabel(field, lang) {
  if (typeof field.default === 'string') {
    return getLocaleValue(field.default, lang);
  }

  if (typeof field.default === 'boolean') {
    if (field.default === true) {
      return getLabel('isSelected', lang);
    }
    return getLabel('notSelected', lang);
  }
  if (Array.isArray(field.default)) {
    if (field.fieldType === 'checkbox') {
      return field.default.map(value => {
        const option = field.options.find(obj => obj.id === value);
        return getLocaleValue(option.label, lang);
      }).join(', ');
    }
  }
  if (field.default !== null && typeof field.default === 'object') {
    return Object.values(field.default).join(', ');
  }

  if (field.options.length) {
    const defaultValue = field.default;
    const specificValuesFromOptions = field.options.find(obj => obj.id === defaultValue);
    return getLocaleValue(specificValuesFromOptions.label, lang);
  }
  return undefined;
}

export function getLinkedField({ field, schema }) {
  const linkType = field.enableWith ? 'enableWith' : 'optionalWith';

  if (!field[linkType]) {
    return null;
  }

  if (typeof field[linkType] === 'string') {
    return schema.fields.find(el => el.field === field[linkType]);
  }

  return schema.fields.find(el => el.field === field[linkType].field);
}

export function getFieldTypeIcon(field) {
  if (field.fieldType === 'languages') {
    return {
      has: false,
    };
  }

  return {
    has: true,
    className: field.fieldType,
  };
}
