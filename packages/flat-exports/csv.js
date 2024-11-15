import fastCsv from 'fast-csv';
import transform, { getFlattener } from './lib/transform/index.js';

function csv(csvOptions = {}) {
  const streamCsv = (inStream, options = {}) =>
    inStream
      .pipe(transform(options))
      .pipe(fastCsv.createWriteStream(csvOptions));

  const getHeaders = (options = {}) =>
    getFlattener(options).getHeaders(options);

  return Object.assign(streamCsv, {
    getHeaders,
  });
}

export default (csvOptions = {}) =>
  csv({
    headers: true,
    delimiter: ',',
    quote: '"',
    escape: '"',
    ...csvOptions,
  });
