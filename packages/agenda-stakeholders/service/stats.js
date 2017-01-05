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
      credentialTotals: {}  
    }
  } )

  .then( _credentialTotals )

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


function init( config ) {

  log = logger( 'stats' );

  log( 'initing' );

  schemas = config.schemas;

  knex = config.knex;

}