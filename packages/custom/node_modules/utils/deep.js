module.exports = deep;

module.exports.set = deepSet;

function deep( obj, address ) {

  if ( typeof obj !== 'object' ) return;

  if ( obj === null ) return;

  var v = obj, parts = address.split( '.' );

  for ( var i = 0; i < parts.length; i++ ) {

    if ( typeof v[ parts[ i ] ] === 'undefined' ) return;

    if ( v[ parts[ i ] ] === null ) return;

    v = v[ parts[ i ] ];

  }

  return v;

}


function deepSet( obj, address, value ) {

  if ( typeof obj !== 'object' || obj === null ) return;

  var v = obj, parts = address.split( '.' ), leaf = parts.pop();

  for ( var i = 0; i < parts.length; i++ ) {

    if ( typeof v[ parts[ i ] ] === 'undefined' ) v[ parts[ i ] ] = {};

    v = v[ parts[ i ] ];

  }

  v[ leaf ] = value;

}