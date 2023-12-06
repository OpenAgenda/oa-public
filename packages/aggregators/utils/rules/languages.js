'use strict';

module.exports = (filter, data) => {
  if (
    Object.keys(data.title)
      .filter(k => data.title[k])
      .some(r => filter.includes(r))
  ) {
    return true;
  }
  return false;
};
