'use strict';

const { Transform } = require('node:stream');

const validateStreamOptions = require('./validateStreamOptions');

module.exports = class FlatTransform extends Transform {
  constructor({ options, head, parseEvent, tail }) {
    super({
      writableObjectMode: true,
    });

    this._options = validateStreamOptions(options);

    this._parseEvent = parseEvent;

    this._tail = tail;

    this._previousEvent = null;

    this.push(head(this._options));
  }

  _transform(event, encoding, cb) {
    const previousEvent = this._previousEvent;

    this._previousEvent = event;

    cb(
      null,
      this._parseEvent(this._options, event, { previous: previousEvent }),
    );
  }

  _flush(cb) {
    if (!this._tail) return cb();

    this.push(this._tail());

    cb();
  }
};
