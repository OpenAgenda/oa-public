'use strict';

const _ = require('lodash');
const { Readable } = require('stream');
const ih = require('immutability-helper');

const list = require('./list');

class Stream extends Readable {
  constructor(service, query, options) {
    super({ objectMode: true });

    this._ = {
      service,
      query,
      options,
      after: null,
      buffer: [],
      transform: _.get(options, 'transform')
    };
  }

  async _read() {
    if (!this._.buffer.length) {
      this._.buffer = await this._loadBuffer();
    }

    if (!this._.buffer.length) {
      return this.push(null);
    }

    const item = this._.buffer.shift();

    this.push(this._.transform ? this._.transform(item) : item);
  }

  async _loadBuffer() {
    const {
      items,
      after
    } = await list(
      this._.service,
      this._.query,
      { after: this._.after, useAfter: true },
      this._.options
    );

    if (!items.length) return [];

    this._.after = after;

    return items;
  }
}

module.exports.byAgendaUid = (
  service,
  agendaUid,
  query = {},
  options = {}
) => new Stream(service, query, {
  ...options,
  context: { agendaUid }
});
