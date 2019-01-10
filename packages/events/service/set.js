"use strict";

const logger = require( '@openagenda/logs' ),

  create = require( './create' ),

  update = require( './update' );

let schemas, service, knex, config, log;

module.exports = Object.assign( set, { init } );

function set( identifiers, data, options, cb ) {

  console.log( 'DEPRECATED - use create or update' );

  if ( _areIdentifiers( identifiers ) ) {

    update( identifiers, data, options, cb );

  } else {

    create( identifiers, data, options );

  }

}


function init( svc, c ) {

  service = svc;

  schemas = c.schemas;

  knex = c.knex;

  config = c;

  log = logger( 'events service/set' );

}


function _areIdentifiers( identifiers ) {

  if ( typeof identifiers === 'number' ) {

    return true;

  }

  if ( typeof identifiers === 'string' ) {

    return true;

  }

  let otherKeys = [], idKeys = [];

  Object.keys( identifiers ).forEach( k => {

    ( ( [ 'id', 'uid', 'slug' ].indexOf( k ) === -1 ) ? otherKeys : idKeys ).push( k )

  } );

  if ( !idKeys.length ) return false;

  if ( otherKeys.length ) return false;

  return true;

}
