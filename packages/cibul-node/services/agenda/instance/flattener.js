"use strict";

var utils = require( 'utils' ),

genUrl = require( '../../genUrl' ).abs,

possibleLanguages = [ 'fr', 'en', 'es', 'de', 'it' ],

accessibilityLabels = require( 'labels/event/accessibility' ),

exportFieldLabels = require( 'labels/event/exportFieldNames' ),

agendaTags = require( 'agenda-tags' ),

stateLabels = require( 'labels/event/states' ),

moment = require( 'moment-timezone' );

module.exports = require( '../../lib/instanceLoader' )( ( loaded, instance ) => {

  return {
    flattener: flattener
  }

  function flattener( options, cb ) {

    var languages, mapping,

    params = utils.extend( {
      includePrivateData: typeof options == 'boolean' ? options : false,
      lang: false,
      headerHandler: false
    }, typeof options === 'object' ? options : {} )

    instance.getLanguages( function( err, l ) {

      if ( err ) return cb( err );

      languages = l;

      agendaTags.get( instance.id, ( err, tagSet ) => {

        if ( err ) return cb( err );

        mapping = _defineMapping( params.includePrivateData, tagSet );

        cb( null, {
          getFieldNames: getFieldNames,
          flatten: flatten
        });

      } );

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

        } else if ( typeof m === 'object' && m.fn ) {

          dstNames.push( m.destField ? m.destField : m.sourceField );

        } else if ( typeof m === 'object' ) {

          dstNames.push( m.destField ? m.field : m.field );

        } else {

          dstNames.push( m );

        }

        names = names.concat( dstNames );

      });

      return names.map( _fieldLabel );

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

        } else if ( typeof m === 'object' && m.fn ) {

          fn = m.fn;
          srcField = m.sourceField;
          dstField = m.destField ? m.destField : m.sourceField

        } else if ( typeof m === 'object' ) {

          srcField = m.field;
          dstField = m.field;

        } else {

          srcField = dstField = m;

        }

        if ( suffixes ) {

          suffixes.forEach( function( s ) {

            flattened[ _fieldLabel( dstField + '_' + s ) ] = '';

          });

        } else {

          flattened[ _fieldLabel( dstField ) ] = '';

        }

        value = _extractValue( values, srcField );

        if ( _isMultilingual( value ) ) {

          _extractLanguages( value ).forEach( function( lang ) {

            flattened[ _fieldLabel( dstField + '_' + lang ) ] = fn( value[ lang ] );

          } );

        } else if ( typeof value === 'boolean' ) {

          flattened[ _fieldLabel( dstField ) ] = fn( value ? '1' : '' );

        } else if ( value !== null ) {

          flattened[ _fieldLabel( dstField ) ] = fn( value ? value : '' );

        }

      });

      return flattened;

    }

    function _fieldLabel( field ) {

      if ( params.headerHandler ) return params.headerHandler( field );

      if ( !params.lang ) return field;

      let suffix = false;

      if ( /.+(\_([a-z][a-z]))$/.test( field ) ) {

        suffix = field.match( /.+(\_([a-z][a-z]))$/ )[ 1 ];
        field = field.replace( suffix, '' );

      }

      if ( exportFieldLabels[ field ] ) {

        return exportFieldLabels[ field ][ params.lang ]

        + ( suffix ? ' - ' + suffix.toUpperCase().substr( 1 ) : '' );

      }

      return field + ( suffix || '' );

    }

    function _defineMapping( includePrivateData, tagSet ) {

      let map = [ 'uid' ].concat( _textFields( [ 
        'title', 'description', 'longDescription', 'conditions', 'html'
      ], languages ), [
        'image',
        'thumbnail',
        'originalImage',
        'updatedAt',
        [ 'range', 'range', [ 'fr', 'en' ] ],
        {
          'sourceField' : 'timings',
          'destField' : 'timings_fr',
          fn: _defineTimings( 'fr' )
        },
        {
          'sourceField' : 'timings',
          'destField' : 'timings_en',
          fn: _defineTimings( 'en' )
        },
        'firstDate',
        'firstTimeStart',
        'firstTimeEnd',
        { 
          sourceField: 'category',
          fn: _extractCategory
        } ],
        ( tagSet ? tagSet.groups.map( g => ( {
          sourceField: 'tags',
          destField: g.name,
          fn: _extractGroupTags( g )
        } ) ) : [ {
          sourceField: 'tags',
          fn: _extractTags
        } ] ),
        [ 'registrationUrl',
        {
          sourceField: 'accessibility',
          destField: 'accessibility_fr',
          fn: _defineAccessibility( 'fr' )
        },
        {
          sourceField: 'accessibility',
          destField: 'accessibility_en',
          fn: _defineAccessibility( 'en' )
        },
        'age.min',
        'age.max',
        'featured',
        'contributor.organization',
        {
          type: 'private',
          sourceField: 'state',
          destField: 'state',
          fn: _state( params.lang )
        },
        {
          type: 'private',
          field: 'contributor.contactNumber'
        },
        {
          type: 'private',
          field: 'contributor.contactName'
        },
        {
          type: 'private',
          field: 'contributor.contactPosition'
        },
        {
          type: 'private',
          field: 'contributor.email'
        },
        { 
          sourceField: 'slug',
          destField: 'link',
          fn: _defineEventUrl( instance )
        },
        'location.uid',
        'location.latitude',
        'location.longitude',
        'location.name',
        'location.address',
        'location.postalCode',
        'location.city',
        'location.district',
        'location.department',
        'location.region',
        'location.image',
        'location.phone',
        'location.website', {
          sourceField: 'location.tags',
          destField: 'location.tags',
          fn: _flattenTags( instance )
        } ], 
        _textFields( [ 
          'location.description', 'location.access'
        ], languages ), _extendMapping( instance, includePrivateData ) )

        .filter( f => {

          if ( typeof f !== 'object' ) return true;

          if ( typeof utils.isArray( f ) ) return true;

          if ( f.type === 'private' && !includePrivateData ) return false;

          return true;

        } );

      return map;

    }


  }

  function _extractValue( values, field ) {

    var fieldNames = field.split( '.' ),

    value = values;

    fieldNames.forEach( function( name ) {

      if ( value === null ) return;

      if ( value === undefined ) return;

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

  var amendment = [],

  customFields = agenda.getCustomFieldsConfig();

  customFields.forEach( function( cField ) {

    if ( includePrivateData || ( cField.type !== 'private' ) ) {

      amendment.push( [ cField.name, 'customValues.' + cField.name ] );

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


function _defineTimings( lang ) {

  let today = new Date();

  return function( timings ) {

    moment.locale( lang );

    return timings

    .map( t => {

      let d = moment.tz( t.start, t.timezone ).format( 'dddd Do MMMM' ) + ( today.getUTCFullYear() !== parseInt( t.start.substr( 0, 4 ) ) ? ' ' + t.start.substr( 0, 4 ) : '' ),

      start = moment.tz( t.start, t.timezone ).format( 'HH:mm' ),

      end = moment.tz( t.end, t.timezone ).format( 'HH:mm' );

      if ( lang == 'fr' ) {

        return d + ' - ' + start.replace( ':', 'h' ) + ' à ' + end.replace( ':', 'h' );

      } else {

        return d + ' - ' + start + ' to ' + end;

      }

    } ).join( '\n' );

  }

}


function _defineEventUrl( instance ) {

  return function( slug ) {

    return genUrl( 'agendaEventShow', { 
      slug: instance.slug, 
      eventSlug: slug 
    } );

  }

}


function _defineAccessibility( lang ) {

  let labelCodes = {
    mi: 'motorImpairment',
    hi: 'hearingImpairment',
    pi: 'mentalImpairment',
    vi: 'visualImpairment',
    sl: 'signLanguage'
  }

  return function( codes ) {

    if ( !codes || !utils.isArray( codes ) ) return '';

    return codes.map( c => {

      return accessibilityLabels[ labelCodes[ c ] ][ lang ];

    } ).join( ', ' );

  }

}


function _flattenTags( instance ) {

  return function( tags ) {

    if ( !tags ) return '';

    return tags.map( t => t.label ).join( ', ' );

  }

}


function _extractCategory( c ) {

  return c.label;

}


function _state( lang ) {

  return s => {

    if ( !s || !s.length ) return s;

    return stateLabels[ s ][ lang ];

  }

}



function _extractGroupTags( group ) {

  let groupSlugs = group.tags.map( t => t.slug );

  return tags => {

    if ( !utils.isArray( tags ) ) {

      return '';

    }

    return tags

    .filter( t => groupSlugs.indexOf( t.slug ) !== -1 )

    .map( t => t.label ).join( ', ' )

  }

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