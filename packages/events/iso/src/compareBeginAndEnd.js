'use strict';

const d = v => v instanceof Date ? v : new Date(v);

module.exports = (begin, end, origin) => {
  const diff = d(end).getTime() - d(begin).getTime();

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
