"use strict";

var utils = require( '@openagenda/utils' );

module.exports = {
  extractLanguages: extractLanguages
}

function extractLanguages( descData ) {

  var langs = [];

  utils.forEach( [ 'title', 'description', 'tags', 'freeText' ], function( field ) {

    for ( var fieldLang in descData[ field ] ) {

      if ( langs.indexOf( fieldLang ) == -1 ) langs.push( fieldLang );

    }

  } );

  return langs;

}