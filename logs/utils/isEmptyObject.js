'use strict';

const isEmptyObject = (obj) =>
  obj && obj.constructor === Object && Object.keys(obj).length === 0;

module.exports = isEmptyObject;
