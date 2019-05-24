"use strict";

const { Readable } = require( 'stream' );
const search = require( './search' );
const scroll = require( './scroll' );

module.exports = ( alias, query, options ) => {

  return new SearchStream( alias, query, options );

}

class SearchStream extends Readable {

  constructor( alias, query = {}, options = {} ) {

    // options can contain nav size and

    super( {
      objectMode: true
    } );

    this._scrollId = null;
    this._alias = alias;
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

    if ( this._isFirstRead() ) {

      await this._firstRead();

    }

    this._popBuffer();

  }

  async _firstRead() {

    try {

      const { total, events, scrollId } = await search( this._alias, this._query, this._nav, this._options );

      this._total = total;
      this._bufferedEvents = events;
      this._scrollId = scrollId;

    } catch ( err ) {

      process.nextTick( () => this.emit( 'error', err ) );

    }

  }

  async _popBuffer() {

    const next = this._bufferedEvents.shift();

    if ( this._cursor === this._total ) {

      return this.push( null );

    }

    if ( next ) {

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

    const { total, events } = await scroll( this._scrollId, '10m' );

    this._total = total;
    this._bufferedEvents = events;

    if ( !this._bufferedEvents.length ) {

      return this.push( null );

    }

    this._popBuffer();

  }

  _isFirstRead() {

    return !this._scrollId;

  }

}
