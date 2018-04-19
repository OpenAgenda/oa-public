"use strict";

const _ = require( 'lodash' ),

  w = require( 'when' ),

  logger = require( '@openagenda/basic-logger' ),

  types = require( '../iso/credentialTypes' ),

  evaluateCredentialFilter = require( './lib/evaluateCredentialFilter' );

module.exports = _.extend( stats, { init } );

// service globals
let log, schemas, knex, interfaces;


function stats( preFilter, cb ) {

  w( {
    query: preFilter,
    knex: knex( schemas.stakeholder ),
    result: {
      total: 0,
      credentialTotals: {}
    }
  } )

  .then( evaluateCredentialFilter.bind( null, interfaces ) )

  .then( _credentialTotals )

  .then( _total )

  .done( v => {

    cb( null, v.result );

  }, cb );

}

function _credentialTotals( v ) {

  let k = v.knex

    .select( 'credential' )

    .count( 'id' )

    .where( 'review_id', v.query.agendaId )

    .groupBy( 'credential' );

  if ( v.query.credentials ) {

    k.whereIn( 'credential', v.query.credentials );

  }

  return k.then( rows => {

    rows.forEach( r => {

      v.result.credentialTotals[ types.codes.get( r.credential ) ] = r[ 'count(`id`)' ];

    } );

    return v;

  } );

}

function _total( v ) {

  v.result.total = 0;

  Object.keys( v.result.credentialTotals ).forEach( t => v.result.total += v.result.credentialTotals[ t ] );

  return v;

}


function init( config ) {

  log = logger( 'stats' );

  log( 'initing' );

  schemas = config.schemas;

  knex = config.knex;

  interfaces = config.interfaces;

}