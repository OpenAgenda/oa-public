"use strict";

const util = require( 'util' );
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

    const debugName = (params.prefix || '') + (params.namespace || '');

    if ( params.enable && !debug.enabled( debugName ) ) {
      debug.names.push( new RegExp( '^' + debugName.replace( /\*/g, '.*?' ) + '$' ) );
    }

    this.debug = debug( debugName );
  }

  log( level, msg, meta, cb ) {
    const displayedMeta = meta instanceof Error ? meta : _.omit( meta, 'namespace' );
    const args = [ msg ].concat(
      typeof displayedMeta !== 'undefined' && !isEmptyObject( displayedMeta )
        ? util.inspect( displayedMeta, { colors: debug.useColors() } )
        : []
    );

    this.debug.apply( null, args );

    cb( null, true );
  }

}

module.exports = DebugTransport;
