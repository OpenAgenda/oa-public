"use strict";

const _ = require( 'lodash' );

const store = require( './store' );

const build = require( './build' );

module.exports = function( loaded, instance ) {

  // load control data getter

  loaded.getControlData = function( options, cb ) {

    const params = {};

    if ( arguments.length === 2 ) {

      _.assign( params, options );

    } else {

      cb = options;

    }

    store.get( instance.uid, function( err, data ) {

      if ( err ) return cb( err );

      if ( data ) return cb( null, data );

      // if nothing is in cache, generate on
      // the fly ( like through )
      
      build( _.assign( params, { id: instance.id } ), cb );

    } );
    
  }

  loaded.getControlDataTimestamp = function( cb ) {

    store.getTimestamp( instance.uid, cb );

  }

  return loaded.getControlData;

}
