"use strict";

const { Transform } = require( 'stream' );

const {
  head,
  event: parseEvent,
  validateStreamOptions
} = require( './lib/ics' );

module.exports = class ICSStream extends Transform {

  constructor( options = {} ) {

    super( {
      writableObjectMode: true
    } );

    this._options = validateStreamOptions( options );

    this.push( head( this._options ) );
    
  }

  _transform( event, encoding, cb ) {

    cb( null, parseEvent( this._options, event ) );

  }

  _flush( cb ) {

    this.push( 'END:VCALENDAR' );

    cb();

  }

}