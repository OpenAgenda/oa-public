'use strict';

const evaluateFieldData = (filterValue, fieldData) => {
  const items = fieldData?.constructor.name === 'Object'
    ? Object.keys(fieldData).reduce(
      (carry, key) => carry.concat(fieldData[key]),
      []
    )
    : [].concat(fieldData);

  for (const item of items) {
    if (item.search(filterValue) !== -1) {
      return true;
    }
  }
  return false;
};

module.exports = (filter, data) => {
  for (const field of Object.keys(filter)) {
    if (evaluateFieldData(filter[field], data[field])) {
      return true;
    }
  }

  return false;
};
