"use strict";

const logger = require( '@openagenda/logs' );

let knex, schemas, log = () => {};

module.exports = Object.assign( column, { init, get } );

function column( schema, agendaId, columnName, value, cb ) {

  // schema is optional.
  if ( arguments.length === 4 ) {

    cb = arguments[ 3 ];
    value = arguments[ 2 ];
    columnName = arguments[ 1 ];
    agendaId = arguments[ 0 ];
    schema = schemas.agenda;

  }

  if ( !knex ) return cb( 'legacy column not inited' );

  log( 'updating column %s of schema %s at id %s', columnName, schema, agendaId );

  let updateData = {};

  updateData[ columnName ] = value;

  knex( schema )

  .where( { id: agendaId } )

  .update( updateData )

  .then( affected => {

    cb( null, { affected } );

  }, cb );

}


function get( agendaId, columnName, cb ) {

  if ( !knex ) return cb( 'legacy column not inited' );

  knex( schemas.agenda )

  .select( columnName )

  .where( { id: agendaId } )

  .then( rows => {

    cb( null, rows.length ? rows[ 0 ][ columnName ] : null );

  }, cb );

}


function init( s, k ) {

  knex = k;

  schemas = s;

  log = logger( 'agendas service.legacy.column' );

}