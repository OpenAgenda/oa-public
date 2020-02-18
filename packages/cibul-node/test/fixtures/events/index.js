'use strict';

const fs = require('fs');

module.exports = fs.readdirSync(__dirname)
  .filter(f => f !== 'index.js')
  .reduce((fixtures, filename) => {
  return {
    ...fixtures,
    [filename.split('.').shift()]: JSON.parse(fs.readFileSync(__dirname + '/' + filename))
  }
}, {});
