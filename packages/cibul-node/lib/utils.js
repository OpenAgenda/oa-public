"use strict";

module.exports = {
  extend: extend,
  filterByAttr: filterByAttr,
  isArray: isArray,
  size: size,
  forEach: forEach, // for some older browsers
};


function isArray( obj ) {

  return Object.prototype.toString.call( obj ) === '[object Array]';

}

function size( obj ) {

  var size = 0, key;

  for ( key in obj ) {

    if ( obj.hasOwnProperty( key ) ) size++;

  }

  return size;

}


function filterByAttr( obj, arr ) {

  var newObj = {};

  forEach( arr, function( name ) {

    if ( obj[name] !== undefined ) newObj[name] = obj[name];

  });

  return newObj;

};

function forEach( array, action ) {

  for ( var i = 0; i < array.length; i++ ) {

    action( array[i] );

  }

};

function extend() {

  for ( var i=1; i<arguments.length; i++ ) {

    for ( var key in arguments[i] ) {

      if ( arguments[i].hasOwnProperty( key ) ) {

        arguments[ 0 ][ key ] = arguments[ i ][ key ];

      }

    }

  }
        
  return arguments[ 0 ];

};