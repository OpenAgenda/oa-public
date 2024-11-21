function _matches(label, fieldLabel) {
  if (!label || !fieldLabel) return false;
  return (
    typeof fieldLabel === 'string'
      ? [fieldLabel]
      : Object.keys(fieldLabel).map((lang) => fieldLabel[lang])
  ).includes(label);
}

export default (items, label) =>
  items.reduce((firstMatchingIndex, item, index) => {
    if (firstMatchingIndex === -1 && _matches(item, label)) {
      return index;
    }
    return firstMatchingIndex;
  }, -1);
