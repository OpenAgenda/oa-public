"use strict";

var csv = require( 'fast-csv' ),

utils = require( '../../lib/utils' ),

possibleLanguages = [ 'fr', 'en', 'es', 'de', 'it' ];

module.exports = function( writeableStream, options ) {

  var params = utils.extend( {
    sourceField: 'events',
    mapping: []
  }, options );

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

  function write( req ) {

    var values = req[ params.sourceField ];

    if ( !utils.isArray( values ) ) {

      values = [ values ];

    }

    values.forEach( function( v ) {

      _writeRow( stream, v, params.mapping );

    });

  }

  function end() {

    stream.end();

  }

}

function _writeRow( stream, values, mapping ) {

  var csvRow = {};

  mapping.forEach( function( m ) {

    var srcField, dstField, value;

    if ( utils.isArray( m ) ) {

      srcField = m[ 1 ];
      dstField = m[ 0 ];

    } else {

      srcField = dstField = m;

    }

    value = _extractValue( values, srcField );

    if ( _isMultilingual( value ) ) {

      _extractLanguages( value ).forEach( function( lang ) {

        csvRow[ dstField + '_' + lang ] = value[ lang ];

      });

    } else {

      csvRow[ dstField ] = value ? value : '';

    }

  });

  stream.write( csvRow );

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