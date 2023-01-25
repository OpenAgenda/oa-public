'use strict';

module.exports = function toSortTimingFormat(t) {
  return `${Math.ceil(new Date(t).getTime() / 1000)}`.padStart(15);
};
