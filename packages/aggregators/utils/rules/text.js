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
        ? item.search(filterValue) !== -1
        : item.toUpperCase().search(filterValue.toUpperCase()) !== -1
    ) {
      return true;
    }
  }
  return false;
};

module.exports = (filter, data) => {
  for (const field of Object.keys(filter).filter(e => e !== 'caseSensitive')) {
    if (evaluateFieldData(filter[field], data[field], filter?.caseSensitive)) {
      return true;
    }
  }

  return false;
};
