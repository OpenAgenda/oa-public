"use strict";

var embedded = require( '../../widgets/lib/embeddedPage' ),

facebookEmbedded = require( '../../widgets/lib/facebookPage' ),

hours = require( './hours' ),

du = require( '../../js/lib/domUtils' ),

utils = require( 'utils' );

window.asap( function( options ) {

  let embed;
  
  if ( options.facebook ) {

    embed = facebookEmbedded( options );

    _appendTargetBlanks();

  } else {

    embed = embedded( options );

  }

  hours( { onToggle: embed.contentChange } );

} );

function _appendTargetBlanks() {

  // for each link in the page, if it does not belong to oa.com, target blank it.
  utils.forEach( du.els( 'a' ), function( a ) {

    var pattern = /^\/|(|https|http)\/\/(d\.|)openagenda.com/;

    if ( !pattern.test( a.getAttribute( 'href' ) ) ) {

      a.setAttribute( 'target', '_blank' );

    }

  } );

}