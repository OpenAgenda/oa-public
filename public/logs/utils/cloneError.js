'use strict';

module.exports = function cloneError(error) {
  const clone = Object.assign(Object.create(Object.getPrototypeOf(error)), error);
  clone.stack = error.stack;
  return clone;
};
