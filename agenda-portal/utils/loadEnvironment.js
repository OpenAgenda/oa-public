'use strict';

const fs = require('node:fs');
const dotenv = require('dotenv');

module.exports = (dir) => {
  const envFile = `${dir}/.env`;

  if (process.env.PORTAL_DIR === undefined) {
    process.env.PORTAL_DIR = dir;
  }

  if (!fs.existsSync(envFile)) {
    return;
  }

  dotenv.config({ path: envFile });
};
