'use strict';

const { Transform } = require('stream');
const transformAndDecorateItems = require('./transformAndDecorateItems');

module.exports = (service, knexQuery, options = {}) => {
  const knexStream = knexQuery.stream({
    highWaterMark: options.stream.highWaterMark
  });

  const stream = new Transform({ objectMode: true });

  const buffer = [];

  stream._flush = cb => processBufferedItems(stream, service, buffer, options, cb);

  stream._transform = (item, enc, cb) => {
    buffer.push(item);

    if (buffer.length < options.stream.highWaterMark) {
      return cb();
    }

    processBufferedItems(stream, service, buffer, options, cb);
  }

  knexStream.on('error', e => stream.emit('error', e));

  stream.on('end', () => knexStream.destroy());

  return knexStream.pipe(stream);
}


function processBufferedItems(stream, service, buffer, options, cb) {
  transformAndDecorateItems(service, buffer.splice(0, buffer.length), options)
    .then(
      transformed => {
        while(transformed.length) {
          stream.push(transformed.shift());
        }

        cb();
      },
      cb
    );
}
