"use strict";

const isInteger = require('./isInteger');

module.exports = {
  isInteger,
  extend: extend,
  filterByAttr: filterByAttr,
  isArray: isArray,
  size: size,
  fZ: fZ,
  unique: unique,
  forEach: forEach,
  toCamelCase: toCamelCase,
  toUnderscore: toUnderscore,
  escape: escape,
  truncate: truncate,
  capitalize: capitalize,
  uncapitalize: uncapitalize,
  cleanString: cleanString,
  deep: require( './deep' )
};


function uncapitalize( str ) {

  str = String(str);

  if ( !str.length ) return '';

  return str[ 0 ].toLowerCase() + str.substr( 1, str.length );

}

function capitalize( str ) {

  str = String(str);

  if ( !str.length ) return '';

  return str[ 0 ].toUpperCase() + str.substr( 1, str.length );

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

function cleanString( str ) {

  if ( typeof str !== 'string' ) return str;

  var charsToClean = [
    1, 2, 3, 4, 5, 6, 7, 8,
    11, // VT
    12, // form feed - https://www.compart.com/en/unicode/U+000C
    15, // shift in
    18, // DC2
    19, // DC3
    21, // NAK
    24, // Cancel
    26, // SUB
    27, // Esc
    28, // File separator
    29, // GS group separator
    30, // RS
    31, // Information separator
    8232,
    8233,
    769// U+0301
  ];

  for( var i = 0; i < charsToClean.length; i++ ) {

    charsToClean[ i ] = String.fromCharCode( charsToClean[ i ] );

  }

  return str.replace( new RegExp( '[' + charsToClean.join( '' ) + ']', 'g' ), ' ' );

}
