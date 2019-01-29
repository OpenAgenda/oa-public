"use strict";

var qs = require( 'qs' ),

  utils = require( '@openagenda/utils' );

module.exports = function( values ) {

  var href = window.location.href.split( '?' )[ 0 ];

  if ( utils.size( values ) ) {

    href += '?' + qs.stringify( values );

  }

  return href;

}
