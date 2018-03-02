"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const w = require( 'when' );

module.exports = Object.assign( stats, { init } );

let knex, legacyKnex, schemas, service, legacySchemas;

function stats( cb ) {

  w( {
    total: null,
    legacy: {
      total: null
    }
  } )

  .then( _getTotal( legacyKnex, legacySchemas.event, 'legacy.total' ) )

  .then( _getTotal( knex, schemas.event, 'total' ) )

  .done( v => cb( null, v ), cb );

}


function _getTotal( k, schema, target ) {

  return v => k( schema ).count( 'id as total' )

  .then( rows => {

    v = _.set( v, target, rows[ 0 ].total );

    return v;

  } );

}


function init( svc, c ) {

  knex = c.knex;

  schemas = c.schemas;

  legacyKnex = knexLib( {
    client: 'mysql',
    connection: c.mysql
  } );

  knex = c.knex;

  service = svc;

  legacySchemas = c.legacy.schemas;

}