'use strict';

const fs = require('fs');

module.exports = dir => {
  const envFile = `${dir}/.env`;

  if (!fs.existsSync(envFile)) {
    return;
  }

  const lines = (fs.readFileSync(envFile, 'utf-8') || '')
    .split('\n')
    .filter(line => line.length)
    .filter(line => line.substr(0, 1) !== '#');

  for (const line of lines) {
    const parts = line.split('=');
    const name = parts.shift();
    const value = parts.join('=');

    if (process.env[name] === undefined) {
      process.env[name] = value;
    }
  }
};
