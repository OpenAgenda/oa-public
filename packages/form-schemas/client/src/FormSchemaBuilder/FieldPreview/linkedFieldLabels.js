import { getLocaleValue } from '@openagenda/intl';

import { getLabel, getLinkedField } from './utils.js';

export function getSummary({ field, lang, schema }) {
  const linkedField = getLinkedField({ field, schema });

  return getLabel(
    'linkedTo',
    {
      fieldName: getLocaleValue(linkedField.label, lang),
    },
    lang,
  );
}

const formatLinkedValue = ({ linkedField, value, lang }) => {
  if (Array.isArray(linkedField?.options)) {
    const matchingOption = linkedField.options.find((o) => o.id === value);
    return matchingOption
      ? getLocaleValue(matchingOption.label, lang)
      : undefined;
  }
  if (linkedField?.fieldType === 'boolean') {
    return getLabel(
      value ? 'fieldConditionalBooleanTrue' : 'fieldConditionalBooleanFalse',
      lang,
    );
  }
  return value === null || value === undefined ? undefined : String(value);
};

export function getSpecificValue({ field, schema, lang, linkType }) {
  if (typeof field[linkType] === 'string') {
    return;
  }

  const linkedField = getLinkedField({ field, schema, linkType });

  return []
    .concat(field[linkType].value)
    .map((value) => formatLinkedValue({ linkedField, value, lang }))
    .filter((l) => !!l)
    .join(', ');
}

export function getDetailed({ field, lang, schema }) {
  const linkType = field.optionalWith ? 'optionalWith' : 'enableWith';
  const linkedField = getLinkedField({ field, schema, linkType });
  const linkedFieldName = getLocaleValue(linkedField.label, lang);
  const specificValue = getSpecificValue({ field, lang, schema, linkType });

  if (typeof field[linkType] === 'string') {
    return getLabel(
      linkType === 'enableWith'
        ? 'enabledWhenLinkedFieldHasValue'
        : 'optionalWhenLinkedFieldHasValue',
      { linkedFieldName },
      lang,
    );
  }

  return getLabel(
    linkType === 'enableWith'
      ? 'enabledWhenLinkedFieldHasSpecificValue'
      : 'optionalWhenLinkedFieldHasSpecificValue',
    { linkedFieldName, specificValue },
    lang,
  );
}
