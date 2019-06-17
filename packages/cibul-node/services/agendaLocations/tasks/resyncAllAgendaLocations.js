"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );

const agendaLocations = require( '@openagenda/agenda-locations' );
const log = require( '@openagenda/logs' )( 'services/agendaLocations/tasks/resyncAllAgendaLocations' );

const resync = promisify( agendaLocations.resync );

module.exports = async function( knex, startFromId ) {

  console.log(startFromId);

  let agenda = {
    id: startFromId || 99999999
  }

  while ( agenda = await knex( 'review' )
    .first( [ 'id', 'slug' ] )
    .where( 'id', '<', agenda.id )
    .orderBy( 'id', 'desc' ) ) {

      try {

        log( 'info', 'processing agenda %s', agenda.slug );

        const result = await resync( agenda.id );

        log( 'info', 'done processing agenda %s, (%s)', agenda.slug, agenda.id, result );

      } catch ( e ) {

        log( 'error', 'failed processing agenda %s, (%s)', agenda.slug, agenda.id, e );

      }

    }

}
