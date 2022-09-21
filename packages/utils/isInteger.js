'use strict';

module.exports = function isInteger(num) {
  return !Number.isNaN(Number(num)) && Number.isInteger(parseFloat(num, 10));
};
