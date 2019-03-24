"use strict";

/**
 * flatten a labels set to a single language keyed list
 */
module.exports = function( labels, lang, fallback ) {

  var flat = {}, possibleLangs;

  for ( var f in labels ) {

    flat[ f ] = labels[ f ][ lang ];

    if ( ( typeof flat[ f ] === 'undefined' ) && fallback ) {

      possibleLangs = Object.keys( labels[ f ] );

      if ( possibleLangs.length ) flat[ f ] = labels[ f ][ possibleLangs[ 0 ] ];

    }

  }

  return flat;

}
