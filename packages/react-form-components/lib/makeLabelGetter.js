"use strict";

module.exports = function( labels ) {

  return function( name, values, lang ) {

    if ( arguments.length == 2 && typeof values == 'string' ) {

      lang = values;
      values = {};

    } else if ( arguments.length == 2 ) {

      lang = 'en';

    }

    if ( !labels[ name ] ) return null;

    var str = labels[ name ][ lang ], k;

    if ( values ) {

      for( k in values ) {

        str = str.replace( k, values[ k ] );

      }

    }

    return str;

  }

}