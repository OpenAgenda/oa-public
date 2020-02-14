'use strict';

module.exports = (includes = null) => {
  const source = {
    excludes: [
      '_*',
      'timings._*'
    ]
  };

  if (includes === null) {
    return source;
  }

  return {
    ...source,
    includes
  }
}
