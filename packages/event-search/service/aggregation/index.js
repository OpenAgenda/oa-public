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
  objectsAsTerms: {
    validate: require( './terms.validator' ),
    template: termsTemplate,
    parse: require( './objectsAsTerms.parse' )
  }
}

module.exports = _.extend( buildDsl, {
  parseResult
} );


function buildDsl( aggregators = [], predefined = {} ) {

  let dsl = {};

  [].concat( aggregators ).map( _cleanAggregatorConfiguration.bind( null, predefined ) )

    .forEach( ( { type, field, destination, data } ) => {

      // simple template

      dsl[ destination ] = JSON.parse( types[ type ].template( data ) );

    } );

  return dsl;

}

function parseResult( aggregators, result, predefined = {} ) {

  let parsed = {};

  [].concat( aggregators ).map( _cleanAggregatorConfiguration.bind( null, predefined ) ).forEach( ( { type, field, destination, data } ) => {

    const parse = types[ type ].parse || _defaultParse.bind( null, destination );

    parsed[ destination ] =  parse( result[ destination ] );

  } );

  return parsed;

}

function _defaultParse( fieldName, result ) {

   return result.buckets.map( b => ( { key: b.key, count: b.doc_count } ) );

}


function _cleanAggregatorConfiguration( predefined = {}, a ) {

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
      data: { type: a, field: a }
    }

  }

  type = aObj.type || 'terms';

  field = aObj.field || aObj.type;

  destination = aObj.destination || aObj.field || aObj.type;

  return { 
    type,
    field,
    destination,
    data: types[ type ].validate( _.extend( {}, aObj, { type, field } ) )
  };

}