"use strict";

var utils = require( 'utils' ),

possibleLanguages = [ 'fr', 'en', 'es', 'de', 'it' ];

module.exports = require( '../../lib/instanceLoader' )( function( loaded, instance ) {

  return {
    flattener: flattener
  }

  function flattener( includePrivateFields, cb ) {

    var languages, mapping;

    instance.getLanguages( function( err, l ) {

      languages = l;

      mapping = _defineMapping( includePrivateFields );

      cb( null, {
        getFieldNames: getFieldNames,
        flatten: flatten
      });

    });

    function getFieldNames() {

      var names = [];

      mapping.forEach( function( m ) {

        var dstNames = [], suffixes = [];

        if ( utils.isArray( m ) && m.length === 3 ) {
        
          m[ 2 ].forEach( function( suffix ) {

            dstNames.push( m[ 1 ] + '_' + suffix );

          });

        } else if ( utils.isArray( m ) ) {

          dstNames.push( m[ 1 ].split( '.' )[ 0 ] );

        } else if ( typeof m === 'object' ) {

          dstNames.push( m.destField ? m.destField : m.sourceField );

        } else {

          dstNames.push( m );

        }

        names = names.concat( dstNames );

      });

      return names;

    }


    function flatten( values ) {

      var flattened = {};

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

            flattened[ dstField + '_' + s ] = '';

          });

        } else {

          flattened[ dstField ] = '';

        }

        value = _extractValue( values, srcField );

        if ( _isMultilingual( value ) ) {

          _extractLanguages( value ).forEach( function( lang ) {

            flattened[ dstField + '_' + lang ] = fn( value[ lang ] );

          });

        } else if ( typeof value === 'boolean' ) {

          flattened[ dstField ] = fn( value ? '1' : '' );

        } else if ( value !== null ) {

          flattened[ dstField ] = fn( value ? value : '' );

        }

      });

      return flattened;

    }

    function _defineMapping( includePrivateFields ) {

      return [ 'uid' ].concat( _textFields( [ 
        'title', 'description', 'longDescription', 'conditions' 
      ], languages ), [
        'image',
        'thumbnail',
        'originalImage',
        'updatedAt',
        [ 'range', 'range', [ 'fr', 'en' ] ],
        'firstDate',
        'firstTimeStart',
        'firstTimeEnd',
        'registrationUrl',
        'locationName',
        'locationUid',
        'address',
        'postalCode',
        'city',
        'district',
        'department',
        'region',
        'latitude',
        'longitude',
        'featured' 
      ], _extendMapping( instance, includePrivateFields ) );

    }


  }

  function _extractValue( values, field ) {

    var fieldNames = field.split( '.' ),

    value = values;

    fieldNames.forEach( function( name ) {

      value = value[ name ];

    });

    return value;

  }

  
} );

function _textFields( fields, languages ) {

  var languageFields = [];

  fields.forEach( function( f ) {

    languageFields.push( [ f, f, languages ] );

  });

  return languageFields;

}

function _extendMapping( agenda, includePrivateData ) {

  var amendment = [ { 
    sourceField: 'category',
    fn: _extractCategory
  }, {
    sourceField: 'tags',
    fn: _extractTags
  } ],

  customFields = agenda.getCustomFieldsConfig();

  if ( includePrivateData ) amendment.push( 'state' );

  customFields.forEach( function( cField ) {

    if ( includePrivateData || ( cField.type !== 'private' ) ) {

      amendment.push( [ cField.name, 'custom.' + cField.name ] );

    }

  });

  return amendment;

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


function _extractCategory( c ) {

  return c.label;

}



/**
 * event tags are annoying. either they come from
 * the event itself and are multilingual,
 * either they come from the agenda and are an array
 * of labeled objects
 */

function _extractTags( t ) {

  if ( utils.isArray( t ) ) {

    return t.map( function( t ) { return t.label } ).join( ', ');

  } else if( typeof t == 'object' ) {

    var tArr = [];

    for ( var i in t ) {

      tArr.push( t[ i ] );

    }

    return t.join( ', ' );

  } else {

    return t;

  }

}