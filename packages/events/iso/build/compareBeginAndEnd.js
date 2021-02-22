'use strict';

var d = function d(v) {
  return v instanceof Date ? v : new Date(v);
};

module.exports = function (begin, end, origin) {
  var diff = d(end).getTime() - d(begin).getTime();

  if (diff < 0) {
    throw [{
      code: 'endLessThanBegin',
      message: 'end cannot be before begin',
      origin: origin
    }];
  }

  if (diff > 86400000) {
    throw [{
      code: 'diffExceeded',
      message: 'end cannot happen more than 24h after begin',
      origin: origin
    }];
  }
};
//# sourceMappingURL=compareBeginAndEnd.js.map