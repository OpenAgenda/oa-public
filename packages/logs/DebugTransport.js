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

    const debugName = (params.prefix || '') + (params.namespace || '');

    if ( params.enable && !debug.enabled( debugName ) ) {
      debug.names.push( new RegExp( '^' + debugName.replace( /\*/g, '.*?' ) + '$' ) );
    }

    this.debug = debug( debugName );
  }

  log( level, msg, meta, cb ) {
    let displayedMeta = _.omit( meta, 'namespace' );

    if ( meta && meta instanceof Error && meta.stack ) {
      displayedMeta = meta.stack;
    }

    displayedMeta = isEmptyObject( displayedMeta ) ? undefined : displayedMeta;

    this.debug.apply( null, [ msg ].concat( displayedMeta ? [ displayedMeta ] : [] ) );

    cb( null, true );
  }

}

module.exports = DebugTransport;
