import { getLocaleValue } from '@openagenda/intl';

import {
  getLabel,
  getLinkedField,
} from './utils';

export function getSummary({
  field,
  lang,
  schema,
}) {
  const linkedField = getLinkedField({ field, schema });

  return getLabel('linkedTo', {
    fieldName: getLocaleValue(linkedField.label, lang),
  }, lang);
}

export function getSpecificValue({ field, schema, lang }) {
  const linkType = field.optionalWith ? 'optionalWith' : 'enableWith';

  if (typeof field[linkType] === 'string') {
    return;
  }

  const linkedField = getLinkedField({ field, schema });

  return [].concat(field[linkType].value).map(value => {
    const matchingOption = linkedField.options.find(o => o.id === value);
    return matchingOption ? getLocaleValue(matchingOption.label, lang) : undefined;
  }).filter(l => !!l).join(', ');
}

export function getDetailed({
  field,
  lang,
  schema,
}) {
  const linkedField = getLinkedField({ field, schema });
  const linkedFieldName = getLocaleValue(linkedField.label, lang);
  const specificValue = getSpecificValue({ field, lang, schema });
  const linkType = field.optionalWith ? 'optionalWith' : 'enableWith';

  if (typeof field[linkType] === 'string') {
    return getLabel(
      linkType === 'enableWith' ? 'enabledWhenLinkedFieldHasValue' : 'optionalWhenLinkedFieldHasValue',
      { linkedFieldName },
      lang,
    );
  }

  return getLabel(
    linkType === 'enableWith' ? 'enabledWhenLinkedFieldHasSpecificValue' : 'optionalWhenLinkedFieldHasSpecificValue',
    { linkedFieldName, specificValue },
    lang,
  );
}
