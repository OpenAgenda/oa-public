'use strict';

const fs = require('node:fs');

module.exports = fs.readdirSync(__dirname)
  .filter(f => f !== 'index.js')
  .reduce((fixtures, filename) => ({
    ...fixtures,
    [filename.split('.').shift()]: JSON.parse(fs.readFileSync(`${__dirname}/${filename}`)),
  }), {});
