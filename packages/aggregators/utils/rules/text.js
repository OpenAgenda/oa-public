'use strict';

const customToUpper = str => {
  if (typeof str !== 'string') return null;
  return str.toUpperCase();
};

const evaluateFieldData = (filterValue, fieldData, caseSensitive, wholeValue) => {
  const items = fieldData?.constructor.name === 'Object'
    ? Object.keys(fieldData).reduce(
      (carry, key) => carry.concat(fieldData[key]),
      []
    )
    : [].concat(fieldData);
  for (const item of items) {
    if (wholeValue) {
      if (caseSensitive
        ? item === filterValue
        : customToUpper(item) === customToUpper(filterValue)
      ) {
        return true;
      }
    } else if (
      caseSensitive
        ? item.search(filterValue) !== -1
        : item.toUpperCase().search(filterValue.toUpperCase()) !== -1
    ) {
      return true;
    }
  }
  return false;
};

module.exports = (filter, data) => {
  for (const field of Object.keys(filter).filter(e => e !== 'caseSensitive' && e !== 'wholeValue')) {
    if (evaluateFieldData(filter[field], data[field], filter?.caseSensitive, filter?.wholeValue)) {
      return true;
    }
  }

  return false;
};
