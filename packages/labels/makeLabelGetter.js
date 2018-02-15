"use strict";

/**
 * provide a labels getter that will
 * give back labels fed at init
 */

module.exports = function( labels, defaultLang ) {

  if ( typeof defaultLang === 'undefined' ) {

    defaultLang = 'en';

  }

  return function ( name, values, lang ) {

    if ( arguments.length == 2 && typeof values == 'string' ) {

      lang = values;
      values = {};

    }

    if ( !lang ) lang = defaultLang;

    if ( !labels[ name ] ) {
      if (process && process.env && process.env.NODE_ENV === 'development') {
        console.warn( 'Missing label: %s', name );
      }

      return null;
    }

    var str = labels[ name ][ lang ] || name;

    if ( values ) {

      for ( var k in values ) {

        str = str.replace( '%' + k + '%', values[ k ] );

      }

    }

    return str;

  }

}