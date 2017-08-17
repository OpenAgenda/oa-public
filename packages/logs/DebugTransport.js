"use strict";

const winston = require( 'winston' );
const debug = require( 'debug' );

const isEmptyObject = obj => Object.keys( obj ).length === 0 && obj.constructor === Object;

class DebugTransport extends winston.Transport {

  constructor( options ) {
    super( options );

    const params = Object.assign( { namespace: '', prefix: '', level: 'debug' }, options );

    this.name = 'OA Logger';
    this.level = params.level;
    this.namespace = params.namespace;
    this.debug = debug( params.prefix + params.namespace );
  }

  log( level, msg, meta, cb ) {
    this.debug.apply( null, [ msg ].concat( isEmptyObject( meta ) ? [] : [ meta ] ) );
    cb( null, true );
  }

}

module.exports = DebugTransport;