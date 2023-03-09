'use strict';

const fs = require('fs');

module.exports = function loadObjectFromFile(options = {}) {
  const {
    cwd = __dirname,
  } = options;
  return (path, dataOrFn = {}) => (
    typeof dataOrFn === 'function'
      ? dataOrFn(JSON.parse(fs.readFileSync(`${cwd}/${path}`, 'utf-8')))
      : {
        ...JSON.parse(fs.readFileSync(`${cwd}/${path}`, 'utf-8')),
        ...dataOrFn,
      }
  );
};
