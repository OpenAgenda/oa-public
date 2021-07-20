module.exports = function assignIfEmpty(target, ...sources) {
  if (target === null || target === undefined) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  const to = Object(target);

  for (const source of sources) {
    if (source !== null && source !== undefined) {
      for (const nextKey in source) {
        if (
          Object.prototype.hasOwnProperty.call(source, nextKey)
          && !Object.prototype.hasOwnProperty.call(to, nextKey)
        ) {
          to[nextKey] = source[nextKey];
        }
      }
    }
  }

  return to;
};
