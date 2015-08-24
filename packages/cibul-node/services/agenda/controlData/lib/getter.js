"use strict";

var store = require( './store' ),

build = require( './build' );

module.exports = function( loaded, instance ) {

  // load control data getter

  loaded.getControlData = function( cb ) {

    store.get( instance.uid, function( err, data ) {

      if ( err ) return cb( err );

      if ( data ) return cb( null, data );

      // if nothing is in cache, generate on
      // the fly ( like through )
      
      build( { id: instance.id }, cb );

    } );
    
  }

  loaded.getControlDataTimestamp = function( cb ) {

    store.getTimestamp( instance.uid, cb );

  }

  return loaded.getControlData;

}