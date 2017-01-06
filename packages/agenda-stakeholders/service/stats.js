"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const logger = require( 'basic-logger' );
const types = require( '../iso/credentialTypes' );

module.exports = _.extend( stats, { init } );

// service globals
let log, schemas, knex;


function stats( preFilter, cb ) {

  w( {
    query: preFilter,
    knex: knex( schemas.stakeholder ),
    result: {
      total: 0,
      credentialTotals: {}  
    }
  } )

  .then( _credentialTotals )

  .then( _total )

  .done( v => {

    cb( null, v.result );

  }, cb );

}

function _credentialTotals( v ) {

  return v.knex

    .select( 'credential' )

    .count( 'id' )

    .where( 'review_id', v.query.agendaId )

    .groupBy( 'credential' )

  .then( rows => {

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

}