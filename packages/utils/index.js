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
  escape: escape,
  truncate: truncate
};


function truncate( str, len, append ) {

  str = String( str );

  if ( str.length > len ) {

    str = str.slice( 0, len );

    if ( append ) str += append;

  }

  return str;
  
}

function escape( str, escapeApostrophe ) {

  if ( !str ) return str;

  if ( escapeApostrophe === undefined ) {

    escapeApostrophe = true;

  }

  var escaped = String( str )
  
  .replace( /&/g, '&amp;' )
  
  .replace( /</g, '&lt;' )
  
  .replace( />/g, '&gt;' )
  
  .replace( /"/g, '&quot;' );

  if ( escapeApostrophe ) {

    escaped = escaped.replace( /'/g, '&#39;' );

  }

  return escaped;

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

  var s = n + '',

  sign = s.substr( 0, 1 ) == '-' ? '-' : '';

  if ( sign.length ) {

    s = s.substr( 1 );

  }

  while ( s.length < size ) s = '0' + s;

  return sign + s; 
}