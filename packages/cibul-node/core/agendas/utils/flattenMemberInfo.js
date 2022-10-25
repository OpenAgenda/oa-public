'use strict';

const memberLabels = require('@openagenda/labels/members');
const exportHeadersLabels = require('@openagenda/labels/contributors/exportHeaders');

const flatten = require('@openagenda/labels/flatten');

const getStateValueLabel = (memberInfo, flattenLabels) => {
  if (memberInfo.invited) return flattenLabels.invited;
  return memberInfo.deletedUser ? flattenLabels.deletedUser : flattenLabels.hasAccount;
};

const getLabel = (label, lang) => {
  if (label.constructor.name === 'Object') return label?.[lang] || Object.values(label)[0];
  return label || null;
};

module.exports = (schema, lang) => {
  const fieldMap = schema.fields.map(e => ({ field: e.field, label: getLabel(e.label), options: e.options || null }));
  const flattenLabels = flatten({ ...memberLabels, ...exportHeadersLabels }, lang);

  return memberInfo => {
    const flattened = {
      [flattenLabels.role]: flattenLabels[memberInfo.role],
      [flattenLabels.state]: getStateValueLabel(memberInfo, flattenLabels),
      [flattenLabels.contributions]: memberInfo.eventCount,
    };

    return fieldMap.reduce((carry, mapItem) => {
      if (mapItem.options?.length) {
        const labels = mapItem.options.filter(e => [].concat(memberInfo[mapItem.field]).includes(e.id)).map(e => getLabel(e.label));
        carry[mapItem.label] = labels.join(' | ');
        return carry;
      }
      carry[mapItem.label] = memberInfo[mapItem.field];
      return carry;
    }, flattened);
  };
};
