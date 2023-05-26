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

  const defaultValue = field.default;

  if (field.options) {
    const specificValuesFromOptions = field.options.find(obj => obj.id === defaultValue);
    return getLocaleValue(specificValuesFromOptions.label, lang);
  }

  return defaultValue;
}

export function getLinkedField(options = {}) {
  const {
    field,
    schema,
  } = options;

  const {
    linkType = field.enableWith ? 'enableWith' : 'optionalWith',
  } = options;

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

export function allowItemDisplayToggle(field) {
  if (!isFieldDisplayed(field)) {
    return true;
  }

  if (isFieldOptional(field)) {
    return true;
  }

  if (![undefined, null].includes(field.default)) {
    return true;
  }

  return false;
}

export const isAccessUndefined = field =>
  !field.read && !field.write;
export function getFieldAccess(field, lang) {
  const multilingual = {
    administrator: getLabel('adminAccess', lang),
    moderator: getLabel('moderatorAccess', lang),
    contributor: getLabel('contributorAccess', lang),
  };

  const writeFieldAccess = field?.write?.map(access => multilingual[access]).join(', ');
  const readFieldAccess = field?.read?.map(access => multilingual[access]).join(', ');

  if (field.write && !field.read) {
    return (
      <>{getLabel('writeAccess', lang)}: {writeFieldAccess}</>
    );
  }
  if (field.read && !field.write) {
    return (
      <>{getLabel('readAccess', lang)}: {readFieldAccess}</>
    );
  }
  if (field.write && field.read) {
    return (
      <>
        <span>{getLabel('readAccess', lang)}: {readFieldAccess}</span>
        <span> / </span>
        <span>{getLabel('writeAccess', lang)}: {writeFieldAccess}</span>
      </>
    );
  }
}
