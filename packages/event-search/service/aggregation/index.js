"use strict";

const _ = require( 'lodash' );

const fs = require( 'fs' );

const termsTemplate = _.template( fs.readFileSync( __dirname + '/terms.tpl', 'utf-8' ) );

const types = {
  terms: {
    validate: require( './terms.validator' ),
    template: termsTemplate
  },
  timings: {
    parse: require( './timings.parse' ),
    validate: require( './timings.validator' ),
    template: _.template( fs.readFileSync( __dirname + '/timings.tpl', 'utf-8' ) )
  },
  timingsReverseHits: {
    parse: require( './timingsReverseHits.parse' ),
    validate: require( './timingsReverseHits.validator' ),
    template: _.template( fs.readFileSync( __dirname + '/timingsReverseHits.tpl', 'utf-8' ) )
  },
  timespan: {
    parse: require( './timespan.parse' ),
    template: _.template( fs.readFileSync( __dirname + '/timespan.tpl', 'utf-8' ) )
  },
  objectsAsTerms: {
    validate: require( './terms.validator' ),
    template: termsTemplate,
    parse: require( './objectsAsTerms.parse' )
  }
}

module.exports = _.extend( buildDsl, {
  parseResult
} );


function buildDsl( aggregators = [], predefined = {}, query = {} ) {

  let dsl = {};

  [].concat( aggregators ).map( _cleanAggregatorConfiguration.bind( null, predefined, query ) )

    .forEach( ( { type, field, destination, data } ) => {

      // simple template
      dsl[ destination ] = JSON.parse( types[ type ].template( data ) );

    } );

  return dsl;

}

function parseResult( aggregators, result, predefined = {}, parseEvents = null ) {

  let parsed = {};

  [].concat( aggregators ).map( _cleanAggregatorConfiguration.bind( null, predefined, {} ) ).forEach( ( { type, field, destination, data } ) => {

    const parse = types[ type ].parse || _defaultParse.bind( null, destination );

    parsed[ destination ] =  parse( result[ destination ] );

    if ( !parsed[ destination ].length || !parsed[ destination ][ 0 ].sampleEvents || !parseEvents ) return;

    parsed[ destination ].forEach( b => {

      b.sampleEvents = parseEvents( b.sampleEvents );

    } );

  } );

  return parsed;

}

function _defaultParse( fieldName, result ) {

   return result.buckets.map( b => ( { key: b.key, count: b.doc_count } ) );

}


function _cleanAggregatorConfiguration( predefined = {}, query = {}, a ) {

  let aObj, type, field, destination, data;

  if ( typeof a !== 'string' ) {

    aObj = a;

  } else if ( predefined[ a ] !== undefined ) {

    aObj = predefined[ a ];

  } else {

    aObj = {
      type: 'terms',
      field: a,
      destination: a,
      data: { 
        type: a, 
        field: a
      }
    }

  }

  type = aObj.type || 'terms';

  field = aObj.field || aObj.type;

  destination = aObj.destination || aObj.field || aObj.type;

  data = _.extend( {}, aObj, { type, field, query } );

  return { 
    type,
    field,
    destination,
    data: types[ type ].validate ? types[ type ].validate( data ) : data,
    query
  };

}
