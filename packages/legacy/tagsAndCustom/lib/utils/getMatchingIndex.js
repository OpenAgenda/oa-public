'use strict';

module.exports = (items, label) => {
  return items.reduce((firstMatchingIndex, item, index) => {
    if (firstMatchingIndex === -1 && _matches(item, label)) {
      return index;
    }
    return firstMatchingIndex;
  }, -1);
}

function _matches(label, fieldLabel) {
  if (!label || !fieldLabel) return false;
  return (
    typeof fieldLabel === 'string' ? [fieldLabel] : Object.keys(fieldLabel).map(lang => fieldLabel[lang])
  ).includes(label);
}
