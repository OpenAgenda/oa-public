'use strict';

module.exports = function toSortTimingFormat(t) {
  let value = `${Math.ceil(new Date(t).getTime() / 1000)}`;

  while (value.length < 15) {
    value = `0${value}`;
  }
  return value;
};
