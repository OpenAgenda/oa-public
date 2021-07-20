'use strict';

const fastCsv = require('fast-csv');
const transform = require('./lib/transform');

function csv(csvOptions = {}) {
  return (inStream, options = {}) => inStream
    .pipe(transform(options))
    .pipe(fastCsv.createWriteStream(csvOptions));
}

module.exports = (csvOptions = {}) => csv({
  headers: true,
  delimiter: ',',
  quote: '"',
  escape: '"',
  ...csvOptions
});
