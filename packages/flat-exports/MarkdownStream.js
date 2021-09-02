'use strict';

const _ = require('lodash');

const FlatTransform = require('./lib/FlatTransform');

const { head, parseEvent } = require('./lib/markdown');

module.exports = class MarkdownStream extends FlatTransform {
  constructor(options = {}) {
    super({
      options,
      head: head.bind(null, _.get(options, 'format', 'md')),
      parseEvent: parseEvent.bind(null, _.get(options, 'format', 'md'))
    });
  }
};
