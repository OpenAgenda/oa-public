"use strict";

const { Readable } = require( 'stream' );
const log = require('@openagenda/logs')('stream');

module.exports = ({ search, scroll }, alias, query, options) => {
  return new SearchStream(search, scroll, alias, query, options);
}

class SearchStream extends Readable {
  constructor(search, scroll, alias, query = {}, options = {} ) {
    log('instanciated stream for alias %s', alias);

    super( {
      objectMode: true
    } );

    this._scrollId = null;
    this._alias = alias;
    this._search = search;
    this._scroll = scroll;
    this._query = query;
    this._options = options;
    this._bufferedEvents = [];
    this._total = 0;
    this._cursor = 0;

    this._nav = {
      scroll: options.scroll || '10m',
      size: options.size || null
    };
  }

  async _read() {
    if (this._isFirstRead()) {
      await this._firstRead();
    }

    this._popBuffer();
  }

  async _firstRead() {
    try {
      const { total, events, scrollId } = await this._search(this._query, this._nav, this._options);

      log('fetched first %s events for a total of %s', events.length, total);

      this._total = total;
      this._bufferedEvents = events;
      this._scrollId = scrollId;
    } catch ( err ) {
      process.nextTick( () => this.emit( 'error', err ) );
    }
  }

  async _popBuffer() {
    log('popping buffer: cursor at %s on a total at %s', this._cursor, this._total);

    const next = this._bufferedEvents.shift();

    if (this._cursor === this._total) {
      return this.push(null);
    }

    if (next) {
      this._cursor++;
      return this.push( next );
    }

    this._refillBuffer();
  }

  async _refillBuffer() {
    this.emit( 'reloading', {
      cursor: this._cursor,
      total: this._total
    } );

    const { total, events } = await this._scroll(this._scrollId, '10m');

    log('refilling buffer with %s events', events.length);

    this._total = total;
    this._bufferedEvents = events;

    if (!this._bufferedEvents.length) {
      return this.push(null);
    }

    this._popBuffer();
  }

  _isFirstRead() {
    return !this._scrollId;
  }
}
