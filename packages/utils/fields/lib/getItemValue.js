'use strict';

module.exports = function getItemValue(field, data, currentValue) {
  const itemValue = [field].concat(field.linkedFields ?? []).reduce((acc, f) => {
    if (acc) {
      return acc;
    }

    if (![undefined].includes(data[f.field])) {
      return data[f.field];
    }
    return acc;
  }, undefined);

  if (itemValue === undefined) return currentValue;
  return itemValue;
};
