'use strict';

const fs = require('node:fs/promises');

module.exports = async function fileExists(filepath) {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
};
