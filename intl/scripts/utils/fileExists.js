'use strict';

const fs = require('node:fs');

module.exports = function fileExists(filepath) {
  try {
    fs.accessSync(filepath);
    return true;
  } catch {
    return false;
  }
};
