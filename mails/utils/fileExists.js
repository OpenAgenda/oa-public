'use strict';

const fs = require('fs/promises');

module.exports = async function fileExists(filepath) {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
};
