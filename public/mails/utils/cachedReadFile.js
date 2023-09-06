'use strict';

const fs = require('fs/promises');

module.exports = async function cachedReadFile(cache, filePath) {
  if (cache.has(filePath)) {
    return cache.get(filePath);
  }

  const result = await fs.readFile(filePath, 'utf8');

  cache.set(filePath, result);

  return result;
};
