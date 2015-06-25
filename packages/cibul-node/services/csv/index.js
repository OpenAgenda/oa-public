"use strict";

var csv = require( 'fast-csv' ),

utils = require( '../../lib/utils' ),

possibleLanguages = [ 'fr', 'en', 'es', 'de', 'it' ];

module.exports = stream;

module.exports.getRow = getRow;

function stream( writeableStream, mapping ) {

  var stream = csv.createWriteStream( {
    headers: true,
    delimiter: ';',
    quote: '"',
    escape: '"'
  } );

  stream.pipe( writeableStream );

  return {
    write: write,
    end: end
  };

  function write( values ) {

    if ( !utils.isArray( values ) ) {

      values = [ values ];

    }

    values.forEach( function( v ) {

      _writeStreamRow( stream, v, mapping );

    });

  }

  function end() {

    stream.end();

  }

}

function getRow( values, mapping ) {

  var csvRow = {};

  mapping.forEach( function( m ) {

    var srcField, dstField, value, suffixes = false,

    fn = function( v ) { return v; };

    if ( utils.isArray( m ) ) {

      srcField = m[ 1 ];
      dstField = m[ 0 ];
      suffixes = m.length == 3 ? m[ 2 ] : false;

    } else if ( typeof m === 'object' ) {

      fn = m.fn;
      srcField = m.sourceField;
      dstField = m.destField ? m.destField : m.sourceField

    } else {

      srcField = dstField = m;

    }

    if ( suffixes ) {

      suffixes.forEach( function( s ) {

        csvRow[ dstField + '_' + s ] = '';

      });

    } else {

      csvRow[ dstField ] = '';

    }

    value = _extractValue( values, srcField );

    if ( _isMultilingual( value ) ) {

      _extractLanguages( value ).forEach( function( lang ) {

        csvRow[ dstField + '_' + lang ] = fn( value[ lang ] );

      });

    } else if ( typeof value === 'boolean' ) {

      csvRow[ dstField ] = fn( value ? '1' : '' );

    } else if ( value !== null ) {

      csvRow[ dstField ] = fn( value ? value : '' );

    }

  });

return csvRow;

}

function _writeStreamRow( stream, values, mapping ) {

  stream.write( getRow( values, mapping ) );

}


function _extractValue( values, field ) {

  var fieldNames = field.split( '.' ),

  value = values;

  fieldNames.forEach( function( name ) {

    value = value[ name ];

  });

  return value;

}


function _extractLanguages( values ) {

  var extractedLanguages = [];

  for( var l in values ) {

    if ( ( typeof values[ l ] == 'string' )

    && ( l.length == 2 ) ) {

      extractedLanguages.push( l );

    }

  }

  return extractedLanguages;

}

function _isMultilingual( value ) {

  if ( typeof value !== 'object' 

  || value === null ) return false;

  for ( var i = possibleLanguages.length - 1; i >= 0; i-- ) {

    if ( typeof value[ possibleLanguages[ i ] ] == 'string' ) {

      return true;

    }

  }

  return false;

}