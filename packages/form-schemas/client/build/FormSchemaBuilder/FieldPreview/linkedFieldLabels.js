import { getLocaleValue } from '@openagenda/intl';
import { getLabel, getLinkedField } from './utils.js';
export function getSummary(_ref) {
  let {
    field,
    lang,
    schema
  } = _ref;
  const linkedField = getLinkedField({
    field,
    schema
  });
  return getLabel('linkedTo', {
    fieldName: getLocaleValue(linkedField.label, lang)
  }, lang);
}
export function getSpecificValue(_ref2) {
  let {
    field,
    schema,
    lang,
    linkType
  } = _ref2;
  if (typeof field[linkType] === 'string') {
    return;
  }
  const linkedField = getLinkedField({
    field,
    schema,
    linkType
  });
  return [].concat(field[linkType].value).map(value => {
    const matchingOption = linkedField.options.find(o => o.id === value);
    return matchingOption ? getLocaleValue(matchingOption.label, lang) : undefined;
  }).filter(l => !!l).join(', ');
}
export function getDetailed(_ref3) {
  let {
    field,
    lang,
    schema
  } = _ref3;
  const linkType = field.optionalWith ? 'optionalWith' : 'enableWith';
  const linkedField = getLinkedField({
    field,
    schema,
    linkType
  });
  const linkedFieldName = getLocaleValue(linkedField.label, lang);
  const specificValue = getSpecificValue({
    field,
    lang,
    schema,
    linkType
  });
  if (typeof field[linkType] === 'string') {
    return getLabel(linkType === 'enableWith' ? 'enabledWhenLinkedFieldHasValue' : 'optionalWhenLinkedFieldHasValue', {
      linkedFieldName
    }, lang);
  }
  return getLabel(linkType === 'enableWith' ? 'enabledWhenLinkedFieldHasSpecificValue' : 'optionalWhenLinkedFieldHasSpecificValue', {
    linkedFieldName,
    specificValue
  }, lang);
}
//# sourceMappingURL=linkedFieldLabels.js.map