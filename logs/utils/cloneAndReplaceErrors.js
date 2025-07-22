'use strict';

const errorToJSON = require('./errorToJSON');

module.exports = function cloneAndReplaceErrors(obj, stackDelim) {
  function deepClone(item) {
    if (item === null || typeof item !== 'object') {
      return item;
    }

    if (item instanceof Error) {
      return errorToJSON(item, stackDelim);
    }

    if (Array.isArray(item)) {
      return item.map(deepClone);
    }

    const clone = {};
    for (const [key, value] of Object.entries(item)) {
      clone[key] = deepClone(value);
    }
    return clone;
  }

  return deepClone(obj);
};
