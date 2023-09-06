'use strict';

const fs = require('fs');

module.exports = function fileExists(filepath) {
  try {
    fs.accessSync(filepath);
    return true;
  } catch {
    return false;
  }
};
