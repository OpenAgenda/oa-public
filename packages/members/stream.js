"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const { Readable } = require( 'stream' );

const list = require( './list' );

module.exports = ( config, query, options = {} ) => new Stream( config, query, options );

class Stream extends Readable {

  constructor( config, query = {}, nav = {}, options = {} ) {

    super( { objectMode: true } );

    this._ = {
      config,
      query,
      nav,
      options,
      after: null,
      buffer: []
    }

  }

  async _read() {

    if ( !this._.buffer.length ) {
      this._.buffer = await this._loadBuffer();
    }

    return this.push( this._.buffer.length ? this._.buffer.shift() : null );

  }

  async _loadBuffer() {

    const nav = this._.after ? ih( this._.nav, { after: { $set: this._.after } } ) : this._.nav;

    const members = await list(
      this._.config,
      this._.query,
      nav,
      this._.options
    );

    if ( !members.length ) return [];

    this._.after = _.last( members ).order;

    return members;

  }

}
