'use strict';

module.exports = function getItemValue(field, data, currentValue) {
  const itemValue = [field].concat(field.linkedFields ?? []).reduce((acc, f) => {
    if (acc) {
      return acc;
    }
    if (data[f.field] !== (undefined || null)) {
      return data[f.field];
    }
    return acc;
  }, undefined);

  if (itemValue === undefined) return currentValue;
  return itemValue;
};
