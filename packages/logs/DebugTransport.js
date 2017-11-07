"use strict";

const _ = require( 'lodash' );
const winston = require( 'winston' );
const debug = require( 'debug' );

const isEmptyObject = obj => obj && Object.keys( obj ).length === 0 && obj.constructor === Object;

class DebugTransport extends winston.Transport {

  constructor( options ) {
    super( options );

    const params = Object.assign( { namespace: '', prefix: '', level: 'debug' }, options );

    this.name = 'debug';
    this.level = params.level;
    this.prefix = params.prefix;
    this.namespace = params.namespace;
    this.debug = debug( (params.prefix || '') + (params.namespace || '') );
  }

  log( level, msg, meta, cb ) {
    meta = isEmptyObject( meta ) ? undefined : meta;
    this.debug.apply( null, [ msg ].concat( meta ? [ _.omit( meta, 'namespace' ) ] : [] ) );
    cb( null, true );
  }

}

module.exports = DebugTransport;