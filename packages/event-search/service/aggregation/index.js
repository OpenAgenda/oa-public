"use strict";

const _ = require( 'lodash' );

const fs = require( 'fs' );

const types = {
  terms: {
    validate: require( './terms.validator' ),
    template: _.template( fs.readFileSync( __dirname + '/terms.tpl', 'utf-8' ) )
  },
  timings: {
    parse: require( './timings.parse' ),
    validate: require( './timings.validator' ),
    template: _.template( fs.readFileSync( __dirname + '/timings.tpl', 'utf-8' ) )
  }
}

module.exports = _.extend( buildDsl, {
  parseResult
} );

function buildDsl( aggregators = [] ) {

  let dsl = {};

  aggregators.forEach( a => {

    let clean = types[ a.type ].validate( a );

    // simple template

    dsl[ clean.field ] = JSON.parse( types[ a.type ].template( clean ) );

  } );

  return dsl;

}

function parseResult( aggregators, result ) {

  let parsed = {};

  aggregators.forEach( a => {

    const fieldName = types[ a.type ].validate( a ).field,

      parse = types[ a.type ].parse || _defaultParse.bind( null, fieldName );

    parsed[ fieldName ] =  parse( result[ fieldName ] );

  } );

  return parsed;

}

function _defaultParse( fieldName, result ) {

   return result.buckets.map( b => ( { key: b.key, count: b.doc_count } ) );

}