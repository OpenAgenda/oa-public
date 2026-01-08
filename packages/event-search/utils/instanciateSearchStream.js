import { Readable } from 'node:stream';
import logs from '@openagenda/logs';

const log = logs('stream');

class SearchStream extends Readable {
  constructor(search, alias, query = {}, options = {}) {
    log('instanciated stream for alias %s', alias);

    super({
      objectMode: true,
    });

    this._alias = alias;
    this._search = search;
    this._query = query;
    this._options = options;
    this._bufferedEvents = [];
    this._total = 0;
    this._cursor = 0;

    this._nav = {
      after: undefined,
      size: options.size || null,
    };
  }

  async _read() {
    log('read');
    try {
      if (!this._bufferedEvents.length) {
        await this._refillBuffer();
      }

      return this._popBuffer();
    } catch (err) {
      this.destroy(err);
    }
  }

  async _popBuffer() {
    if (!this._bufferedEvents.length) {
      return;
    }

    log(
      'popping buffer: cursor at %s on a total at %s',
      this._cursor,
      this._total,
    );

    const next = this._bufferedEvents.shift();

    if (this._cursor === this._total) {
      log('end reached');
      return this.push(null);
    }

    this._cursor += 1;
    return this.push(next);
  }

  async _refillBuffer() {
    log('refillBuffer');
    this.emit('reloading', {
      cursor: this._cursor,
      total: this._total,
    });

    const { total, events, after } = await this._search(
      this._query,
      this._nav,
      { ...this._options, useAfterKey: true },
    );

    this._total = total;
    this._bufferedEvents = events;
    this._nav.after = after;

    if (!this._bufferedEvents.length) {
      log('end reached at refill');
      return this.push(null);
    }

    log('refilled buffer with %s events', events.length);
  }
}

export default (search, alias, query, options) =>
  new SearchStream(search, alias, query, options);
