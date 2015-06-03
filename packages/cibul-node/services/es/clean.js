"use strict";

module.exports = function( data ) {

  var clean = {},

  input = data ? data : {};

  _what( clean, input );

}


function _what( clean, data ) {

  if ( !data.what ) return;

}