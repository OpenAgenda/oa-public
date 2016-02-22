"use strict";

var qs = require( 'qs' );

module.exports = function( query ) {

  if (
    ( typeof window.history !== 'undefined' ) 
    && ( typeof window.history.pushState !== 'undefined' )
  ) {

    window.history.pushState( query, null, 
      window.location.href.split( '?' )[ 0 ] + '?' + qs.stringify( query ) 
    );
    
  }

}