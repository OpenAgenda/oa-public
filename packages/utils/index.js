"use strict";

module.exports = {
  extend: extend,
  filterByAttr: filterByAttr,
  isArray: isArray,
  size: size,
  fZ: fZ,
  unique: unique,
  forEach: forEach, // for some older browsers
  toCamelCase: toCamelCase,
  toUnderscore: toUnderscore,
  escape: escape
};

function escape( html ) {

  return String( html )
  
  .replace( /&/g, '&amp;' )
  
  .replace( /</g, '&lt;' )
  
  .replace( />/g, '&gt;' )
  
  .replace( /'/g, '&#39;' )
  
  .replace( /"/g, '&quot;' );

};

}

function toCamelCase( input ) {

  if ( typeof input == 'object' ) {

    var camelCased = {};

    for ( var key in input ) {

      camelCased[ toCamelCase(key) ] = input[ key ];

    }

    return camelCased;

  }

  return input.replace( /[-_](.)/g, function( match, group1 ) {

    return group1.toUpperCase();

  });

}

function toUnderscore( input ) {

  if (typeof input == 'object') {

    var underscored = {};

    for (var key in input) {

      underscored[toUnderscore(key)] = input[key];

    }

    return underscored;

  }

  return input.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});

}

function unique( arr ) {

  var u = [];

  arr.forEach( function( a ) {

    if ( u.indexOf( a ) === -1 ) u.push( a );

  });

  return u;

}


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

}

function fZ( n, size ) {

  if ( !size ) size = 2;

  var s = n + '';

  while ( s.length < size ) s = '0' + s;

  return s; 
}
