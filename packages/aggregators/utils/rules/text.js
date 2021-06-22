'use strict';

const evaluateFieldData = (filterValue, fieldData, caseSensitive) => {
  const items = fieldData?.constructor.name === 'Object'
    ? Object.keys(fieldData).reduce(
      (carry, key) => carry.concat(fieldData[key]),
      []
    )
    : [].concat(fieldData);
  for (const item of items) {
    if (
      caseSensitive
        ? item.toUpperCase().search(filterValue) !== -1
        : item.search(filterValue) !== -1
    ) {
      return true;
    }
  }
  return false;
};

module.exports = (filter, data) => {
  if (filter?.caseSensitive) {
    for (const field of Object.keys(filter).filter(
      e => e !== 'caseSensitive'
    )) {
      if (evaluateFieldData(filter[field], data[field], true)) {
        return true;
      }
    }
  } else {
    for (const field of Object.keys(filter).filter(
      e => e !== 'caseSensitive'
    )) {
      if (evaluateFieldData(filter[field].toUpperCase(), data[field], false)) {
        return true;
      }
    }
  }
  return false;
};
