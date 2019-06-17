"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );

const agendaLocations = require( '@openagenda/agenda-locations' );
const log = require( '@openagenda/logs' )( 'services/agendaLocations/tasks/resyncAllAgendaLocations' );

const resync = promisify( agendaLocations.resync );

module.exports = async function( knex ) {

  let agendaId = 99999999;

  while ( agendaId = await knex( 'review' )
    .first( [ 'id' ] )
    .where( 'id', '<', agendaId )
    .orderBy( 'id', 'desc' )
    .then( r => _.get( r, 'id' ) )
  ) {

    log( 'info', 'processing agenda id %s', agendaId );

    const result = await resync( agendaId );

    log( 'info', 'done processing agenda id %s', agendaId, result );

  }

}
