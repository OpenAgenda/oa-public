'use strict';

const FlatTransform = require('./lib/FlatTransform');

const { head, parseEvent, tail } = require('./lib/ics');

module.exports = class ICSStream extends FlatTransform {
  constructor(options = {}) {
    super({
      options,
      head,
      parseEvent,
      tail,
    });
  }
};
