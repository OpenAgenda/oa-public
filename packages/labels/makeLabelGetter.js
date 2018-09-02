"use strict";

/**
 * provide a labels getter that will
 * give back labels fed at init
 *
 * needs to be ES5 or cibul-templates uglify will throw errors
 */

module.exports = function( labels, defaultLang ) {

  if ( typeof defaultLang === 'undefined' ) {

    defaultLang = 'en';

  }

  var getLabel = function( name, values, lang ) {

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

    var str = [ undefined, null ].indexOf( labels[ name ][ lang ] ) === -1 ? labels[ name ][ lang ] : name;

    if ( values ) {

      for ( var k in values ) {

        str = str.replace( '%' + k + '%', values[ k ] );

      }

    }

    return str;

  };

  getLabel.labels = labels;

  return getLabel;

}
