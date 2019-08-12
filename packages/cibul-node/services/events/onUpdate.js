"use strict";

const log = require( '@openagenda/logs' )( 'events/onUpdate' );
const eventSearch = require( '../eventSearch' );
const controlDataSvc = require( '../legacy' ).controlData;

const createActivity = require( './lib/createActivity' );

module.exports = async ( before, after, context ) => {
  log( 'info', 'updated event %s', after.uid, { context } );

  if ( after.draft ) return;

  eventSearch.events.batch.update( after, context ); // context should have agendaUid && updateSearchIndex options

  try {
    await createActivity( before, after, context );
  } catch ( e ) {
    log( 'error', 'failed to create activity', err );
  }

  try {
    await controlDataSvc.queue( 'batch', after );
  } catch ( e ) {
    log( 'error', 'failed batch update of control data', e );
  }

}
