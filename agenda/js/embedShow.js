"use strict";

var controllers = require( '../../widgets/controller/main' ),

embedded = require( '../../widgets/lib/embeddedPage' ),

debug = require( 'debug' ), log,

activeFilters = require( '../../widgets/activeFilters/activeFilters' ),

list = require( './list' );

window.hook( function( options ) {

  log = debug( 'embedded agenda show' );

  log( 'initing with options %s', JSON.stringify( options ) );

  var handler = embedded( {
    onReceive: function( message ) {

      if ( message.bottom ) {

        list.loadNext( function( err ) {

          handler.contentChange();
          
        });
        
      }

    }
  }, options );

  window.cibul.getController( options.uid ).setProxy( { 
    update: function( newValues ) {

      log( 'change in iframe %s', JSON.stringify( newValues ) );

      handler.send( { update: newValues } );

    }
  });

  list.init( {
    total: options.total,
    perPage: options.perPage
  } );

});