'use strict';

const fs = require('fs');

module.exports = function loadObjectFromFile(options = {}) {
  const {
    cwd = __dirname
  } = options;
  return (path, data = {}) => ({
    ...JSON.parse(fs.readFileSync(`${cwd}/${path}`, 'utf-8')),
    ...data
  });
};
