"use strict";

var IntlMessageFormat = require( 'intl-messageformat' ).default;
var parser = require( 'intl-messageformat-parser' );

/**
 * provide a labels getter that will
 * give back labels fed at init
 *
 * needs to be ES5 or cibul-templates uglify will throw errors
 */

module.exports = function( labels, defaultLang, fallbackLang ) {

  if ( typeof defaultLang === 'undefined' ) {

    defaultLang = 'en';

  }

  if ( typeof fallbackLang === 'undefined' ) {

    fallbackLang = 'en';

  }

  var getLabel = function( name, values, lang ) {

    if ( arguments.length == 2 && typeof values == 'string' ) {

      lang = values;
      values = {};

    }

    if ( !lang ) lang = defaultLang;

    if ( !labels[ name ] ) return null;

    var str = [ undefined, null ].indexOf( labels[ name ][ lang ] ) === -1 ? labels[ name ][ lang ] : null;

    if ( fallbackLang && !str ) {

      str = labels[ name ][ fallbackLang ];

    }

    if ( !str ) {

      str = name;

    }

    var parsedAST = parser.parse( str );
    var isICU = parsedAST.some( function ( v ) {
      return !parser.isLiteralElement( v );
    } );

    // ICU message
    if ( isICU ) {

      return new IntlMessageFormat( parsedAST ).format( values );

    }

    // Old API - if ( str.match( /%\w+%/ ) ) {}

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
