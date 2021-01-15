'use strict';

module.exports = (begin, end, origin) => {
  const diff = end.getTime() - begin.getTime();

  if (diff < 0) {
    throw [{
      code: 'endLessThanBegin',
      message: 'end cannot be before begin',
      origin
    }];
  }

  if (diff > 86400000) {
    throw [{
      code: 'diffExceeded',
      message: 'end cannot happen more than 24h after begin',
      origin
    }];
  }
}
