"use strict";

const { Transform } = require( 'stream' );

const validateStreamOptions = require( './validateStreamOptions' );

module.exports = class FlatTransform extends Transform {

  constructor( { options, head, parseEvent, tail } ) {

    super( {
      writableObjectMode: true
    } );

    this._options = validateStreamOptions( options );

    this._parseEvent = parseEvent;

    this._tail = tail;

    this.push( head( this._options ) );
    
  }

  _transform( event, encoding, cb ) {

    cb( null, this._parseEvent( this._options, event ) );

  }

  _flush( cb ) {

    if ( !this._tail ) return cb();

    this.push( this._tail() );

    cb();

  }

}