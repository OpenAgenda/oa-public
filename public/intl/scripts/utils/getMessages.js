'use strict';

const fs = require('node:fs');

module.exports = function getMessages(localesPath) {
  try {
    return JSON.parse(fs.readFileSync(localesPath, 'utf8'));
  } catch (e) {
    return {};
  }
};
