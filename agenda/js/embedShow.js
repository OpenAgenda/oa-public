"use strict";

var embedded = require( '../../widgets/lib/embeddedPage' ),

list = require( './list' );

window.hook( function( options ) {

  var handler = embedded( {
    onReceive: function( message ) {

      if ( message.bottom ) {

        list.loadNext( function( err ) {

          handler.checkHeight();
          
        });
        
      }

    }
  }, options );

  list.init( {
    total: options.total,
    perPage: options.perPage
  } );

});