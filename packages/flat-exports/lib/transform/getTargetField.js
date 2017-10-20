"use strict";

module.exports = function( labels, lang, key ) {

  if ( !labels || !labels[ key ] ) return key;

  if ( !labels[ key ][ lang ] ) return key;

  return labels[ key ][ lang ];

}