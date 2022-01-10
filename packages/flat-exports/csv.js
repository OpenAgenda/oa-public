'use strict';

const fastCsv = require('fast-csv');
const transform = require('./lib/transform');

function csv(csvOptions = {}) {
  const streamCsv = (inStream, options = {}) => inStream
    .pipe(transform(options))
    .pipe(fastCsv.createWriteStream(csvOptions));

  const getHeaders = (options = {}) => transform.getFlattener(options).getHeaders(options);

  return Object.assign(streamCsv, {
    getHeaders
  });
}

module.exports = (csvOptions = {}) => csv({
  headers: true,
  delimiter: ',',
  quote: '"',
  escape: '"',
  ...csvOptions
});
